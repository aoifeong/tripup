import { AuthContext, TripContext } from '@/app/_layout';
import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Stack, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// form for creating a new trip for the logged-in user
export default function AddTripScreen() {
  const context = useContext(TripContext);
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const router = useRouter();

  // hooks to be declared before any early return bc react complain about hook order
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);
  const currentUser = authContext?.currentUser ?? null;

  // if  this screen is reached without a logged-in user, bounce them to login
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!context || !authContext) return null;
  if (!currentUser) return null;

  const { setTrips } = context;

  // make sure the date is formatted as YYYY-MM-DD and is a real date
  const validateDate = (dateStr: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  };

  // validate all the fields then insert into the db
  // also refreshes the trips context so the trips list shows the new one immediately
  const handleAddTrip = async () => {
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

      if (!startDate.trim()) {
        setError('Start date is required (YYYY-MM-DD)');
        setLoading(false);
        return;
      }

      if (!validateDate(startDate)) {
        setError('Invalid start date format. Use YYYY-MM-DD');
        setLoading(false);
        return;
      }

      // end date is optional only validate if something was entered
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

      // insert the new trip linked to the current user
      await db.insert(tripsTable).values({
        userId: currentUser.id,
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        // empty string becomes null so the column is properly blank
        endDate: endDate.trim() || null,
      });

      // refresh trip list from db so the new one shows up in the home screen
      const tripRows = await db
        .select()
        .from(tripsTable)
        .where(eq(tripsTable.userId, currentUser.id));
      setTrips(tripRows);

      router.back();
    } catch (err) {
      setError('Failed to add trip. Please try again.');
      setLoading(false);
    }
  };

  // disables the save button until all required fields have something in them
  const isFormValid =
    title.trim().length > 0 && destination.trim().length > 0 && startDate.trim().length > 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Add Trip' }} />
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
            Plan New Trip
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Create a new trip to organise your adventures
          </Text>
        </View>

        {/* red error banner*/}
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
            <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '500' }}>{error}</Text>
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
            placeholder="e.g., Summer Vacation"
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
            accessibilityHint="Enter the name of your trip"
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
            placeholder="e.g., Paris, France"
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
            accessibilityHint="Enter your trip destination"
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
            accessibilityHint="Enter start date in YYYY-MM-DD format"
          />
        </View>

        {/* end date is optional- user can leave it blank for trips without a fixed end */}
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
            accessibilityHint="Enter end date in YYYY-MM-DD format, optional"
          />
        </View>

        <Pressable
          onPress={handleAddTrip}
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
          accessibilityLabel="Create trip"
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
              Create Trip
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
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Cancel</Text>
        </Pressable>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </>
  );
}