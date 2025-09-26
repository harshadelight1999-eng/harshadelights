/**
 * Database migration for WhatsApp Orders tables
 */
exports.up = async function(knex) {
  console.log('Creating WhatsApp orders tables...');

  // WhatsApp orders table
  await knex.schema.createTable('whatsapp_orders', (table) => {
    table.string('id', 50).primary(); // HD-timestamp-random format
    table.string('customer_name', 255).notNullable();
    table.string('customer_phone', 20).notNullable();
    table.string('customer_email', 255).nullable();
    table.text('customer_address').nullable();
    table.jsonb('items').notNullable(); // Array of order items
    table.decimal('total_amount', 10, 2).notNullable();
    table.text('special_instructions').nullable();
    table.enum('status', ['inquiry', 'confirmed', 'preparing', 'ready', 'delivered']).defaultTo('inquiry');
    table.text('notes').nullable(); // Internal notes
    table.timestamps(true, true);

    // Indexes
    table.index('customer_phone');
    table.index('status');
    table.index('created_at');
  });

  // WhatsApp order status log table
  await knex.schema.createTable('whatsapp_order_status_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('order_id', 50).notNullable().references('id').inTable('whatsapp_orders').onDelete('CASCADE');
    table.string('from_status', 50).nullable();
    table.string('to_status', 50).notNullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('order_id');
    table.index('created_at');
  });

  console.log('✅ WhatsApp orders tables created successfully');
};

exports.down = async function(knex) {
  console.log('Dropping WhatsApp orders tables...');
  
  await knex.schema.dropTableIfExists('whatsapp_order_status_log');
  await knex.schema.dropTableIfExists('whatsapp_orders');
  
  console.log('✅ WhatsApp orders tables dropped');
};