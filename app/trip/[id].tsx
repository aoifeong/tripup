import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Trip, TripContext } from '../_layout';

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(TripContext);
  const [loading, setLoading] = useState(false);

  if (!context) return null;

  const { trips, setTrips } = context;

  const trip = trips.find((t: Trip) => t.id === Number(id));

  if (!trip) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16 }}>Trip not found</Text>
      </View>
    );
  }

  const deleteTrip = async () => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          setLoading(true);
          try {
            await db.delete(tripsTable).where(eq(tripsTable.id, Number(id)));
            const rows = await db.select().from(tripsTable);
            setTrips(rows);
            router.back();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete trip. Please try again.');
            setLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Trip Info Card */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.card,
          padding: spacing.lg,
          marginBottom: spacing.lg,
        }}
      >
        {/* Destination Badge */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.muted,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          📍 {trip.destination.toUpperCase()}
        </Text>

        {/* Trip Title */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.sm,
            lineHeight: 32,
          }}
        >
          {trip.title}
        </Text>

        {/* Date Range */}
        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
            marginBottom: spacing.md,
            lineHeight: 20,
          }}
        >
          {formatDate(trip.startDate)}
          {trip.endDate && ` — ${formatDate(trip.endDate)}`}
        </Text>

        {/* Divider */}
        <View
          style={{
            height: 0.5,
            backgroundColor: colors.border,
            marginVertical: spacing.md,
          }}
        />

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <View>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: 4,
                textTransform: 'uppercase',
              }}
            >
              Status
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.text,
              }}
            >
              Planned
            </Text>
          </View>
        </View>
      </View>

      {/* Main Action - View Activities */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/trip/[id]/activities',
            params: { id },
          })
        }
        disabled={loading}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          paddingVertical: 16,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          marginBottom: spacing.lg,
          opacity: pressed && !loading ? 0.9 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="View activities for this trip"
      >
        <Text
          style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          View Activities
        </Text>
      </Pressable>

      {/* Secondary Navigation - 3 Column Grid */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.muted,
            marginBottom: spacing.md,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Quick Links
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          {/* Targets */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/trip/[id]/targets',
                params: { id },
              })
            }
            disabled={loading}
            style={({ pressed }) => ({
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingVertical: 12,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
              backgroundColor: colors.card,
              opacity: pressed && !loading ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="View trip targets"
          >
            <Text
              style={{
                fontSize: 24,
                marginBottom: 4,
              }}
            >
              🎯
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Targets
            </Text>
          </Pressable>

          {/* Insights */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/trip/[id]/insights',
                params: { id },
              })
            }
            disabled={loading}
            style={({ pressed }) => ({
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingVertical: 12,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
              backgroundColor: colors.card,
              opacity: pressed && !loading ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="View trip insights"
          >
            <Text
              style={{
                fontSize: 24,
                marginBottom: 4,
              }}
            >
              📊
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Insights
            </Text>
          </Pressable>

          {/* Categories */}
          <Pressable
            onPress={() => router.push('/categories')}
            disabled={loading}
            style={({ pressed }) => ({
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingVertical: 12,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
              backgroundColor: colors.card,
              opacity: pressed && !loading ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Manage categories"
          >
            <Text
              style={{
                fontSize: 24,
                marginBottom: 4,
              }}
            >
              🏷️
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Categories
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 0.5,
          backgroundColor: colors.border,
          marginVertical: spacing.lg,
        }}
      />

      {/* Edit Button - Secondary Action */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/trip/[id]/edit',
            params: { id },
          })
        }
        disabled={loading}
        style={({ pressed }) => ({
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 12,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          backgroundColor: colors.card,
          marginBottom: spacing.sm,
          opacity: pressed && !loading ? 0.7 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Edit trip details"
      >
        <Text
          style={{
            color: colors.primary,
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          Edit Trip
        </Text>
      </Pressable>

      {/* Delete Button - Destructive Action */}
      <Pressable
        onPress={deleteTrip}
        disabled={loading}
        style={({ pressed }) => ({
          backgroundColor: '#fee2e2',
          borderWidth: 1,
          borderColor: '#fca5a5',
          paddingVertical: 12,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          opacity: pressed && !loading ? 0.8 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Delete this trip"
      >
        <Text
          style={{
            color: '#dc2626',
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          Delete Trip
        </Text>
      </Pressable>

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}
