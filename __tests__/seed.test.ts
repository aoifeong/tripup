import { seedCategories, seedTrips } from '../db/seed-data';

describe('Seed data', () => {
  it('contains trips and categories', () => {
    expect(seedTrips.length).toBeGreaterThan(0);
    expect(seedCategories.length).toBeGreaterThan(0);
  });

  it('trip records have required fields', () => {
    expect(seedTrips[0]).toHaveProperty('title');
    expect(seedTrips[0]).toHaveProperty('destination');
    expect(seedTrips[0]).toHaveProperty('startDate');
  });
});