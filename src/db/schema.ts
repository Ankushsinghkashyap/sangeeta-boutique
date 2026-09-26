import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (tied to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name').notNull().default('Admin User'),
  email: text('email').notNull(),
  role: text('role').notNull().default('admin'), // 'admin' | 'staff' | 'customer'
  createdAt: timestamp('created_at').defaultNow(),
});

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address'),
  city: text('city'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  status: text('status').notNull().default('active'), // 'active' | 'inactive'
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Designs table
export const designs = pgTable('designs', {
  id: serial('id').primaryKey(),
  designCode: text('design_code').notNull().unique(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id),
  categoryName: text('category_name').notNull().default('Custom'),
  description: text('description').notNull(),
  designPrice: numeric('design_price', { precision: 10, scale: 2 }).notNull().default('0'),
  sewingPrice: numeric('sewing_price', { precision: 10, scale: 2 }).notNull().default('0'),
  customizationPrice: numeric('customization_price', { precision: 10, scale: 2 }).notNull().default('0'),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull().default('0'),
  fabricInfo: text('fabric_info'),
  estimatedTime: text('estimated_time').default('3-5 business days'),
  availableSizes: text('available_sizes').default('XS, S, M, L, XL, XXL, Custom'),
  customizationOptions: jsonb('customization_options'),
  mainImage: text('main_image').notNull(),
  featured: boolean('featured').notNull().default(false),
  popular: boolean('popular').notNull().default(false),
  status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'unavailable'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Design images table
export const designImages = pgTable('design_images', {
  id: serial('id').primaryKey(),
  designId: integer('design_id').references(() => designs.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  displayOrder: integer('display_order').default(0),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerAddress: text('customer_address'),
  customerCity: text('customer_city'),
  preferredContact: text('preferred_contact').default('Phone / WhatsApp'),
  designId: integer('design_id').references(() => designs.id),
  designCode: text('design_code').notNull(),
  designName: text('design_name').notNull(),
  designCategory: text('design_category'),
  designImage: text('design_image'),
  status: text('status').notNull().default('New Order'),
  designPrice: numeric('design_price', { precision: 10, scale: 2 }).notNull(),
  sewingPrice: numeric('sewing_price', { precision: 10, scale: 2 }).notNull(),
  customizationPrice: numeric('customization_price', { precision: 10, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  sizeType: text('size_type').notNull().default('Custom'), // 'Standard' | 'Custom'
  standardSize: text('standard_size'),
  specialInstructions: text('special_instructions'),
  referenceImageUrl: text('reference_image_url'),
  expectedCompletionDate: text('expected_completion_date'),
  notes: text('notes'),
  paymentMethod: text('payment_method').default('NIC ASIA QR Payment'),
  paymentStatus: text('payment_status').notNull().default('Pending Verification'),
  paymentScreenshotUrl: text('payment_screenshot_url'),
  paymentTransactionId: text('payment_transaction_id'),
  paymentAmount: numeric('payment_amount', { precision: 10, scale: 2 }),
  paymentVerifiedBy: text('payment_verified_by'),
  paymentVerifiedAt: timestamp('payment_verified_at'),
  paymentNotes: text('payment_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Measurements table
export const measurements = pgTable('measurements', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  measurementType: text('measurement_type').notNull(), // e.g., 'Bust', 'Waist', 'Shoulder', etc.
  measurementValue: text('measurement_value').notNull(),
});

// Customizations table
export const customizations = pgTable('customizations', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  customizationType: text('customization_type').notNull(), // e.g., 'Neck Design', 'Sleeve Length', etc.
  customizationValue: text('customization_value').notNull(),
});

// Order status history table
export const orderStatusHistory = pgTable('order_status_history', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(),
  note: text('note'),
  changedBy: text('changed_by').default('Admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Website Content CMS table
export const websiteContent = pgTable('website_content', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const designsRelations = relations(designs, ({ one, many }) => ({
  category: one(categories, {
    fields: [designs.categoryId],
    references: [categories.id],
  }),
  images: many(designImages),
  orders: many(orders),
}));

export const designImagesRelations = relations(designImages, ({ one }) => ({
  design: one(designs, {
    fields: [designImages.designId],
    references: [designs.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  designs: many(designs),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  design: one(designs, {
    fields: [orders.designId],
    references: [designs.id],
  }),
  measurementsList: many(measurements),
  customizationsList: many(customizations),
  statusHistory: many(orderStatusHistory),
}));

export const measurementsRelations = relations(measurements, ({ one }) => ({
  order: one(orders, {
    fields: [measurements.orderId],
    references: [orders.id],
  }),
}));

export const customizationsRelations = relations(customizations, ({ one }) => ({
  order: one(orders, {
    fields: [customizations.orderId],
    references: [orders.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));
