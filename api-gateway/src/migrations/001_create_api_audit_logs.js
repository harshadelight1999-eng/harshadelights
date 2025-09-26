/**
 * Migration: Create API Audit Logs Table
 * 
 * This table stores comprehensive audit logs for all API requests
 * including authentication, authorization, and request/response metadata
 */

exports.up = function(knex) {
  return knex.schema.createTable('api_audit_logs', function(table) {
    // Primary key
    table.bigIncrements('id').primary();
    
    // Request identification
    table.string('request_id', 255).notNullable().index();
    table.string('http_method', 10).notNullable();
    table.text('path').notNullable();
    table.text('query_params').defaultTo('{}');
    table.text('headers').defaultTo('{}');
    
    // Authentication & authorization
    table.bigInteger('user_id').nullable().index();
    table.bigInteger('api_key_id').nullable().index();
    table.string('authentication_method', 50).nullable();
    
    // Client information
    table.string('client_ip', 45).nullable(); // IPv6 compatible length
    table.text('user_agent').nullable();
    
    // Response information
    table.integer('status_code').notNullable();
    table.integer('response_time_ms').nullable();
    table.string('error_code', 100).nullable();
    table.text('error_message').nullable();
    
    // Timestamps
    table.timestamp('request_timestamp').notNullable().defaultTo(knex.fn.now());
    table.timestamp('response_timestamp').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for performance
    table.index(['user_id', 'request_timestamp']);
    table.index(['api_key_id', 'request_timestamp']);
    table.index(['client_ip', 'request_timestamp']);
    table.index(['status_code', 'request_timestamp']);
    table.index(['http_method', 'path', 'request_timestamp']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('api_audit_logs');
};