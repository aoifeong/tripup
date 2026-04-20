import { hashPassword } from '@/utils/hash';
import { db } from './client';
import { activitiesTable, categoriesTable, targetsTable, tripsTable, usersTable } from './schema';

// runs once on first app launch to fill the db with demo data
// bails out early if there's already stuff there so it dont dupe
export async function seedDatabaseIfEmpty() {
  const existingTrips = await db.select().from(tripsTable);
  if (existingTrips.length > 0) return;

  // make the demo user first so it can grab the id for the trips below
  // password is hashed before storing, never plaintext
 const [demoUser] = await db
  .insert(usersTable)
  .values({
    name: 'Demo User',
    email: 'demo@example.com',
    password: await hashPassword('demo123'),
  })
  .returning();

  // trips belong to the demo user
  await db.insert(tripsTable).values([
  {
    userId: demoUser.id,
    title: 'Rome Getaway',
    destination: 'Italy',
    startDate: '2026-07-02',
    endDate: '2026-07-09',
  },
  {
    userId: demoUser.id,
    title: 'Barcelona Holiday',
    destination: 'Spain',
    startDate: '2026-08-15',
    endDate: '2026-08-22',
  },
  {
    userId: demoUser.id,
    title: 'Philippines',
    destination: 'Manila',
    startDate: '2026-09-06',
    endDate: '2026-09-20',
  },
]);

  const trips = await db.select().from(tripsTable);

  // categories are global so every user can use them, no userId needed
  await db.insert(categoriesTable).values([
    { name: 'Sightseeing', color: '#3b82f6' },
    { name: 'Food', color: '#f97316' },
    { name: 'Adventure', color: '#22c55e' },
    { name: 'Sports', color: '#a855f7' },
  ]);

  const categories = await db.select().from(categoriesTable);

  // grab each trip + category by name to link activities to them by id
  const romeTrip = trips.find((trip) => trip.title === 'Rome Getaway');
  const barcelonaTrip = trips.find((trip) => trip.title === 'Barcelona Holiday');
  const philippinesTrip = trips.find((trip) => trip.title === 'Philippines');

  const sightseeing = categories.find((cat) => cat.name === 'Sightseeing');
  const food = categories.find((cat) => cat.name === 'Food');
  const adventure = categories.find((cat) => cat.name === 'Adventure');
  const sports = categories.find((cat) => cat.name === 'Sports');

  // bail if anything's missing, dont crash on undefined ids
  if (!romeTrip || !barcelonaTrip || !philippinesTrip) return;
  if (!sightseeing || !food || !adventure || !sports) return;

  // activities for each trip
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

  // one target per trip
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