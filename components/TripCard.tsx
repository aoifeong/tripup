import { colors, radius, spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
// ✅ ADD THIS at the top
import { Trip } from '@/app/_layout';

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/trip/[id]',
          params: { id: trip.id },
        })
      }
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`${trip.title} in ${trip.destination}`}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
        }}
      >
        {/* Destination */}
        <Text style={{
          fontSize: 12,
          fontWeight: '600',
          color: colors.muted,
          marginBottom: spacing.xs,
          textTransform: 'uppercase',
        }}>
          {trip.destination}
        </Text>

        {/* Title */}
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: spacing.sm,
          lineHeight: 24,
        }}
        numberOfLines={2}
        >
          {trip.title}
        </Text>

        {/* Date Range */}
        <Text style={{
          fontSize: 13,
          color: colors.muted,
          marginBottom: spacing.md,
        }}>
          {formatDate(trip.startDate)}{trip.endDate ? ` - ${formatDate(trip.endDate)}` : ''}
        </Text>

        {/* View Trip Button */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/trip/[id]',
              params: { id: trip.id },
            })
          }
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 8,
            borderRadius: radius.md,
            alignItems: 'center',
            opacity: pressed ? 0.9 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel={`View ${trip.title}`}
        >
          <Text style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: 13,
          }}>
            View Trip
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
