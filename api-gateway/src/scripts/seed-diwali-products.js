/**
 * Seed script for Diwali product catalog
 * Populates the database with real Diwali products for immediate launch
 */

const { getApiGatewayDB } = require('../config/database');
const { logger } = require('../utils/logger');

const diwaliProducts = [
  // Traditional Sweets
  {
    title: 'Premium Kaju Katli',
    handle: 'premium-kaju-katli',
    description: 'Handcrafted cashew diamonds made with pure ghee and garnished with silver leaf. A royal treat for Diwali celebrations.',
    status: 'active',
    is_featured: true,
    featured_order: 1,
    category: 'Traditional Sweets',
    variants: [
      { title: '250g Box', price: 450, inventory_quantity: 50, weight: 250, sku: 'HD-KK-250' },
      { title: '500g Box', price: 850, compare_at_price: 950, inventory_quantity: 30, weight: 500, sku: 'HD-KK-500' },
      { title: '1kg Box', price: 1600, compare_at_price: 1800, inventory_quantity: 20, weight: 1000, sku: 'HD-KK-1000' }
    ]
  },
  {
    title: 'Royal Gulab Jamun',
    handle: 'royal-gulab-jamun',
    description: 'Soft milk solids dumplings soaked in aromatic cardamom and rose water syrup. Perfect for festive occasions.',
    status: 'active',
    is_featured: true,
    featured_order: 2,
    category: 'Traditional Sweets',
    variants: [
      { title: '12 pieces', price: 320, inventory_quantity: 40, weight: 600, sku: 'HD-GJ-12' },
      { title: '24 pieces', price: 600, compare_at_price: 680, inventory_quantity: 25, weight: 1200, sku: 'HD-GJ-24' }
    ]
  },
  {
    title: 'Assorted Mithai Platter',
    handle: 'assorted-mithai-platter',
    description: 'Premium collection of 8 traditional sweets including Kaju Katli, Motichoor Ladoo, and Barfi varieties.',
    status: 'active',
    is_featured: true,
    featured_order: 3,
    category: 'Gift Boxes',
    variants: [
      { title: '1kg Mixed Box', price: 1200, compare_at_price: 1400, inventory_quantity: 25, weight: 1000, sku: 'HD-AMP-1KG' },
      { title: '2kg Family Pack', price: 2200, compare_at_price: 2600, inventory_quantity: 15, weight: 2000, sku: 'HD-AMP-2KG' }
    ]
  },
  {
    title: 'Motichoor Ladoo',
    handle: 'motichoor-ladoo',
    description: 'Classic Indian sweet made with fine chickpea flour pearls, ghee, and aromatic spices. Melts in your mouth.',
    status: 'active',
    category: 'Traditional Sweets',
    variants: [
      { title: '500g Pack', price: 380, inventory_quantity: 35, weight: 500, sku: 'HD-ML-500' },
      { title: '1kg Pack', price: 720, compare_at_price: 800, inventory_quantity: 20, weight: 1000, sku: 'HD-ML-1KG' }
    ]
  },
  {
    title: 'Badam Halwa',
    handle: 'badam-halwa',
    description: 'Rich almond dessert slow-cooked with milk, ghee, and cardamom. A luxurious treat for special occasions.',
    status: 'active',
    category: 'Traditional Sweets',
    variants: [
      { title: '250g Container', price: 650, inventory_quantity: 20, weight: 250, sku: 'HD-BH-250' },
      { title: '500g Container', price: 1200, compare_at_price: 1350, inventory_quantity: 15, weight: 500, sku: 'HD-BH-500' }
    ]
  },

  // Dry Fruits
  {
    title: 'Premium Diwali Dry Fruits Mix',
    handle: 'premium-diwali-dry-fruits-mix',
    description: 'Carefully selected almonds, cashews, pistachios, and dates in a decorative Diwali gift box.',
    status: 'active',
    is_featured: true,
    featured_order: 4,
    category: 'Dry Fruits',
    variants: [
      { title: '500g Premium Box', price: 1800, inventory_quantity: 30, weight: 500, sku: 'HD-DFM-500' },
      { title: '1kg Deluxe Box', price: 3400, compare_at_price: 3800, inventory_quantity: 20, weight: 1000, sku: 'HD-DFM-1KG' }
    ]
  },
  {
    title: 'California Almonds',
    handle: 'california-almonds',
    description: 'Premium quality California almonds, perfectly roasted and salted. Rich in nutrients and perfect for gifting.',
    status: 'active',
    category: 'Dry Fruits',
    variants: [
      { title: '250g Pack', price: 450, inventory_quantity: 50, weight: 250, sku: 'HD-CA-250' },
      { title: '500g Pack', price: 850, inventory_quantity: 35, weight: 500, sku: 'HD-CA-500' },
      { title: '1kg Pack', price: 1600, compare_at_price: 1750, inventory_quantity: 25, weight: 1000, sku: 'HD-CA-1KG' }
    ]
  },

  // Premium Chocolates
  {
    title: 'Diwali Special Chocolate Gift Box',
    handle: 'diwali-special-chocolate-gift-box',
    description: 'Handcrafted premium chocolates with Indian flavors - cardamom, rose, and saffron varieties.',
    status: 'active',
    is_featured: true,
    featured_order: 5,
    category: 'Premium Chocolates',
    variants: [
      { title: '12 piece Assortment', price: 750, inventory_quantity: 25, weight: 300, sku: 'HD-DSCGB-12' },
      { title: '24 piece Deluxe', price: 1400, compare_at_price: 1600, inventory_quantity: 15, weight: 600, sku: 'HD-DSCGB-24' }
    ]
  },

  // Namkeens & Snacks
  {
    title: 'Crispy Samosa',
    handle: 'crispy-samosa',
    description: 'Golden triangular pastries filled with spiced potato and pea mixture. Perfect tea-time snack.',
    status: 'active',
    category: 'Namkeens & Snacks',
    variants: [
      { title: '6 pieces', price: 120, inventory_quantity: 100, weight: 300, sku: 'HD-CS-6' },
      { title: '12 pieces', price: 220, inventory_quantity: 80, weight: 600, sku: 'HD-CS-12' },
      { title: '24 pieces Party Pack', price: 400, inventory_quantity: 50, weight: 1200, sku: 'HD-CS-24' }
    ]
  },
  {
    title: 'Bombay Mix Chivda',
    handle: 'bombay-mix-chivda',
    description: 'Traditional Mumbai street snack with peanuts, sev, and aromatic spices. Crunchy and addictive.',
    status: 'active',
    category: 'Namkeens & Snacks',
    variants: [
      { title: '200g Pack', price: 180, inventory_quantity: 60, weight: 200, sku: 'HD-BMC-200' },
      { title: '500g Family Pack', price: 420, inventory_quantity: 40, weight: 500, sku: 'HD-BMC-500' }
    ]
  },

  // Festival Specials
  {
    title: 'Diwali Celebration Hamper',
    handle: 'diwali-celebration-hamper',
    description: 'Complete Diwali gift hamper with sweets, dry fruits, chocolates, and decorative diyas.',
    status: 'active',
    is_featured: true,
    featured_order: 6,
    category: 'Festival Specials',
    variants: [
      { title: 'Small Hamper', price: 2500, inventory_quantity: 20, weight: 1500, sku: 'HD-DCH-SM' },
      { title: 'Large Family Hamper', price: 4500, compare_at_price: 5200, inventory_quantity: 10, weight: 3000, sku: 'HD-DCH-LG' }
    ]
  },
  {
    title: 'Corporate Diwali Gift Box',
    handle: 'corporate-diwali-gift-box',
    description: 'Elegant corporate gifting solution with premium sweets, dry fruits, and branded packaging.',
    status: 'active',
    category: 'Gift Boxes',
    variants: [
      { title: 'Executive Gift Box', price: 1800, inventory_quantity: 30, weight: 1000, sku: 'HD-CDGB-EX' },
      { title: 'Premium Corporate Box', price: 3200, compare_at_price: 3600, inventory_quantity: 20, weight: 2000, sku: 'HD-CDGB-PR' }
    ]
  }
];

