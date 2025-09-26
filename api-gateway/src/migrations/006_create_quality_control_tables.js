/**
 * Database migration for Quality Control module tables
 */

exports.up = async function(knex) {
  console.log('Creating quality control tables...');

  // HD Quality Inspection table
  await knex.schema.createTable('tabHD Quality Inspection', (table) => {
    table.string('name', 140).primary();
    table.string('inspection_id', 100).notNullable().unique();
    table.string('item', 140).notNullable();
    table.string('item_name', 140);
    table.string('batch_id', 140);
    table.string('warehouse', 140);
    table.date('inspection_date').notNullable();
    table.string('inspection_type', 50).notNullable();
    table.string('inspection_stage', 50).notNullable();
    table.string('inspector', 140).notNullable();
    table.string('inspection_template', 140);
    table.string('status', 20).defaultTo('Draft');
    table.string('overall_result', 20);
    table.decimal('sample_size', 18, 6).defaultTo(0);
    table.string('sample_uom', 50);
    table.decimal('passed_qty', 18, 6).defaultTo(0);
    table.decimal('failed_qty', 18, 6).defaultTo(0);
    table.decimal('rework_qty', 18, 6).defaultTo(0);
    table.decimal('quality_score', 5, 2).defaultTo(0);
    table.string('quality_grade', 10);
    table.text('observations');
    table.text('defects_found');
    table.text('corrective_actions');
    table.text('recommendations');
    table.integer('is_certificate_required').defaultTo(0);
    table.string('certificate_number', 100);
    table.date('certificate_date');
    table.string('certified_by', 140);
    table.string('reference_doctype', 140);
    table.string('reference_name', 140);
    table.string('supplier', 140);
    table.decimal('temperature_at_inspection', 8, 2);
    table.decimal('humidity_at_inspection', 5, 2);
    table.text('environmental_conditions');
    table.integer('photos_attached').defaultTo(0);
    table.integer('lab_test_required').defaultTo(0);
    table.string('lab_test_reference', 140);
    table.datetime('inspection_start_time');
    table.datetime('inspection_end_time');
    table.integer('inspection_duration_minutes');
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['item']);
    table.index(['batch_id']);
    table.index(['inspection_date']);
    table.index(['inspection_type']);
    table.index(['inspector']);
    table.index(['status']);
    table.index(['overall_result']);
  });

  // HD Quality Parameter table (child table for quality inspection)
  await knex.schema.createTable('tabHD Quality Parameter', (table) => {
    table.string('name', 140).primary();
    table.string('parameter_name', 200).notNullable();
    table.string('parameter_type', 50).notNullable();
    table.string('test_method', 100);
    table.decimal('target_value', 18, 6);
    table.decimal('actual_value', 18, 6);
    table.string('uom', 50);
    table.decimal('tolerance_min', 18, 6);
    table.decimal('tolerance_max', 18, 6);
    table.string('result', 20);
    table.text('remarks');
    table.integer('is_critical').defaultTo(0);
    table.string('test_equipment', 100);
    table.string('tested_by', 140);
    table.datetime('test_datetime');
    table.integer('retest_required').defaultTo(0);
    table.text('retest_reason');
    table.string('parent', 140).notNullable();
    table.string('parenttype', 140).defaultTo('HD Quality Inspection');
    table.string('parentfield', 140).defaultTo('quality_parameters');
    table.integer('idx').defaultTo(0);
    table.timestamp('creation').defaultTo(knex.fn.now());
    table.timestamp('modified').defaultTo(knex.fn.now());
    table.string('modified_by', 140);
    table.string('owner', 140);
    table.integer('docstatus').defaultTo(0);

    // Indexes
    table.index(['parent']);
    table.index(['parameter_type']);
    table.index(['result']);
  });

  console.log('✅ Quality control tables created successfully');
};

exports.down = async function(knex) {
  console.log('Dropping quality control tables...');
  
  await knex.schema.dropTableIfExists('tabHD Quality Parameter');
  await knex.schema.dropTableIfExists('tabHD Quality Inspection');
  
  console.log('✅ Quality control tables dropped');
};