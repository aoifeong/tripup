import { Trip } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

type Props = {
  trip: Trip;
};

export default function TripCard({ trip }: Props) {
  const router = useRouter();

  const openDetails = () => {
    router.push({
      pathname: '/trip/[id]',
      params: { id: trip.id.toString() },
    });
  };

  return (
    <Pressable
      accessibilityLabel={`${trip.title}, ${trip.destination}, view details`}
      accessibilityRole="button"
      onPress={openDetails}
      style={({ pressed }) => [
        {
          padding: 12,
          borderWidth: 1,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: '#fff',
        },
        pressed ? { opacity: 0.85 } : null,
      ]}
    >
      <Text style={{ fontSize: 18 }}>{trip.title}</Text>
      <Text>{trip.destination}</Text>
      <Text>{trip.startDate}</Text>
    </Pressable>
  );
}