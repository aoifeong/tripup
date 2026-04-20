import { TripContext } from '@/app/_layout';
import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// form for editing an existing trip; pre-fills with the current values from context
export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const context = useContext(TripContext);
  const themeContext = useContext(ThemeContext);
  const router = useRouter();

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  // find the trip in context. all hooks have to be called before any early returns
  // otherwise react complains about hook order changing between renders
  const trip = context?.trips.find((t) => t.id === Number(id));

  // pre-fill the form with the current trip values
  const [title, setTitle] = useState(trip?.title ?? '');
  const [destination, setDestination] = useState(trip?.destination ?? '');
  const [startDate, setStartDate] = useState(trip?.startDate ?? '');
  const [endDate, setEndDate] = useState(trip?.endDate ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!context || !id) return null;
  if (!trip) return null;

  const { setTrips } = context;

  const validateDate = (dateStr: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      if (!title.trim()) {
        setError('Trip title is required');
        setLoading(false);
        return;
      }

      if (!destination.trim()) {
        setError('Destination is required');
        setLoading(false);
        return;
      }

      if (!validateDate(startDate)) {
        setError('Invalid start date. Use YYYY-MM-DD');
        setLoading(false);
        return;
      }

      // end date is optional but if provided it has to be valid and after start
      if (endDate.trim()) {
        if (!validateDate(endDate)) {
          setError('Invalid end date format. Use YYYY-MM-DD');
          setLoading(false);
          return;
        }
        if (new Date(endDate) < new Date(startDate)) {
          setError('End date must be after start date');
          setLoading(false);
          return;
        }
      }

      // update the trip in the db, then refresh context so the list shows the new values
      await db
        .update(tripsTable)
        .set({
          title: title.trim(),
          destination: destination.trim(),
          startDate,
          // empty string becomes null so the column is properly cleared
          endDate: endDate.trim() || null,
        })
        .where(eq(tripsTable.id, trip.id));

      const tripRows = await db.select().from(tripsTable);
      setTrips(tripRows);

      router.back();
    } catch (err) {
      setError('Failed to update trip. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid = title.trim().length > 0 && destination.trim().length > 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Trip' }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.text,
              marginBottom: spacing.sm,
            }}
          >
            Edit Trip
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Update your trip details
          </Text>
        </View>

        {error ? (
          <View
            style={{
              backgroundColor: '#fee2e2',
              borderWidth: 1,
              borderColor: '#fca5a5',
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
            }}
            accessible={true}
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
          >
            <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '500' }}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Trip Title
          </Text>
          <TextInput
            placeholder="Trip title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.muted}
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              color: colors.text,
              fontSize: 15,
            }}
            accessibilityLabel="Trip title"
          />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Destination
          </Text>
          <TextInput
            placeholder="Destination"
            value={destination}
            onChangeText={setDestination}
            placeholderTextColor={colors.muted}
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              color: colors.text,
              fontSize: 15,
            }}
            accessibilityLabel="Destination"
          />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Start Date
          </Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
            placeholderTextColor={colors.muted}
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              color: colors.text,
              fontSize: 15,
            }}
            accessibilityLabel="Start date"
          />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            End Date (Optional)
          </Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
            placeholderTextColor={colors.muted}
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              color: colors.text,
              fontSize: 15,
            }}
            accessibilityLabel="End date"
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!isFormValid || loading}
          style={({ pressed }) => ({
            backgroundColor: isFormValid && !loading ? colors.primary : colors.border,
            paddingVertical: 14,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            marginBottom: spacing.sm,
            opacity: pressed && isFormValid && !loading ? 0.9 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: isFormValid && !loading ? '#fff' : colors.muted,
                fontWeight: '600',
                fontSize: 15,
                letterSpacing: 0.5,
              }}
            >
              Save Changes
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={loading}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 12,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            opacity: pressed && !loading ? 0.7 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>
            Cancel
          </Text>
        </Pressable>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </>
  );
}