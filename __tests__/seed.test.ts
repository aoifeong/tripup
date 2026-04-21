import { seedDatabaseIfEmpty } from '../db/seed';

// mock the hash helper so we dont actually run crypto in tests
jest.mock('../utils/hash', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password-123'),
}));

// fake the db so we can track what gets called without touching sqlite
// returning() gives us a fake inserted user with id=1 so the seed can use it
const mockInsert: jest.Mock = jest.fn(() => ({
  values: jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue([{ id: 1, name: 'Demo User' }]),
  }),
}));

// first select call returns empty (so seed runs)
// subsequent select calls return back what the seed just "inserted"
const mockSelect = jest.fn();

jest.mock('../db/client', () => ({
  db: {
    select: (arg?: any) => mockSelect(arg),
    insert: (arg?: any) => mockInsert(arg),
  },
}));

describe('seedDatabaseIfEmpty', () => {
  beforeEach(() => {
  jest.clearAllMocks();
  // first trips query returns empty (so seed runs), then later queries return seeded data
  let tripsQueryCount = 0;

  mockSelect.mockImplementation(() => ({
    from: jest.fn().mockImplementation((table: any) => {
      const name = table?.[Symbol.for('drizzle:Name')] ?? '';
      if (name === 'trips') {
        tripsQueryCount++;
        // first call is the "is the db empty?" check - return empty so seed runs
        if (tripsQueryCount === 1) return Promise.resolve([]);
        // later calls (e.g. to find trips by title) get the seeded data
        return Promise.resolve([
          { id: 1, title: 'Rome Getaway' },
          { id: 2, title: 'Barcelona Holiday' },
          { id: 3, title: 'Philippines' },
        ]);
      }
      if (name === 'categories') {
        return Promise.resolve([
          { id: 1, name: 'Sightseeing' },
          { id: 2, name: 'Food' },
          { id: 3, name: 'Adventure' },
          { id: 4, name: 'Sports' },
        ]);
      }
      return Promise.resolve([]);
    }),
  }));
});

  it('inserts into all five core tables when the database is empty', async () => {
    await seedDatabaseIfEmpty();

    // one insert call per core table: users, trips, categories, activities, targets
    expect(mockInsert).toHaveBeenCalledTimes(5);
  });

  it('does not insert anything if trips already exist (prevents duplicates)', async () => {
    // override select to return a pre-existing trip on the first call
    mockSelect.mockImplementationOnce(() => ({
      from: jest.fn().mockResolvedValue([{ id: 99, title: 'Already here' }]),
    }));

    await seedDatabaseIfEmpty();

    // seed should bail out early - no inserts at all
    expect(mockInsert).not.toHaveBeenCalled();
  });
});