async function seedDiwaliProducts() {
  const db = getApiGatewayDB();
  
  try {
    logger.info('Starting Diwali products seeding...');

    // Get categories
    const categories = await db('categories').select('*');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    let totalProducts = 0;
    let totalVariants = 0;

    for (const productData of diwaliProducts) {
      const trx = await db.transaction();
      
      try {
        // Check if product already exists
        const existingProduct = await trx('products')
          .where('handle', productData.handle)
          .first();

        if (existingProduct) {
          logger.info(`Product ${productData.title} already exists, skipping...`);
          await trx.rollback();
          continue;
        }

        // Create product
        const [product] = await trx('products')
          .insert({
            id: db.raw('gen_random_uuid()'),
            title: productData.title,
            handle: productData.handle,
            description: productData.description,
            status: productData.status,
            is_featured: productData.is_featured || false,
            featured_order: productData.featured_order || null,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning('*');

        // Create variants
        if (productData.variants && productData.variants.length > 0) {
          const variantData = productData.variants.map(variant => ({
            id: db.raw('gen_random_uuid()'),
            product_id: product.id,
            title: variant.title,
            sku: variant.sku,
            price: variant.price,
            compare_at_price: variant.compare_at_price || null,
            inventory_quantity: variant.inventory_quantity,
            weight: variant.weight,
            weight_unit: 'g',
            created_at: new Date(),
            updated_at: new Date()
          }));

          await trx('product_variants').insert(variantData);
          totalVariants += variantData.length;
        }

        // Link to category
        const categoryId = categoryMap[productData.category];
        if (categoryId) {
          await trx('product_categories').insert({
            product_id: product.id,
            category_id: categoryId
          });
        }

        await trx.commit();
        totalProducts++;
        logger.info(`✅ Created product: ${productData.title}`);

      } catch (error) {
        await trx.rollback();
        logger.error(`Failed to create product ${productData.title}:`, error);
      }
    }

    logger.info(`🎉 Diwali products seeding completed!`);
    logger.info(`📦 Created ${totalProducts} products with ${totalVariants} variants`);
    
    return {
      success: true,
      productsCreated: totalProducts,
      variantsCreated: totalVariants
    };

  } catch (error) {
    logger.error('Diwali products seeding failed:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDiwaliProducts()
    .then((result) => {
      console.log('Seeding result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDiwaliProducts };