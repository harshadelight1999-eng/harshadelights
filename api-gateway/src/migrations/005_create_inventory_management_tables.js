/**
 * Database migration for Inventory Management module tables
 */

exports.up = async function(knex) {
  console.log('Creating inventory management tables...');

  // HD Stock Alert table
  await knex.schema.createTable('tabHD Stock Alert', (table) => {
    table.string('name', 140).primary();
    table.string('alert_id', 100).notNullable().unique();
    table.string('item', 140).notNullable();
    table.string('item_name', 140);
    table.string('warehouse', 140).notNullable();
    table.string('alert_type', 50).notNullable();
    table.string('alert_level', 20).notNullable();
    table.decimal('current_stock', 18, 6).defaultTo(0);
    table.decimal('threshold_qty', 18, 6).defaultTo(0);
    table.decimal('reorder_qty', 18, 6).defaultTo(0);
    table.date('expiry_date');
    table.integer('days_to_expiry');
    table.decimal('potential_loss_value', 18, 2).defaultTo(0);
    table.text('alert_message');
    table.string('status', 20).defaultTo('Open');
    table.integer('is_acknowledged').defaultTo(0);
    table.string('acknowledged_by', 140);
    table.datetime('acknowledged_at');
    table.text('acknowledgment_notes');
    table.string('action_taken', 200);
    table.datetime('resolved_at');
    table.string('resolved_by', 140);
    table.text('resolution_notes');
    table.integer('priority').defaultTo(1);
    table.string('notification_sent_to', 500);
    table.datetime('notification_sent_at');
    table.integer('auto_generated').defaultTo(1);
    table.string('batch_id', 140);
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['item', 'warehouse']);
    table.index(['alert_type']);
    table.index(['alert_level']);
    table.index(['status']);
    table.index(['expiry_date']);
    table.index(['priority']);
  });

  // HD Batch Consumption Log table
  await knex.schema.createTable('tabHD Batch Consumption Log', (table) => {
    table.string('name', 140).primary();
    table.string('batch_id', 140).notNullable();
    table.string('item', 140).notNullable();
    table.string('item_name', 140);
    table.string('warehouse', 140).notNullable();
    table.datetime('consumption_datetime').notNullable();
    table.decimal('consumed_qty', 18, 6).notNullable();
    table.string('consumption_type', 50).notNullable();
    table.string('reference_doctype', 140);
    table.string('reference_name', 140);
    table.string('consumed_by', 140);
    table.text('consumption_notes');
    table.decimal('remaining_qty_after_consumption', 18, 6).defaultTo(0);
    table.string('consumption_reason', 100);
    table.decimal('unit_cost_at_consumption', 18, 6).defaultTo(0);
    table.decimal('total_value_consumed', 18, 2).defaultTo(0);
    table.integer('is_reversal').defaultTo(0);
    table.string('original_consumption_log', 140);
    table.text('reversal_reason');
    table.string('batch_status_before', 20);
    table.string('batch_status_after', 20);
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['batch_id']);
    table.index(['item', 'warehouse']);
    table.index(['consumption_datetime']);
    table.index(['consumption_type']);
    table.index(['reference_doctype', 'reference_name']);
  });

  console.log('✅ Inventory management tables created successfully');
};

exports.down = async function(knex) {
  console.log('Dropping inventory management tables...');
  
  await knex.schema.dropTableIfExists('tabHD Batch Consumption Log');
  await knex.schema.dropTableIfExists('tabHD Stock Alert');
  
  console.log('✅ Inventory management tables dropped');
};