import { Trip } from '@/app/_layout';
import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';

// formats a date into a short "Jul 2" style label for the trip list
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

// card that shows one trip in the trips list tap to navigate to its detail screen
export default function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter();
  const themeContext = useContext(ThemeContext);

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  // navigate into trip/[id]- expo-router handles the params from the path
  const handlePress = () => {
    router.push(`/trip/${trip.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.lg,
        opacity: pressed ? 0.7 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`Trip: ${trip.title}`}
      accessibilityHint={`Tap to view ${trip.title} details`}
    >
      {/* trip title + destination */}
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.xs,
          }}
        >
          {trip.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.primary,
            fontWeight: '600',
          }}
        >
          {trip.destination}
        </Text>
      </View>

      {/* date range on the left, little arrow on the right to hint its tappable */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.muted,
            fontWeight: '500',
          }}
        >
          {formatDate(trip.startDate)}
          {trip.endDate && ` - ${formatDate(trip.endDate)}`}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.primary,
            fontWeight: '600',
          }}
        >
          →
        </Text>
      </View>
    </Pressable>
  );
}