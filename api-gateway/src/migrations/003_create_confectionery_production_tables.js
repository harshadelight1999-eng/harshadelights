/**
 * Database migration for Confectionery Production module tables
 */

exports.up = async function(knex) {
  console.log('Creating confectionery production tables...');

  // HD Batch Master table
  await knex.schema.createTable('tabHD Batch Master', (table) => {
    table.string('name', 140).primary();
    table.string('batch_id', 140).notNullable().unique();
    table.string('item', 140).notNullable();
    table.string('item_name', 140);
    table.string('warehouse', 140).notNullable();
    table.date('manufacturing_date').notNullable();
    table.date('expiry_date').notNullable();
    table.decimal('batch_size', 18, 6).defaultTo(0);
    table.decimal('available_qty', 18, 6).defaultTo(0);
    table.decimal('consumed_qty', 18, 6).defaultTo(0);
    table.decimal('unit_cost', 18, 6).defaultTo(0);
    table.string('quality_grade', 20).defaultTo('A');
    table.decimal('sugar_content_percentage', 5, 2);
    table.decimal('fat_content_percentage', 5, 2);
    table.decimal('moisture_content_percentage', 5, 2);
    table.string('status', 20).defaultTo('Active');
    table.text('manufacturing_notes');
    table.text('quality_notes');
    table.string('parent', 140);
    table.string('parenttype', 140);
    table.string('parentfield', 140);
    table.integer('idx').defaultTo(0);
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['item', 'warehouse']);
    table.index(['manufacturing_date']);
    table.index(['expiry_date']);
    table.index(['status']);
  });

  // HD Recipe Master table
  await knex.schema.createTable('tabHD Recipe Master', (table) => {
    table.string('name', 140).primary();
    table.string('recipe_code', 100).notNullable().unique();
    table.string('recipe_name', 200).notNullable();
    table.string('item', 140).notNullable();
    table.string('item_name', 140);
    table.decimal('yield_quantity', 18, 6).notNullable();
    table.string('yield_uom', 50).notNullable();
    table.text('preparation_method');
    table.integer('preparation_time_minutes');
    table.integer('cooking_time_minutes');
    table.integer('total_time_minutes');
    table.string('difficulty_level', 20).defaultTo('Medium');
    table.decimal('estimated_cost', 18, 2).defaultTo(0);
    table.decimal('target_selling_price', 18, 2).defaultTo(0);
    table.decimal('profit_margin_percentage', 5, 2).defaultTo(0);
    table.string('recipe_category', 100);
    table.string('cuisine_type', 100);
    table.integer('shelf_life_days');
    table.text('storage_instructions');
    table.text('allergen_information');
    table.text('nutritional_notes');
    table.integer('is_active').defaultTo(1);
    table.string('created_by', 140);
    table.string('approved_by', 140);
    table.date('approval_date');
    table.string('version', 20).defaultTo('1.0');
    table.text('version_notes');
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['item']);
    table.index(['recipe_category']);
    table.index(['is_active']);
  });

  // HD Production Planning table
  await knex.schema.createTable('tabHD Production Planning', (table) => {
    table.string('name', 140).primary();
    table.string('plan_id', 100).notNullable().unique();
    table.date('plan_date').notNullable();
    table.date('production_date').notNullable();
    table.string('warehouse', 140).notNullable();
    table.string('shift', 50);
    table.string('supervisor', 140);
    table.string('status', 20).defaultTo('Draft');
    table.decimal('total_planned_qty', 18, 6).defaultTo(0);
    table.decimal('total_produced_qty', 18, 6).defaultTo(0);
    table.decimal('total_planned_cost', 18, 2).defaultTo(0);
    table.decimal('total_actual_cost', 18, 2).defaultTo(0);
    table.text('planning_notes');
    table.text('production_notes');
    table.integer('priority').defaultTo(1);
    table.string('production_line', 100);
    table.integer('estimated_duration_hours');
    table.integer('actual_duration_hours');
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['production_date']);
    table.index(['warehouse']);
    table.index(['status']);
  });

  console.log('✅ Confectionery production tables created successfully');
};

exports.down = async function(knex) {
  console.log('Dropping confectionery production tables...');
  
  await knex.schema.dropTableIfExists('tabHD Production Planning');
  await knex.schema.dropTableIfExists('tabHD Recipe Master');
  await knex.schema.dropTableIfExists('tabHD Batch Master');
  
  console.log('✅ Confectionery production tables dropped');
};