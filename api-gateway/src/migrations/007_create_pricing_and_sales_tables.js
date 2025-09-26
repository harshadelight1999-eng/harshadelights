/**
 * Database migration for Pricing and Sales module tables
 */

exports.up = async function(knex) {
  console.log('Creating pricing and sales tables...');

  // HD Dynamic Pricing Rule table
  await knex.schema.createTable('tabHD Dynamic Pricing Rule', (table) => {
    table.string('name', 140).primary();
    table.string('rule_code', 100).notNullable().unique();
    table.string('rule_name', 200).notNullable();
    table.string('rule_type', 50).notNullable();
    table.integer('priority').defaultTo(1);
    table.integer('is_active').defaultTo(1);
    table.date('valid_from').notNullable();
    table.date('valid_to');
    table.string('status', 20).defaultTo('Draft');
    
    // Applicability
    table.string('applicable_for', 50).notNullable();
    table.string('apply_on', 50).notNullable();
    table.string('apply_on_value', 200);
    table.string('customer_group', 140);
    table.string('territory', 140);
    table.string('customer_segment', 140);
    table.string('item_group', 140);
    
    // Conditions
    table.decimal('min_qty', 18, 6);
    table.decimal('max_qty', 18, 6);
    table.decimal('min_amount', 18, 2);
    table.decimal('max_amount', 18, 2);
    table.string('applicable_days', 100);
    table.integer('time_based').defaultTo(0);
    table.time('start_time');
    table.time('end_time');
    
    // Pricing
    table.string('rate_or_discount', 50).notNullable();
    table.decimal('rate', 18, 2);
    table.decimal('discount_percentage', 5, 2);
    table.decimal('discount_amount', 18, 2);
    table.integer('is_cumulative').defaultTo(0);
    table.decimal('max_discount_amount', 18, 2);
    table.decimal('round_to_nearest', 18, 6);
    
    // Volume Discounts
    table.integer('volume_discount_enabled').defaultTo(0);
    
    // Promotional
    table.integer('is_promotional').defaultTo(0);
    table.text('promotional_message');
    table.integer('auto_apply').defaultTo(1);
    table.integer('requires_coupon').defaultTo(0);
    table.string('coupon_code', 50);
    table.integer('usage_limit');
    table.integer('used_count').defaultTo(0);
    
    // Advanced
    table.text('rule_condition');
    table.integer('mixed_conditions').defaultTo(0);
    table.decimal('threshold_for_suggestion', 18, 2);
    table.integer('disable_other_rules').defaultTo(0);
    table.integer('compound_with_other_rules').defaultTo(0);
    table.string('selling_price_list', 140);
    table.string('buying_price_list', 140);
    
    // Analytics
    table.integer('track_usage').defaultTo(1);
    table.text('usage_analytics');
    table.decimal('revenue_impact', 18, 2).defaultTo(0);
    table.string('created_by', 140);
    table.string('approved_by', 140);
    table.date('approval_date');
    
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['rule_type']);
    table.index(['is_active', 'status']);
    table.index(['valid_from', 'valid_to']);
    table.index(['applicable_for']);
    table.index(['priority']);
    table.index(['coupon_code']);
  });

  // HD Volume Discount Slab table (child table)
  await knex.schema.createTable('tabHD Volume Discount Slab', (table) => {
    table.string('name', 140).primary();
    table.string('slab_name', 200).notNullable();
    table.decimal('min_quantity', 18, 6).notNullable();
    table.decimal('max_quantity', 18, 6);
    table.string('discount_type', 50).defaultTo('Percentage');
    table.decimal('discount_percentage', 5, 2);
    table.decimal('discount_amount', 18, 2);
    table.decimal('discounted_rate', 18, 2);
    table.integer('is_active').defaultTo(1);
    table.date('effective_from');
    table.date('effective_to');
    table.text('description');
    table.integer('sort_order').defaultTo(1);
    table.string('parent', 140).notNullable();
    table.string('parenttype', 140).defaultTo('HD Dynamic Pricing Rule');
    table.string('parentfield', 140).defaultTo('volume_slabs');
    table.integer('idx').defaultTo(0);
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['parent']);
    table.index(['min_quantity']);
    table.index(['is_active']);
    table.index(['sort_order']);
  });

  console.log('✅ Pricing and sales tables created successfully');
};

exports.down = async function(knex) {
  console.log('Dropping pricing and sales tables...');
  
  await knex.schema.dropTableIfExists('tabHD Volume Discount Slab');
  await knex.schema.dropTableIfExists('tabHD Dynamic Pricing Rule');
  
  console.log('✅ Pricing and sales tables dropped');
};