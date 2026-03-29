import TripCard from '@/components/TripCard';
import { useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';

type Trip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
};

export default function IndexScreen() {
  const [trips, setTrips] = useState<Trip[]>([
    { id: 1, title: 'Paris Trip', destination: 'France', startDate: '2026-06-10' },
    { id: 2, title: 'Rome Getaway', destination: 'Italy', startDate: '2026-07-02' },
    { id: 3, title: 'Barcelona Holiday', destination: 'Spain', startDate: '2026-08-15' },
  ]);

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const saveTrip = () => {
  if (!title.trim()) return;

  if (editingId) {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === editingId
          ? { ...trip, title, destination, startDate }
          : trip
      )
    );
    setEditingId(null);
  } else {
    const newTrip = {
      id: Date.now(),
      title,
      destination,
      startDate,
    };

    setTrips((prev) => [...prev, newTrip]);
  }

  setTitle('');
  setDestination('');
  setStartDate('');
};

  const removeTrip = (id: number) => {
  setTrips((prev) => prev.filter((trip) => trip.id !== id));
};

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>My Trips</Text>

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

      <Button
  title={editingId ? "Save Changes" : "Add Trip"}
  onPress={saveTrip}
/>

      <View style={{ marginTop: 20 }}>
        {trips.map((trip) => (
  <TripCard
    key={trip.id}
    trip={trip}
    onRemove={removeTrip}
    onEdit={(trip) => {
      setEditingId(trip.id);
      setTitle(trip.title);
      setDestination(trip.destination);
      setStartDate(trip.startDate);
    }}
  />
))}
      </View>
    </ScrollView>
  );
}