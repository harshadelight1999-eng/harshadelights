/**
 * Categories API Routes for Harsha Delights
 * Handles product category management and hierarchy
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

// Import database
const { getApiGatewayDB } = require('../config/database');

// Configure multer for category image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/categories');
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
    fileSize: 2 * 1024 * 1024, // 2MB limit for category images
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
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories with hierarchy
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: string
 *         description: Filter by parent category ID (null for root categories)
 *       - in: query
 *         name: include_products
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include product count for each category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *     responses:
 *       200:
 *         description: Categories list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/',
  rateLimitMiddleware.standardRateLimit(),
  [
    query('parent_id').optional().isUUID(),
    query('include_products').optional().isBoolean().toBoolean(),
    query('status').optional().isIn(['active', 'inactive'])
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const { 
        parent_id, 
        include_products = false, 
        status = 'active' 
      } = req.query;

      let query = db('categories')
        .select('categories.*');

      // Add product count if requested
      if (include_products) {
        query = query.select(
          db.raw('COUNT(DISTINCT product_categories.product_id) as product_count')
        )
        .leftJoin('product_categories', 'categories.id', 'product_categories.category_id')
        .leftJoin('products', function() {
          this.on('product_categories.product_id', '=', 'products.id')
              .andOn('products.status', '=', db.raw('?', ['active']));
        })
        .groupBy('categories.id');
      }

      // Filter by status
      if (status) {
        query = query.where('categories.is_active', status === 'active');
      }

      // Filter by parent
      if (parent_id === 'null' || parent_id === null) {
        query = query.whereNull('categories.parent_id');
      } else if (parent_id) {
        query = query.where('categories.parent_id', parent_id);
      }

      const categories = await query
        .orderBy('categories.sort_order', 'asc')
        .orderBy('categories.name', 'asc');

      // If no parent filter, build hierarchy
      if (!parent_id) {
        const categoriesWithChildren = await buildCategoryHierarchy(categories);
        return res.json({
          success: true,
          categories: categoriesWithChildren
        });
      }

      res.json({
        success: true,
        categories
      });

    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: include_products
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/:id',
  rateLimitMiddleware.standardRateLimit(),
  [
    param('id').isUUID().withMessage('Invalid category ID'),
    query('include_products').optional().isBoolean().toBoolean()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const { id } = req.params;
      const { include_products = false } = req.query;

      let query = db('categories')
        .select('categories.*')
        .where('categories.id', id)
        .where('categories.is_active', true);

      if (include_products) {
        query = query.select(
          db.raw('COUNT(DISTINCT product_categories.product_id) as product_count')
        )
        .leftJoin('product_categories', 'categories.id', 'product_categories.category_id')
        .leftJoin('products', function() {
          this.on('product_categories.product_id', '=', 'products.id')
              .andOn('products.status', '=', db.raw('?', ['active']));
        })
        .groupBy('categories.id');
      }

      const category = await query.first();

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Get children categories
      const children = await db('categories')
        .select('*')
        .where('parent_id', id)
        .where('is_active', true)
        .orderBy('sort_order', 'asc')
        .orderBy('name', 'asc');

      category.children = children;

      res.json({
        success: true,
        category
      });

    } catch (error) {
      logger.error('Get category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, handle]
 *             properties:
 *               name:
 *                 type: string
 *               handle:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post('/',
  authMiddleware.authenticate(),
  authMiddleware.authorizeRole(['administrator', 'manager']),
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('handle').notEmpty().withMessage('Category handle is required'),
    body('description').optional().isString(),
    body('parent_id').optional().isUUID(),
    body('sort_order').optional().isInt({ min: 0 }).toInt(),
    body('is_active').optional().isBoolean().toBoolean()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const {
        name,
        handle,
        description,
        parent_id,
        sort_order = 0,
        is_active = true
      } = req.body;

      // Check if handle already exists
      const existingCategory = await db('categories')
        .where('handle', handle)
        .first();

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category handle already exists'
        });
      }

      // Prepare category data
      const categoryData = {
        id: db.raw('gen_random_uuid()'),
        name,
        handle,
        description,
        parent_id: parent_id || null,
        sort_order,
        is_active,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Add image URL if uploaded
      if (req.file) {
        categoryData.image = `/uploads/categories/${req.file.filename}`;
      }

      const [category] = await db('categories')
        .insert(categoryData)
        .returning('*');

      res.status(201).json({
        success: true,
        category
      });

    } catch (error) {
      logger.error('Create category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create category'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               handle:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.put('/:id',
  authMiddleware.authenticate(),
  authMiddleware.authorizeRole(['administrator', 'manager']),
  upload.single('image'),
  [
    param('id').isUUID(),
    body('name').optional().notEmpty(),
    body('handle').optional().notEmpty(),
    body('description').optional().isString(),
    body('parent_id').optional().isUUID(),
    body('sort_order').optional().isInt({ min: 0 }).toInt(),
    body('is_active').optional().isBoolean().toBoolean()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const { id } = req.params;

      // Check if category exists
      const existingCategory = await db('categories')
        .where('id', id)
        .first();

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Prepare update data
      const updateData = {
        updated_at: new Date()
      };

      // Add fields that are provided
      const allowedFields = ['name', 'handle', 'description', 'parent_id', 'sort_order', 'is_active'];
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // Add image URL if uploaded
      if (req.file) {
        updateData.image = `/uploads/categories/${req.file.filename}`;
      }

      // Check handle uniqueness if being updated
      if (updateData.handle && updateData.handle !== existingCategory.handle) {
        const handleExists = await db('categories')
          .where('handle', updateData.handle)
          .where('id', '!=', id)
          .first();

        if (handleExists) {
          return res.status(400).json({
            success: false,
            error: 'Category handle already exists'
          });
        }
      }

      const [category] = await db('categories')
        .where('id', id)
        .update(updateData)
        .returning('*');

      res.json({
        success: true,
        category
      });

    } catch (error) {
      logger.error('Update category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update category'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Category has associated products or subcategories
 *       404:
 *         description: Category not found
 */
router.delete('/:id',
  authMiddleware.authenticate(),
  authMiddleware.authorizeRole(['administrator']),
  [
    param('id').isUUID()
  ],
  validationMiddleware.validate,
  async (req, res) => {
    try {
      const db = getApiGatewayDB();
      const { id } = req.params;

      // Check if category exists
      const category = await db('categories')
        .where('id', id)
        .first();

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Check for associated products
      const productCount = await db('product_categories')
        .where('category_id', id)
        .count('* as count')
        .first();

      if (parseInt(productCount.count) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete category with associated products'
        });
      }

      // Check for subcategories
      const subcategoryCount = await db('categories')
        .where('parent_id', id)
        .count('* as count')
        .first();

      if (parseInt(subcategoryCount.count) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete category with subcategories'
        });
      }

      // Delete category
      await db('categories')
        .where('id', id)
        .del();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });

    } catch (error) {
      logger.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category'
      });
    }
  }
);

/**
 * Helper function to build category hierarchy
 */
async function buildCategoryHierarchy(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // Create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Build hierarchy
  categories.forEach(category => {
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(categoryMap.get(category.id));
      }
    } else {
      rootCategories.push(categoryMap.get(category.id));
    }
  });

  return rootCategories;
}

module.exports = router;