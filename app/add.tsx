import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { TripContext } from './_layout';

export default function AddTrip() {
  const router = useRouter();
  const context = useContext(TripContext);

  if (!context) return null;

  const { setTrips } = context;

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');

  const saveTrip = async () => {
    await db.insert(tripsTable).values({
      title,
      destination,
      startDate,
    });

    const rows = await db.select().from(tripsTable);
    setTrips(rows);

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Trip title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Start date"
        value={startDate}
        onChangeText={setStartDate}
        style={{ borderWidth: 1, marginBottom: 12, padding: 10, borderRadius: 8 }}
      />

      <Button title="Save Trip" onPress={saveTrip} />
    </View>
  );
}