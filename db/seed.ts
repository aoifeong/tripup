import { db } from './client';
import { activitiesTable, categoriesTable, targetsTable, tripsTable } from './schema';

export async function seedDatabaseIfEmpty() {
  const existingTrips = await db.select().from(tripsTable);
  if (existingTrips.length > 0) return;

  // Seed trips
  await db.insert(tripsTable).values([
    {
      title: 'Rome Getaway',
      destination: 'Italy',
      startDate: '2026-07-02',
    },
    {
      title: 'Barcelona Holiday',
      destination: 'Spain',
      startDate: '2026-08-15',
    },
    {
      title: 'Philippines',
      destination: 'Manila',
      startDate: '2026-09-06',
    },
  ]);

  const trips = await db.select().from(tripsTable);

  // Seed categories
  await db.insert(categoriesTable).values([
    { name: 'Sightseeing', color: 'blue' },
    { name: 'Food', color: 'orange' },
    { name: 'Adventure', color: 'green' },
    { name: 'Sports', color: 'purple' },
  ]);

  const categories = await db.select().from(categoriesTable);

  const romeTrip = trips.find((trip) => trip.title === 'Rome Getaway');
  const barcelonaTrip = trips.find((trip) => trip.title === 'Barcelona Holiday');
  const philippinesTrip = trips.find((trip) => trip.title === 'Philippines');

  const sightseeing = categories.find((cat) => cat.name === 'Sightseeing');
  const food = categories.find((cat) => cat.name === 'Food');
  const adventure = categories.find((cat) => cat.name === 'Adventure');
  const sports = categories.find((cat) => cat.name === 'Sports');

  if (!romeTrip || !barcelonaTrip || !philippinesTrip) return;
  if (!sightseeing || !food || !adventure || !sports) return;

  // Seed activities
  await db.insert(activitiesTable).values([
    {
      tripId: romeTrip.id,
      title: 'Colosseum Visit',
      date: '2026-07-03',
      duration: 3,
      categoryId: sightseeing.id,
    },
    {
      tripId: romeTrip.id,
      title: 'Pasta Dinner',
      date: '2026-07-03',
      duration: 2,
      categoryId: food.id,
    },
    {
      tripId: barcelonaTrip.id,
      title: 'Beach Walk',
      date: '2026-08-16',
      duration: 2,
      categoryId: adventure.id,
    },
    {
      tripId: barcelonaTrip.id,
      title: 'Museum Tour',
      date: '2026-08-17',
      duration: 2,
      categoryId: sightseeing.id,
    },
    {
      tripId: philippinesTrip.id,
      title: 'Island Hopping',
      date: '2026-09-07',
      duration: 4,
      categoryId: adventure.id,
    },
    {
      tripId: philippinesTrip.id,
      title: 'Basketball Game',
      date: '2026-09-08',
      duration: 2,
      categoryId: sports.id,
    },
  ]);

  // Seed targets
  await db.insert(targetsTable).values([
    {
      tripId: romeTrip.id,
      name: 'Rome Goal',
      targetValue: 6,
    },
    {
      tripId: barcelonaTrip.id,
      name: 'Barcelona Goal',
      targetValue: 5,
    },
    {
      tripId: philippinesTrip.id,
      name: 'Philippines Goal',
      targetValue: 8,
    },
  ]);
}