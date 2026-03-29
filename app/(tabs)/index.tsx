import { useState } from 'react';
import { Text, View } from 'react-native';

type Trip = {
  id: number;
  title: string;
  destination: string;
};

export default function IndexScreen() {
  const [trips] = useState<Trip[]>([
    { id: 1, title: 'Paris Trip', destination: 'France' },
    { id: 2, title: 'Rome Getaway', destination: 'Italy' },
    { id: 3, title: 'Barcelona Holiday', destination: 'Spain' },
  ]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>My Trips</Text>

      {trips.map((trip) => (
        <View
          key={trip.id}
          style={{
            padding: 12,
            borderWidth: 1,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>{trip.title}</Text>
          <Text>{trip.destination}</Text>
        </View>
      ))}
    </View>
  );
}