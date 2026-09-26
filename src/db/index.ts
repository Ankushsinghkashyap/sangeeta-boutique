import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { newDb } from 'pg-mem';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = (): Pool => {
  if (global._postgresPool) {
    return global._postgresPool;
  }

  if (process.env.SQL_HOST) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });

    return global._postgresPool;
  }

  // Fallback to embedded in-memory PostgreSQL engine (pg-mem)
  const memDb = newDb({
    autoCreateForeignKeyIndices: true,
  });

  // Create all database tables
  memDb.public.none(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      uid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT 'Admin User',
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT,
      city TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS designs (
      id SERIAL PRIMARY KEY,
      design_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category_id INTEGER,
      category_name TEXT NOT NULL DEFAULT 'Custom',
      description TEXT NOT NULL,
      design_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      sewing_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      customization_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      fabric_info TEXT,
      estimated_time TEXT DEFAULT '3-5 business days',
      available_sizes TEXT DEFAULT 'XS, S, M, L, XL, XXL, Custom',
      customization_options JSONB,
      main_image TEXT NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT false,
      popular BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS design_images (
      id SERIAL PRIMARY KEY,
      design_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT false,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_address TEXT,
      customer_city TEXT,
      preferred_contact TEXT DEFAULT 'Phone / WhatsApp',
      design_id INTEGER,
      design_code TEXT NOT NULL,
      design_name TEXT NOT NULL,
      design_category TEXT,
      design_image TEXT,
      status TEXT NOT NULL DEFAULT 'New Order',
      design_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      sewing_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      customization_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
      size_type TEXT NOT NULL DEFAULT 'Custom',
      standard_size TEXT,
      special_instructions TEXT,
      reference_image_url TEXT,
      expected_completion_date TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS measurements (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      measurement_type TEXT NOT NULL,
      measurement_value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customizations (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      customization_type TEXT NOT NULL,
      customization_value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      changed_by TEXT DEFAULT 'Admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS website_content (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const pgAdapter = memDb.adapters.createPg();
  global._postgresPool = new pgAdapter.Pool() as unknown as Pool;

  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
