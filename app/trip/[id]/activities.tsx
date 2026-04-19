import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

type ActivityRow = {
  id: number;
  title: string;
  date: string;
  duration: number;
  categoryName: string | null;
  categoryColor: string | null;
};

const getCategoryColor = (colorName: string | null): string => {
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    orange: '#f97316',
    amber: '#eab308',
    yellow: '#eab308',
    lime: '#84cc16',
    green: '#22c55e',
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    blue: '#3b82f6',
    indigo: '#6366f1',
    violet: '#a855f7',
    purple: '#a855f7',
    pink: '#ec4899',
  };
  return colorMap[colorName?.toLowerCase() || 'blue'] || '#3b82f6';
};

export default function TripActivities() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const loadActivities = async () => {
      const rows = await db
        .select({
          id: activitiesTable.id,
          title: activitiesTable.title,
          date: activitiesTable.date,
          duration: activitiesTable.duration,
          categoryName: categoriesTable.name,
          categoryColor: categoriesTable.color,
        })
        .from(activitiesTable)
        .leftJoin(
          categoriesTable,
          eq(activitiesTable.categoryId, categoriesTable.id)
        )
        .where(eq(activitiesTable.tripId, Number(id)));

      setActivities(rows);
    };

    loadActivities();
  }, [id]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categoryOptions = [
    'All',
    ...Array.from(
      new Set(
        activities
          .map((activity) => activity.categoryName)
          .filter((name): name is string => !!name)
      )
    ).sort(),
  ];

  const filteredActivities = activities.filter((activity) => {
    const categoryLabel = activity.categoryName ?? 'Unknown';

    const matchesSearch =
      normalizedQuery.length === 0 ||
      activity.title.toLowerCase().includes(normalizedQuery) ||
      categoryLabel.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      selectedCategory === 'All' || categoryLabel === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 4,
          }}>
            Activities
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.muted,
          }}>
            {filteredActivities.length} of {activities.length} activities
          </Text>
        </View>

        {/* Add Activity Button - One main action */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/trip/[id]/add-activity',
              params: { id },
            })
          }
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
          accessibilityLabel="Add new activity"
        >
          <Text style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: 14,
          }}>
            + Add Activity
          </Text>
        </Pressable>

        {/* Search Bar */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search activities..."
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
          accessibilityLabel="Search activities by name or category"
        />

        {/* Category Filter - Visible, Simple, Reversible */}
        <View style={{
          marginBottom: spacing.lg,
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.muted,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
          }}>
            Filter by category
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {categoryOptions.map((categoryName) => {
              const isSelected = selectedCategory === categoryName;

              return (
                <Pressable
                  key={categoryName}
                  onPress={() => setSelectedCategory(categoryName)}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: isSelected ? colors.primary : colors.card,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${categoryName}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={{
                    color: isSelected ? '#fff' : colors.text,
                    fontWeight: isSelected ? '600' : '500',
                    fontSize: 13,
                  }}>
                    {categoryName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.lg }}>
            <Text style={{
              textAlign: 'center',
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: spacing.sm,
            }}>
              No activities found
            </Text>
            <Text style={{
              textAlign: 'center',
              color: colors.muted,
              fontSize: 13,
            }}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No activities in ${selectedCategory}`}
            </Text>
            {searchQuery && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={{ marginTop: spacing.md }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  Clear search
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {filteredActivities.map((activity) => {
              const categoryColor = getCategoryColor(activity.categoryColor);

              return (
                <View
                  key={activity.id}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                    overflow: 'hidden',
                  }}
                >
                  {/* Card Header */}
                  <View style={{
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: spacing.sm,
                    }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        flex: 1,
                        marginRight: spacing.md,
                      }}>
                        {activity.title}
                      </Text>
                      <View style={{
                        backgroundColor: categoryColor,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}>
                        <Text style={{
                          fontSize: 11,
                          color: '#fff',
                          fontWeight: '600',
                        }}>
                          {activity.categoryName ?? 'Other'}
                        </Text>
                      </View>
                    </View>
                    <Text style={{
                      color: colors.muted,
                      fontSize: 12,
                    }}>
                      {activity.date}
                    </Text>
                  </View>

                  {/* Card Body */}
                  <View style={{
                    padding: spacing.md,
                  }}>
                    <Text style={{
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: '700',
                    }}>
                      {activity.duration}h
                    </Text>
                    <Text style={{
                      color: colors.muted,
                      fontSize: 12,
                    }}>
                      Duration
                    </Text>
                  </View>

                  {/* Card Actions */}
                  <View style={{
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/trip/[id]/edit-activity',
                          params: {
                            id: id?.toString(),
                            activityId: activity.id.toString(),
                          },
                        })
                      }
                      style={({ pressed }) => ({
                        flex: 1,
                        padding: spacing.md,
                        alignItems: 'center',
                        borderRightWidth: 1,
                        borderRightColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${activity.title}`}
                    >
                      <Text style={{
                        color: colors.primary,
                        fontWeight: '600',
                        fontSize: 13,
                      }}>
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        await db
                          .delete(activitiesTable)
                          .where(eq(activitiesTable.id, activity.id));
                        const updated = activities.filter((a) => a.id !== activity.id);
                        setActivities(updated);
                      }}
                      style={({ pressed }) => ({
                        flex: 1,
                        padding: spacing.md,
                        alignItems: 'center',
                        opacity: pressed ? 0.7 : 1,
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${activity.title}`}
                    >
                      <Text style={{
                        color: '#dc2626',
                        fontWeight: '600',
                        fontSize: 13,
                      }}>
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  );
}
