import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { Trip, TripContext } from '../../_layout';

export default function EditTrip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(TripContext);

  if (!context) return null;

  const { trips, setTrips } = context;

  const trip = trips.find((t: Trip) => t.id === Number(id));

  if (!trip) return null;

  const [title, setTitle] = useState(trip.title);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState(trip.startDate);

const saveChanges = async () => {
  await db
    .update(tripsTable)
    .set({
      title,
      destination,
      startDate,
    })
    .where(eq(tripsTable.id, Number(id)));

  const rows = await db.select().from(tripsTable);
  setTrips(rows);
  router.back();
};

  return (
    <View style={{ padding: 20 }}>
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput value={destination} onChangeText={setDestination} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput value={startDate} onChangeText={setStartDate} style={{ borderWidth: 1, marginBottom: 12, padding: 10 }} />

      <Button title="Save Changes" onPress={saveChanges} />
    </View>
  );
}