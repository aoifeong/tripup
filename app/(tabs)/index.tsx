import { TripContext } from '@/app/_layout';
import TripCard from '@/components/TripCard';
import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type FilterOption = string | null;

// main screen showing all trips for the logged in user
// trips come from TripContext which loads them in _layout.tsx
export default function TripsScreen() {
  const context = useContext(TripContext);
  const themeContext = useContext(ThemeContext);
  const router = useRouter();

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  if (!context) return null;

  const { trips } = context;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<FilterOption>(null);

  // build the destination filter pills from the actual trips loaded
  // Set dedupes so if i have 3 italy trips i only see 'italy' once
  const destinations = Array.from(new Set(trips.map((t) => t.destination)));

  // apply search + destination filter. useMemo so this only recalcs when something changes
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDestination = !selectedDestination || trip.destination === selectedDestination;
      return matchesSearch && matchesDestination;
    });
  }, [trips, searchQuery, selectedDestination]);

  const activeFilters = [selectedDestination].filter(Boolean).length;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* plan new trip button at the top */}
      <Pressable
        onPress={() => router.push('/add')}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          paddingVertical: 16,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          marginBottom: spacing.lg,
          opacity: pressed ? 0.9 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Plan new trip"
      >
        <Text
          style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          + Plan New Trip
        </Text>
      </Pressable>

      {/* text search; filters by trip title OR destination */}
      <TextInput
        placeholder="Search trips or destinations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.card,
          color: colors.text,
          fontSize: 15,
          marginBottom: spacing.lg,
        }}
        accessibilityLabel="Search trips"
      />

      {/* destination filter; one pill per unique destination + an "all" option */}
      <View style={{ marginBottom: spacing.lg }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.muted,
              textTransform: 'uppercase',
            }}
          >
            Filter by Destination
            {activeFilters > 0 && (
              <Text style={{ color: colors.primary }}>
                {' '}
                ({activeFilters})
              </Text>
            )}
          </Text>
          {activeFilters > 0 && (
            <Pressable
              onPress={() => setSelectedDestination(null)}
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                Clear
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Pressable
            onPress={() => setSelectedDestination(null)}
            style={({
              pressed,
            }) => ({
              backgroundColor: !selectedDestination ? colors.primary : colors.card,
              borderWidth: 1,
              borderColor: !selectedDestination ? colors.primary : colors.border,
              paddingVertical: 8,
              paddingHorizontal: spacing.md,
              borderRadius: radius.md,
              opacity: pressed ? 0.8 : 1,
            })}
            accessibilityRole="radio"
            accessibilityState={{ selected: !selectedDestination }}
            accessibilityLabel="Show all destinations"
          >
            <Text
              style={{
                color: !selectedDestination ? '#fff' : colors.text,
                fontWeight: '600',
                fontSize: 13,
              }}
            >
              All
            </Text>
          </Pressable>

          {destinations.map((destination) => (
            <Pressable
              key={destination}
              onPress={() => setSelectedDestination(destination)}
              style={({
                pressed,
              }) => ({
                backgroundColor:
                  selectedDestination === destination ? colors.primary : colors.card,
                borderWidth: 1,
                borderColor:
                  selectedDestination === destination ? colors.primary : colors.border,
                paddingVertical: 8,
                paddingHorizontal: spacing.md,
                borderRadius: radius.md,
                opacity: pressed ? 0.8 : 1,
              })}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedDestination === destination }}
              accessibilityLabel={`Filter by ${destination}`}
            >
              <Text
                style={{
                  color:
                    selectedDestination === destination ? '#fff' : colors.text,
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {destination}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* results; shows empty state copy if nothing matches, otherwise list of TripCards */}
      {filteredTrips.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.lg,
            alignItems: 'center',
            marginTop: spacing.lg,
          }}
        >
          <Text
            style={{
              color: colors.muted,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: spacing.sm,
            }}
          >
            {searchQuery || selectedDestination ? 'No results found' : 'No trips yet'}
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 13,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {searchQuery || selectedDestination
              ? `Try adjusting your search or filters`
              : `Create your first trip to get started!`}
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.lg }}>
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </View>
      )}

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}