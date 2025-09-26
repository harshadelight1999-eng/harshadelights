/**
 * Database migration for Products and Categories tables
 */
exports.up = async function(knex) {
  console.log('Creating products and categories tables...');

  // Categories table
  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('handle', 255).notNullable().unique();
    table.text('description').nullable();
    table.uuid('parent_id').nullable().references('id').inTable('categories').onDelete('SET NULL');
    table.string('image', 500).nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);
    table.jsonb('metadata').nullable();
    table.timestamps(true, true);

    // Indexes
    table.index('handle');
    table.index('parent_id');
    table.index('is_active');
    table.index('sort_order');
  });

  // Products table
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.string('subtitle', 255).nullable();
    table.text('description').notNullable();
    table.string('handle', 255).notNullable().unique();
    table.string('thumbnail', 500).nullable();
    table.enum('status', ['active', 'inactive', 'draft']).defaultTo('draft');
    table.boolean('is_featured').defaultTo(false);
    table.integer('featured_order').nullable();
    table.jsonb('tags').nullable();
    table.jsonb('metadata').nullable();
    table.string('erpnext_item_code', 140).nullable(); // Link to ERPNext Item
    table.timestamps(true, true);

    // Indexes
    table.index('handle');
    table.index('status');
    table.index('is_featured');
    table.index('featured_order');
    table.index('erpnext_item_code');
    table.index('created_at');
  });

  // Product variants table
  await knex.schema.createTable('product_variants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.string('sku', 100).nullable().unique();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('compare_at_price', 10, 2).nullable();
    table.integer('inventory_quantity').defaultTo(0);
    table.decimal('weight', 8, 3).nullable();
    table.enum('weight_unit', ['g', 'kg', 'lb', 'oz']).defaultTo('g');
    table.boolean('track_inventory').defaultTo(true);
    table.boolean('continue_selling_when_out_of_stock').defaultTo(false);
    table.jsonb('metadata').nullable();
    table.timestamps(true, true);

    // Indexes
    table.index('product_id');
    table.index('sku');
    table.index('price');
    table.index('inventory_quantity');
  });

  // Product images table
  await knex.schema.createTable('product_images', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.string('url', 500).notNullable();
    table.string('alt', 255).nullable();
    table.integer('sort_order').defaultTo(0);
    table.jsonb('metadata').nullable();
    table.timestamps(true, true);

    // Indexes
    table.index('product_id');
    table.index('sort_order');
  });

  // Product categories junction table
  await knex.schema.createTable('product_categories', (table) => {
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.uuid('category_id').notNullable().references('id').inTable('categories').onDelete('CASCADE');
    table.timestamps(true, true);

    // Composite primary key
    table.primary(['product_id', 'category_id']);
    
    // Indexes
    table.index('product_id');
    table.index('category_id');
  });

  // Create default categories for Harsha Delights
  const defaultCategories = [
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Traditional Sweets',
      handle: 'traditional-sweets',
      description: 'Authentic Indian sweets made with traditional recipes',
      is_active: true,
      sort_order: 1
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Dry Fruits',
      handle: 'dry-fruits',
      description: 'Premium quality dry fruits and nuts',
      is_active: true,
      sort_order: 2
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Namkeens & Snacks',
      handle: 'namkeens-snacks',
      description: 'Crispy and savory Indian snacks',
      is_active: true,
      sort_order: 3
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Gift Boxes',
      handle: 'gift-boxes',
      description: 'Curated gift boxes for special occasions',
      is_active: true,
      sort_order: 4
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Festival Specials',
      handle: 'festival-specials',
      description: 'Special products for festivals and celebrations',
      is_active: true,
      sort_order: 5
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Premium Chocolates',
      handle: 'premium-chocolates',
      description: 'Handcrafted premium chocolates and confectionery',
      is_active: true,
      sort_order: 6
    }
  ];

  await knex('categories').insert(defaultCategories);

  console.log('✅ Products and categories tables created successfully');
};

exports.down = async function(knex) {
  console.log('Dropping products and categories tables...');
  
  await knex.schema.dropTableIfExists('product_categories');
  await knex.schema.dropTableIfExists('product_images');
  await knex.schema.dropTableIfExists('product_variants');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  
  console.log('✅ Products and categories tables dropped');
};