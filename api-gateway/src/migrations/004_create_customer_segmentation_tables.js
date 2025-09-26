/**
 * Database migration for Customer Segmentation module tables
 */

exports.up = async function(knex) {
  console.log('Creating customer segmentation tables...');

  // HD Customer Segment table
  await knex.schema.createTable('tabHD Customer Segment', (table) => {
    table.string('name', 140).primary();
    table.string('segment_code', 50).notNullable().unique();
    table.string('segment_name', 200).notNullable();
    table.string('segment_type', 50).notNullable();
    table.text('description');
    table.decimal('discount_percentage', 5, 2).defaultTo(0);
    table.decimal('minimum_order_value', 18, 2).defaultTo(0);
    table.integer('priority').defaultTo(1);
    table.integer('is_active').defaultTo(1);
    table.integer('auto_assignment_enabled').defaultTo(0);
    table.longtext('auto_assignment_rules');
    table.string('created_by', 140);
    table.integer('customer_count').defaultTo(0);
    table.decimal('total_revenue', 18, 2).defaultTo(0);
    table.decimal('average_order_value', 18, 2).defaultTo(0);
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['segment_type']);
    table.index(['is_active']);
    table.index(['priority']);
  });

  // HD Customer Segment Assignment table
  await knex.schema.createTable('tabHD Customer Segment Assignment', (table) => {
    table.string('name', 140).primary();
    table.string('customer', 140).notNullable();
    table.string('customer_name', 200);
    table.string('customer_segment', 140).notNullable();
    table.string('segment_name', 200);
    table.date('assignment_date').notNullable();
    table.string('assignment_method', 50).defaultTo('Manual');
    table.integer('is_primary').defaultTo(0);
    table.string('status', 20).defaultTo('Active');
    table.date('effective_from');
    table.date('effective_to');
    table.text('assignment_notes');
    table.string('assigned_by', 140);
    table.decimal('customer_revenue_at_assignment', 18, 2).defaultTo(0);
    table.integer('customer_orders_at_assignment').defaultTo(0);
    table.decimal('average_order_value_at_assignment', 18, 2).defaultTo(0);
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['customer']);
    table.index(['customer_segment']);
    table.index(['status']);
    table.index(['assignment_date']);
    table.unique(['customer', 'customer_segment'], 'unique_customer_segment');
  });

  console.log('✅ Customer segmentation tables created successfully');
};

exports.down = async function(knex) {
  console.log('Dropping customer segmentation tables...');
  
  await knex.schema.dropTableIfExists('tabHD Customer Segment Assignment');
  await knex.schema.dropTableIfExists('tabHD Customer Segment');
  
  console.log('✅ Customer segmentation tables dropped');
};