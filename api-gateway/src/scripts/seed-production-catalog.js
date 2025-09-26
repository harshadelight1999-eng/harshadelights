/**
 * Production Catalog Seeder - Diwali Product Collection
 * Seeds the production database with ready-to-sell Diwali products
 */

const { logger } = require('../utils/logger');

async function seedDiwaliCatalog(db) {
  try {
    logger.info('🎉 Starting Diwali product catalog seeding...');

    // Check if products already exist
    const existingProducts = await db('products').count('id as count').first();
    if (existingProducts.count > 0) {
      logger.info(`⚠️  Database already contains ${existingProducts.count} products - skipping seed`);
      return { seeded: 0, skipped: existingProducts.count };
    }

    // Diwali product catalog
    const diwaliProducts = [
      {
        id: 'p-dw-001',
        title: 'Premium Kaju Katli',
        description: 'Traditional silver-foil covered cashew fudge, perfect for Diwali gifting',
        status: 'active',
        category_assignments: ['traditional-sweets'],
        variants: [
          { title: '250g Box', price: 450, compare_at_price: 500, inventory_quantity: 100 },
          { title: '500g Box', price: 850, compare_at_price: 950, inventory_quantity: 75 },
          { title: '1kg Gift Box', price: 1600, compare_at_price: 1800, inventory_quantity: 50 }
        ]
      },
      {
        id: 'p-dw-002', 
        title: 'Motichoor Ladoo',
        description: 'Soft, melt-in-mouth ladoos made with fine gram flour pearls',
        status: 'active',
        category_assignments: ['traditional-sweets'],
        variants: [
          { title: '12 pieces', price: 320, compare_at_price: 360, inventory_quantity: 80 },
          { title: '24 pieces', price: 600, compare_at_price: 680, inventory_quantity: 60 }
        ]
      },
      {
        id: 'p-dw-003',
        title: 'Gulab Jamun',
        description: 'Classic milk solid dumplings in aromatic sugar syrup',
        status: 'active', 
        category_assignments: ['traditional-sweets'],
        variants: [
          { title: '1kg Container', price: 380, compare_at_price: 420, inventory_quantity: 90 },
          { title: '2kg Family Pack', price: 720, compare_at_price: 800, inventory_quantity: 45 }
        ]
      },
      {
        id: 'p-dw-004',
        title: 'Assorted Dry Fruits Gift Box',
        description: 'Premium selection of almonds, cashews, pistachios, and dates',
        status: 'active',
        category_assignments: ['dry-fruits'],
        variants: [
          { title: '500g Mix', price: 1200, compare_at_price: 1350, inventory_quantity: 70 },
          { title: '1kg Premium Mix', price: 2300, compare_at_price: 2500, inventory_quantity: 40 }
        ]
      },
      {
        id: 'p-dw-005',
        title: 'Chocolate Barfi Fusion',
        description: 'Modern twist on traditional barfi with premium Belgian chocolate',
        status: 'active',
        category_assignments: ['premium-chocolates', 'traditional-sweets'],
        variants: [
          { title: '300g Box', price: 650, compare_at_price: 720, inventory_quantity: 55 },
          { title: '600g Gift Set', price: 1250, compare_at_price: 1400, inventory_quantity: 30 }
        ]
      },
      {
        id: 'p-dw-006',
        title: 'Namkeen Celebration Mix',
        description: 'Crunchy mix of sev, gathiya, and spiced nuts - perfect for Diwali parties',
        status: 'active',
        category_assignments: ['namkeens'],
        variants: [
          { title: '400g Pack', price: 180, compare_at_price: 200, inventory_quantity: 120 },
          { title: '800g Family Size', price: 340, compare_at_price: 380, inventory_quantity: 85 }
        ]
      },
      {
        id: 'p-dw-007',
        title: 'Rasgulla Special',
        description: 'Soft, spongy cottage cheese balls in cardamom-flavored syrup',
        status: 'active',
        category_assignments: ['traditional-sweets'],
        variants: [
          { title: '1kg Container', price: 350, compare_at_price: 390, inventory_quantity: 95 },
          { title: '2kg Party Pack', price: 680, compare_at_price: 750, inventory_quantity: 50 }
        ]
      },
      {
        id: 'p-dw-008',
        title: 'Premium Chocolate Collection',
        description: 'Handcrafted chocolates with Indian flavors - cardamom, rose, saffron',
        status: 'active',
        category_assignments: ['premium-chocolates'],
        variants: [
          { title: '250g Assorted', price: 850, compare_at_price: 950, inventory_quantity: 40 },
          { title: '500g Luxury Box', price: 1650, compare_at_price: 1850, inventory_quantity: 25 }
        ]
      },
      {
        id: 'p-dw-009',
        title: 'Diwali Hamper Supreme',
        description: 'Complete Diwali celebration package with sweets, dry fruits, and chocolates',
        status: 'active',
        category_assignments: ['traditional-sweets', 'dry-fruits', 'premium-chocolates'],
        variants: [
          { title: 'Standard Hamper', price: 2500, compare_at_price: 2800, inventory_quantity: 30 },
          { title: 'Premium Hamper', price: 4500, compare_at_price: 5000, inventory_quantity: 15 }
        ]
      },
      {
        id: 'p-dw-010',
        title: 'Soan Papdi Delight',
        description: 'Flaky, layered sweet with cardamom and pistachio garnish',
        status: 'active',
        category_assignments: ['traditional-sweets'],
        variants: [
          { title: '400g Box', price: 280, compare_at_price: 320, inventory_quantity: 110 },
          { title: '800g Gift Pack', price: 520, compare_at_price: 600, inventory_quantity: 65 }
        ]
      }
    ];

    logger.info(`📦 Seeding ${diwaliProducts.length} Diwali products...`);

    let seededCount = 0;
    let variantCount = 0;

    for (const productData of diwaliProducts) {
      try {
        // Create product
        const [product] = await db('products').insert({
          id: productData.id,
          title: productData.title,
          description: productData.description,
          status: productData.status,
          created_at: new Date(),
          updated_at: new Date()
        }).returning('*');

        logger.info(`✅ Created product: ${product.title}`);

        // Create variants
        for (const variantData of productData.variants) {
          await db('product_variants').insert({
            id: `${product.id}-v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            product_id: product.id,
            title: variantData.title,
            price: variantData.price,
            compare_at_price: variantData.compare_at_price,
            inventory_quantity: variantData.inventory_quantity,
            created_at: new Date(),
            updated_at: new Date()
          });
          variantCount++;
        }

        // Create category assignments
        for (const categoryName of productData.category_assignments) {
          // Find or create category
          let category = await db('categories').where('name', categoryName).first();
          if (!category) {
            [category] = await db('categories').insert({
              id: `cat-${categoryName}`,
              name: categoryName,
              status: 'active',
              created_at: new Date(),
              updated_at: new Date()
            }).returning('*');
          }

          // Create assignment
          await db('product_category_assignments').insert({
            product_id: product.id,
            category_id: category.id,
            created_at: new Date()
          });
        }

        seededCount++;
        
      } catch (error) {
        logger.error(`❌ Failed to seed product ${productData.title}:`, error);
      }
    }

    logger.info(`🎉 Diwali catalog seeding complete!`);
    logger.info(`📊 Seeded: ${seededCount} products, ${variantCount} variants`);

    return { seeded: seededCount, variants: variantCount };

  } catch (error) {
    logger.error('💥 Diwali catalog seeding failed:', error);
    throw error;
  }
}

module.exports = { seedDiwaliCatalog };