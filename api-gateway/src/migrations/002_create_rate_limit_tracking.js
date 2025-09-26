/**
 * Migration: Create Rate Limit Tracking Table
 * 
 * This table stores rate limiting analytics and metrics
 * for monitoring API usage patterns and detecting abuse
 */

exports.up = function(knex) {
  return knex.schema.createTable('rate_limit_tracking', function(table) {
    // Primary key
    table.bigIncrements('id').primary();
    
    // Identifier information
    table.string('identifier_type', 50).notNullable(); // 'user', 'api_key', 'ip', etc.
    table.string('identifier_value', 255).notNullable();
    
    // Time window information
    table.timestamp('window_start').notNullable();
    table.string('window_type', 20).notNullable().defaultTo('minute'); // 'minute', 'hour', 'day'
    
    // Rate limiting metrics
    table.integer('request_count').notNullable().defaultTo(0);
    table.integer('limit_threshold').notNullable();
    table.integer('blocked_count').notNullable().defaultTo(0);
    
    // Timestamps
    table.timestamp('last_request_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Composite unique constraint for upsert operations
    table.unique(['identifier_type', 'identifier_value', 'window_start', 'window_type'], 'uk_rate_limit_window');
    
    // Indexes for performance
    table.index(['identifier_type', 'identifier_value', 'window_start'], 'idx_rate_limit_id_window');
    table.index(['window_start', 'window_type'], 'idx_rate_limit_window');
    table.index(['last_request_at'], 'idx_rate_limit_last_req');
    table.index(['blocked_count'], 'idx_rate_limit_blocked');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rate_limit_tracking');
};