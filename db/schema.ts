import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tripsTable = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
});

export const activitiesTable = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  duration: integer('duration').notNull(),
  category: text('category').notNull(),
});