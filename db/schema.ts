import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// drizzle schemas, these match the CREATE TABLE statements in client.ts

// a trip belongs to one user. endDate is optional since some trips dont have one set yet
export const tripsTable = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),  // nullable
});

// an activity belongs to a trip and a category
// duration is stored as integer hours
export const activitiesTable = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  duration: integer('duration').notNull(),
  categoryId: integer('category_id').notNull(),
});

// categories are shared across all users, no userId
export const categoriesTable = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
});

// target = how many activities the user wants to do on a trip
export const targetsTable = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  name: text('name').notNull(),
  targetValue: integer('target_value').notNull(),
});

// passwords are stored hashed, never plaintext. see utils/hash.ts
export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
});