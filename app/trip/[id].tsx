import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { Button, Text, View } from 'react-native';
import { Trip, TripContext } from '../_layout';

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(TripContext);

  if (!context) return null;

  const { trips, setTrips } = context;

  const trip = trips.find((t: Trip) => t.id === Number(id));

  if (!trip) return null;

 const deleteTrip = async () => {
  await db.delete(tripsTable).where(eq(tripsTable.id, Number(id)));
  const rows = await db.select().from(tripsTable);
  setTrips(rows);
  router.back();
};

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>{trip.title}</Text>
      <Text>{trip.destination}</Text>
      <Text>{trip.startDate}</Text>

      <Button title="Edit" onPress={() => router.push({pathname: '/trip/[id]/edit',params: { id },})}/>
      <Button title="Delete" onPress={deleteTrip} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}