/**
 * Products API Routes for Harsha Delights
 * Handles product catalog management, inventory, and pricing
 */

const express = require('express');
const { logger } = require('../utils/logger');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { body, query, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Import database and services
const { getApiGatewayDB } = require('../config/database');
const ErpNextService = require('../services/ErpNextService');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Product ID
 *         title:
 *           type: string
 *           description: Product title
 *         description:
 *           type: string
 *           description: Product description
 *         handle:
 *           type: string
 *           description: URL-friendly product handle
 *         status:
 *           type: string
 *           enum: [active, inactive, draft]
 *         thumbnail:
 *           type: string
 *           description: Main product image URL
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     ProductVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         sku:
 *           type: string
 *         price:
 *           type: number
 *         compare_at_price:
 *           type: number
 *         inventory_quantity:
 *           type: integer
 *         weight:
 *           type: number
 *         weight_unit:
 *           type: string
 *           enum: [g, kg, lb, oz]
 *     
 *     ProductImage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         url:
 *           type: string
 *         alt:
 *           type: string
 *         sort_order:
 *           type: integer
 *     
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         handle:
 *           type: string
 *         description:
 *           type: string
 *         parent_id:
 *           type: string
 *         image:
 *           type: string
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get products list with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category handle
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product title and description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, draft]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *     responses:
 *       200:
 *         description: Products list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 */
