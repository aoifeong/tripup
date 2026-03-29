import { Button, Text, View } from 'react-native';

type Trip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
};

type Props = {
  trip: Trip;
  onRemove: (id: number) => void;
  onEdit: (trip: Trip) => void;
};

export default function TripCard({ trip, onRemove, onEdit }: Props) {
  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        marginBottom: 10,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 18 }}>{trip.title}</Text>
      <Text>{trip.destination}</Text>
      <Text>{trip.startDate}</Text>

      <Button title="Remove" onPress={() => onRemove(trip.id)} />
      <Button title="Edit" onPress={() => onEdit(trip)} />
    </View>
  );
}