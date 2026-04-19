import TripCard from '@/components/TripCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Trip, TripContext } from '../_layout';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(TripContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');

  if (!context) return null;

  const { trips } = context;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const destinationOptions = [
    'All',
    ...Array.from(new Set(trips.map((trip: Trip) => trip.destination))).sort(),
  ];

  const filteredTrips = trips.filter((trip: Trip) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      trip.title.toLowerCase().includes(normalizedQuery) ||
      trip.destination.toLowerCase().includes(normalizedQuery);

    const matchesDestination =
      selectedDestination === 'All' ||
      trip.destination === selectedDestination;

    return matchesSearch && matchesDestination;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
          }}>
            My Trips
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.muted,
          }}>
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} total
          </Text>
        </View>

        {/* Add Trip Button - Main Action */}
        <Pressable
          onPress={() => router.push('/add')}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            marginBottom: spacing.lg,
            opacity: pressed ? 0.9 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Plan new trip"
        >
          <Text style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: 14,
          }}>
            + Plan New Trip
          </Text>
        </Pressable>

        {/* Search Bar */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search trips or destinations..."
          placeholderTextColor={colors.muted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.card,
            color: colors.text,
            fontSize: 14,
            marginBottom: spacing.lg,
          }}
          accessibilityLabel="Search trips by name or destination"
        />

        {/* Destination Filter */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.muted,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
          }}>
            Filter by destination
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {destinationOptions.map((destination) => {
              const isSelected = selectedDestination === destination;

              return (
                <Pressable
                  key={destination}
                  onPress={() => setSelectedDestination(destination)}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: isSelected ? colors.primary : colors.card,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${destination}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={{
                    color: isSelected ? '#fff' : colors.text,
                    fontWeight: isSelected ? '600' : '500',
                    fontSize: 13,
                  }}>
                    {destination}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <View style={{
            alignItems: 'center',
            paddingVertical: spacing.lg,
          }}>
            <Text style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: spacing.sm,
            }}>
              No trips found
            </Text>
            <Text style={{
              color: colors.muted,
              fontSize: 13,
              textAlign: 'center',
            }}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No trips in ${selectedDestination}`}
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {filteredTrips.map((trip: Trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  );
}
