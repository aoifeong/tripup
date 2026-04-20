import { Trip } from '@/app/_layout';
import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, Text, View } from 'react-native';

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

export default function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter();
  const themeContext = useContext(ThemeContext);

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

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
