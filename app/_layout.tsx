import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

export type Trip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
};

type TripContextType = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
};

export const TripContext = createContext<TripContextType | null>(null);

export default function RootLayout() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const loadTrips = async () => {
      const rows = await db.select().from(tripsTable);

      if (rows.length === 0) {
        await db.insert(tripsTable).values([
          { title: 'Paris Trip', destination: 'France', startDate: '2026-06-10' },
          { title: 'Rome Getaway', destination: 'Italy', startDate: '2026-07-02' },
          { title: 'Barcelona Holiday', destination: 'Spain', startDate: '2026-08-15' },
        ]);

        const seededRows = await db.select().from(tripsTable);
        setTrips(seededRows);
      } else {
        setTrips(rows);
      }
    };

    loadTrips();
  }, []);

  return (
    <TripContext.Provider value={{ trips, setTrips }}>
      <Stack />
    </TripContext.Provider>
  );
}