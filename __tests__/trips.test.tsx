import { seedDatabaseIfEmpty } from '../db/seed';

// mock hash so tests dont run real crypto
jest.mock('../utils/hash', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password-123'),
}));

// in-memory fake "db" that remembers what gets inserted so can read it back
// this is the integration bit- seed writes, read back and check
const fakeDb: Record<string, any[]> = {
  users: [],
  trips: [],
  categories: [],
  activities: [],
  targets: [],
};

const resolveTableName = (table: any): string => {
  // drizzle tables store their name in a symbol
  return table?.[Symbol.for('drizzle:Name')] ?? '';
};

jest.mock('../db/client', () => ({
  db: {
    select: () => ({
      from: (table: any) => {
        const name = resolveTableName(table);
        return Promise.resolve(fakeDb[name] ?? []);
      },
    }),
    insert: (table: any) => ({
      values: (rows: any | any[]) => {
        const name = resolveTableName(table);
        const rowsArray = Array.isArray(rows) ? rows : [rows];
        // auto-assign ids like sqlite would
        const startId = fakeDb[name].length + 1;
        const withIds = rowsArray.map((row, i) => ({ id: startId + i, ...row }));
        fakeDb[name].push(...withIds);
        return {
          returning: () => Promise.resolve(withIds),
        };
      },
    }),
  },
}));

describe('Trips integration - seed to list flow', () => {
  beforeEach(() => {
    // reset fake db between tests
    Object.keys(fakeDb).forEach((key) => {
      fakeDb[key] = [];
    });
  });

  it('seeds the database and the trips table is populated with the demo trips', async () => {
    // act: run the seed function
    await seedDatabaseIfEmpty();

    // assert the trips list (what a list screen would query) has the seeded trips
    expect(fakeDb.trips.length).toBe(3);

    const titles = fakeDb.trips.map((t) => t.title);
    expect(titles).toContain('Rome Getaway');
    expect(titles).toContain('Barcelona Holiday');
    expect(titles).toContain('Philippines');
  });

  it('each seeded trip is attached to the demo user', async () => {
    await seedDatabaseIfEmpty();

    // demo user gets id 1 because they're inserted first
    expect(fakeDb.users.length).toBe(1);
    const demoUser = fakeDb.users[0];
    expect(demoUser.email).toBe('demo@example.com');

    // every trip should be linked to that user
    fakeDb.trips.forEach((trip) => {
      expect(trip.userId).toBe(demoUser.id);
    });
  });

  it('categories, activities and targets are all seeded too', async () => {
    await seedDatabaseIfEmpty();

    expect(fakeDb.categories.length).toBe(4);
    expect(fakeDb.activities.length).toBeGreaterThan(0);
    expect(fakeDb.targets.length).toBe(3);
  });
});