router.get('/',
  rateLimitMiddleware.standardRateLimit(),
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isString().trim(),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(['active', 'inactive', 'draft']),
    query('featured').optional().isBoolean().toBoolean()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const { 
        page = 1, 
        limit = 20, 
        category, 
        search, 
        status = 'active',
        featured 
      } = req.query;

      // Build query
      let query = db('products')
        .select(
          'products.*',
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', variants.id, \'title\', variants.title, \'sku\', variants.sku, \'price\', variants.price, \'compare_at_price\', variants.compare_at_price, \'inventory_quantity\', variants.inventory_quantity, \'weight\', variants.weight, \'weight_unit\', variants.weight_unit)) as variants'),
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', categories.id, \'name\', categories.name, \'handle\', categories.handle)) FILTER (WHERE categories.id IS NOT NULL) as categories'),
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', images.id, \'url\', images.url, \'alt\', images.alt, \'sort_order\', images.sort_order)) FILTER (WHERE images.id IS NOT NULL) as images')
        )
        .leftJoin('product_variants as variants', 'products.id', 'variants.product_id')
        .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
        .leftJoin('categories', 'product_categories.category_id', 'categories.id')
        .leftJoin('product_images as images', 'products.id', 'images.product_id')
        .where('products.status', status)
        .groupBy('products.id');

      // Apply filters
      if (category) {
        query = query.whereExists(
          db('product_categories')
            .join('categories', 'product_categories.category_id', 'categories.id')
            .where('categories.handle', category)
            .where('product_categories.product_id', db.raw('products.id'))
        );
      }

      if (search) {
        query = query.where(function() {
          this.where('products.title', 'ilike', `%${search}%`)
              .orWhere('products.description', 'ilike', `%${search}%`);
        });
      }

      if (featured !== undefined) {
        query = query.where('products.is_featured', featured);
      }

      // Get total count
      const countQuery = db('products')
        .count('* as total')
        .where('products.status', status);

      if (category) {
        countQuery.whereExists(
          db('product_categories')
            .join('categories', 'product_categories.category_id', 'categories.id')
            .where('categories.handle', category)
            .where('product_categories.product_id', db.raw('products.id'))
        );
      }

      if (search) {
        countQuery.where(function() {
          this.where('products.title', 'ilike', `%${search}%`)
              .orWhere('products.description', 'ilike', `%${search}%`);
        });
      }

      if (featured !== undefined) {
        countQuery.where('products.is_featured', featured);
      }

      // Execute queries
      const [products, countResult] = await Promise.all([
        query
          .orderBy('products.created_at', 'desc')
          .limit(limit)
          .offset((page - 1) * limit),
        countQuery.first()
      ]);

      const total = parseInt(countResult.total);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        products: products || [],
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages
        }
      });

    } catch (error) {
      logger.error('Get products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 12
 *     responses:
 *       200:
 *         description: Featured products
 */
router.get('/featured',
  rateLimitMiddleware.standardRateLimit(),
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const { limit = 12 } = req.query;

      const products = await db('products')
        .select(
          'products.*',
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', variants.id, \'title\', variants.title, \'sku\', variants.sku, \'price\', variants.price, \'compare_at_price\', variants.compare_at_price, \'inventory_quantity\', variants.inventory_quantity)) as variants'),
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', categories.id, \'name\', categories.name, \'handle\', categories.handle)) FILTER (WHERE categories.id IS NOT NULL) as categories'),
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', images.id, \'url\', images.url, \'alt\', images.alt)) FILTER (WHERE images.id IS NOT NULL) as images')
        )
        .leftJoin('product_variants as variants', 'products.id', 'variants.product_id')
        .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
        .leftJoin('categories', 'product_categories.category_id', 'categories.id')
        .leftJoin('product_images as images', 'products.id', 'images.product_id')
        .where('products.status', 'active')
        .where('products.is_featured', true)
        .groupBy('products.id')
        .orderBy('products.featured_order', 'asc')
        .orderBy('products.created_at', 'desc')
        .limit(limit);

      res.json({
        success: true,
        products: products || []
      });

    } catch (error) {
      logger.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch featured products'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id',
  rateLimitMiddleware.standardRateLimit(),
  [
    param('id').isUUID().withMessage('Invalid product ID')
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const { id } = req.params;

      const product = await db('products')
        .select(
          'products.*',
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', variants.id, \'title\', variants.title, \'sku\', variants.sku, \'price\', variants.price, \'compare_at_price\', variants.compare_at_price, \'inventory_quantity\', variants.inventory_quantity, \'weight\', variants.weight, \'weight_unit\', variants.weight_unit)) as variants'),
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', categories.id, \'name\', categories.name, \'handle\', categories.handle)) FILTER (WHERE categories.id IS NOT NULL) as categories'),
          db.raw('json_agg(DISTINCT jsonb_build_object(\'id\', images.id, \'url\', images.url, \'alt\', images.alt, \'sort_order\', images.sort_order)) FILTER (WHERE images.id IS NOT NULL) as images')
        )
        .leftJoin('product_variants as variants', 'products.id', 'variants.product_id')
        .leftJoin('product_categories', 'products.id', 'product_categories.product_id')
        .leftJoin('categories', 'product_categories.category_id', 'categories.id')
        .leftJoin('product_images as images', 'products.id', 'images.product_id')
        .where('products.id', id)
        .where('products.status', 'active')
        .groupBy('products.id')
        .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        product
      });

    } catch (error) {
      logger.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, handle]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               handle:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft]
 *               is_featured:
 *                 type: boolean
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  authMiddleware.authenticate(),
  authMiddleware.authorizeRole(['administrator', 'manager']),
  upload.array('images', 10),
  [
    body('title').notEmpty().withMessage('Product title is required'),
    body('description').notEmpty().withMessage('Product description is required'),
    body('handle').notEmpty().withMessage('Product handle is required'),
    body('status').optional().isIn(['active', 'inactive', 'draft']),
    body('is_featured').optional().isBoolean()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    const db = getApiGatewayDB();
    const trx = await db.transaction();

    try {
      const {
        title,
        description,
        handle,
        status = 'draft',
        is_featured = false,
        variants = [],
        categories = [],
        tags = []
      } = req.body;

      // Create product
      const [product] = await trx('products')
        .insert({
          id: db.raw('gen_random_uuid()'),
          title,
          description,
          handle,
          status,
          is_featured,
          tags: JSON.stringify(tags),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      // Create variants
      if (variants && variants.length > 0) {
        const variantData = variants.map(variant => ({
          id: db.raw('gen_random_uuid()'),
          product_id: product.id,
          title: variant.title || 'Default',
          sku: variant.sku,
          price: parseFloat(variant.price),
          compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
          inventory_quantity: parseInt(variant.inventory_quantity) || 0,
          weight: variant.weight ? parseFloat(variant.weight) : null,
          weight_unit: variant.weight_unit || 'g',
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('product_variants').insert(variantData);
      }

      // Link categories
      if (categories && categories.length > 0) {
        const categoryLinks = categories.map(categoryId => ({
          product_id: product.id,
          category_id: categoryId
        }));

        await trx('product_categories').insert(categoryLinks);
      }

      // Handle image uploads
      if (req.files && req.files.length > 0) {
        const imageData = req.files.map((file, index) => ({
          id: db.raw('gen_random_uuid()'),
          product_id: product.id,
          url: `/uploads/products/${file.filename}`,
          alt: `${title} - Image ${index + 1}`,
          sort_order: index + 1,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('product_images').insert(imageData);

        // Set first image as thumbnail
        if (imageData.length > 0) {
          await trx('products')
            .where('id', product.id)
            .update({ thumbnail: imageData[0].url });
        }
      }

      await trx.commit();

      res.status(201).json({
        success: true,
        product: {
          ...product,
          variants: variants || [],
          categories: categories || [],
          images: req.files ? req.files.map((file, index) => ({
            url: `/uploads/products/${file.filename}`,
            alt: `${title} - Image ${index + 1}`,
            sort_order: index + 1
          })) : []
        }
      });

    } catch (error) {
      await trx.rollback();
      logger.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/products/bulk-import:
 *   post:
 *     summary: Bulk import products from CSV
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               csv_file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Products imported successfully
 */
router.post('/bulk-import',
  authMiddleware.authenticate(),
  authMiddleware.authorizeRole(['administrator', 'manager']),
  multer({ dest: 'uploads/temp/' }).single('csv_file'),
  async (req, res) => {
    const db = getApiGatewayDB();
    
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'CSV file is required'
        });
      }

      const csvContent = await fs.readFile(req.file.path, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'CSV file must contain headers and at least one data row'
        });
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate required headers
      const requiredHeaders = ['title', 'description', 'handle', 'price', 'inventory_quantity'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required headers: ${missingHeaders.join(', ')}`
        });
      }
      
      const results = {
        total: 0,
        success: 0,
        errors: []
      };

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        results.total++;
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const rowData = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        const trx = await db.transaction();

        try {
          // Validate required fields
          if (!rowData.title || !rowData.description || !rowData.handle) {
            throw new Error('Missing required fields: title, description, or handle');
          }

          // Check if product already exists
          const existingProduct = await trx('products')
            .where('handle', rowData.handle)
            .first();

          if (existingProduct) {
            throw new Error(`Product with handle '${rowData.handle}' already exists`);
          }

          // Create product
          const [product] = await trx('products').insert({
            id: db.raw('gen_random_uuid()'),
            title: rowData.title,
            description: rowData.description,
            handle: rowData.handle,
            status: rowData.status || 'active',
            is_featured: (rowData.is_featured === 'true' || rowData.is_featured === '1'),
            created_at: new Date(),
            updated_at: new Date()
          }).returning('*');

          // Create default variant
          await trx('product_variants').insert({
            id: db.raw('gen_random_uuid()'),
            product_id: product.id,
            title: rowData.variant_title || 'Default',
            sku: rowData.sku || null,
            price: parseFloat(rowData.price) || 0,
            compare_at_price: rowData.compare_at_price ? parseFloat(rowData.compare_at_price) : null,
            inventory_quantity: parseInt(rowData.inventory_quantity) || 0,
            weight: rowData.weight ? parseFloat(rowData.weight) : null,
            weight_unit: rowData.weight_unit || 'g',
            created_at: new Date(),
            updated_at: new Date()
          });

          // Link to category if provided
          if (rowData.category) {
            const category = await trx('categories')
              .where('name', rowData.category)
              .orWhere('handle', rowData.category)
              .first();

            if (category) {
              await trx('product_categories').insert({
                product_id: product.id,
                category_id: category.id
              });
            }
          }

          await trx.commit();
          results.success++;
          
        } catch (error) {
          await trx.rollback();
          results.errors.push({
            row: i + 1,
            title: rowData.title || 'Unknown',
            error: error.message
          });
        }
      }

      // Clean up temp file
      await fs.unlink(req.file.path);

      res.json({
        success: true,
        results: {
          ...results,
          message: `Successfully imported ${results.success} out of ${results.total} products`
        }
      });

    } catch (error) {
      logger.error('Bulk import error:', error);
      
      // Clean up temp file if it exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Failed to clean up temp file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to import products'
      });
    }
  }
);

module.exports = router;