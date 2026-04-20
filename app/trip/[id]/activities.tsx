import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type Activity = {
  id: number;
  tripId: number;
  title: string;
  date: string;
  duration: number;
  categoryId: number;
};

type Category = {
  id: number;
  name: string;
  color: string;
};

// activities list for one trip. supports text search, category filter, and date range filter
export default function ActivitiesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeContext = useContext(ThemeContext);
  const router = useRouter();

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // filter state - search text, selected category, date range, and whether the filter panel is open
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // refresh every time this screen is focused so new/edited/deleted activities show up
  useFocusEffect(
  useCallback(() => {
    loadData();
  }, [id])
);

  // grab activities for this trip + all categories in parallel
  const loadData = async () => {
    try {
      if (!id) return;
      const [activityRows, categoryRows] = await Promise.all([
        db.select().from(activitiesTable).where(eq(activitiesTable.tripId, Number(id))),
        db.select().from(categoriesTable),
      ]);
      setActivities(activityRows);
      setCategories(categoryRows);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // delete an activity then refresh the list
  const handleDelete = async (activityId: number) => {
    try {
      await db.delete(activitiesTable).where(eq(activitiesTable.id, activityId));
      await loadData();
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  // map of categoryId - category, so i can look up name/color by id without nested loops
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // quick validation so a half-typed date doesnt filter everything out
  const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());

  // apply all three filters - text, category, date range. all conditions must pass (AND)
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      // text filter on activity title
      if (searchText.trim() && !a.title.toLowerCase().includes(searchText.trim().toLowerCase())) {
        return false;
      }
      // category filter
      if (selectedCategoryId !== null && a.categoryId !== selectedCategoryId) {
        return false;
      }
      // date range filter; only applied if the date is a valid YYYY-MM-DD
      // string comparison works because YYYY-MM-DD sorts the same as actual dates
      if (fromDate && isValidDate(fromDate) && a.date < fromDate) return false;
      if (toDate && isValidDate(toDate) && a.date > toDate) return false;

      return true;
    });
  }, [activities, searchText, selectedCategoryId, fromDate, toDate]);

  // reset everything back to default
  const clearFilters = () => {
    setSearchText('');
    setSelectedCategoryId(null);
    setFromDate('');
    setToDate('');
  };

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    selectedCategoryId !== null ||
    fromDate.length > 0 ||
    toDate.length > 0;

  if (!id) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Activities' }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Activity Button */}
        <Pressable
          onPress={() => router.push(`/trip/${id}/add-activity`)}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            marginBottom: spacing.lg,
            opacity: pressed ? 0.9 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Add new activity"
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15, letterSpacing: 0.5 }}>
            + Add Activity
          </Text>
        </Pressable>

        {/* search bar is always visible. filters go inside the collapsible panel below */}
        <TextInput
          placeholder="Search activities..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={colors.muted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.card,
            color: colors.text,
            fontSize: 15,
            marginBottom: spacing.md,
          }}
          accessibilityLabel="Search activities"
        />

        {/* toggle to show/hide filters. clear link appears when any filter is active */}
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            marginBottom: spacing.md,
          }}
          accessibilityRole="button"
          accessibilityLabel={showFilters ? 'Hide filters' : 'Show filters'}
        >
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>
            {showFilters ? '− Hide Filters' : '+ Show Filters'}
          </Text>
          {hasActiveFilters && (
            <Pressable onPress={clearFilters} accessibilityRole="button" accessibilityLabel="Clear all filters">
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Clear</Text>
            </Pressable>
          )}
        </Pressable>

        {/* filters panel; only rendered when showFilters is true */}
        {showFilters && (
          <View style={{ marginBottom: spacing.lg, gap: spacing.md }}>
            {/* category pills; horizontal scroll. "All" clears the category filter */}
            <View>
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
                Filter by Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
              >
                <Pressable
                  onPress={() => setSelectedCategoryId(null)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: radius.md,
                    backgroundColor: selectedCategoryId === null ? colors.primary : colors.card,
                    borderWidth: 1,
                    borderColor: selectedCategoryId === null ? colors.primary : colors.border,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedCategoryId === null }}
                >
                  <Text
                    style={{
                      color: selectedCategoryId === null ? '#fff' : colors.text,
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    All
                  </Text>
                </Pressable>
                {categories.map((cat) => {
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      // tap again to deselect
                      onPress={() => setSelectedCategoryId(isActive ? null : cat.id)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: radius.md,
                        backgroundColor: isActive ? cat.color : colors.card,
                        borderWidth: 1,
                        borderColor: isActive ? cat.color : colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter by ${cat.name}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      {!isActive && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: cat.color,
                            marginRight: 6,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          color: isActive ? '#fff' : colors.text,
                          fontWeight: '600',
                          fontSize: 13,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* date range; from/to text inputs. leave either blank to skip that bound */}
            <View>
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
                Filter by Date Range
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TextInput
                  placeholder="From (YYYY-MM-DD)"
                  value={fromDate}
                  onChangeText={setFromDate}
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                    color: colors.text,
                    fontSize: 13,
                  }}
                  accessibilityLabel="From date"
                />
                <TextInput
                  placeholder="To (YYYY-MM-DD)"
                  value={toDate}
                  onChangeText={setToDate}
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                    color: colors.text,
                    fontSize: 13,
                  }}
                  accessibilityLabel="To date"
                />
              </View>
            </View>

            {/* little result counter so user knows how many got filtered out */}
            {hasActiveFilters && (
              <Text style={{ color: colors.muted, fontSize: 12, fontStyle: 'italic' }}>
                Showing {filteredActivities.length} of {activities.length} activities
              </Text>
            )}
          </View>
        )}

        {/* three possible states; loading, empty, or list of cards */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Loading activities...</Text>
          </View>
        ) : filteredActivities.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
              alignItems: 'center',
            }}
          >
            {/* empty state copy changes depending on whether filters are active */}
            <Text
              style={{
                color: colors.muted,
                fontSize: 16,
                fontWeight: '600',
                marginBottom: spacing.sm,
              }}
            >
              {hasActiveFilters ? 'No activities match your filters' : 'No activities yet'}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>
              {hasActiveFilters
                ? 'Try adjusting or clearing filters'
                : 'Add your first activity to get started'}
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.lg }}>
            {filteredActivities.map((activity) => {
              // look up the category from the map so i can show the color dot + name
              const category = categoryMap.get(activity.categoryId);
              return (
                <View
                  key={activity.id}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.lg,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: spacing.md,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {activity.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {category && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              backgroundColor: category.color,
                            }}
                          />
                        )}
                        <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '500' }}>
                          {category?.name || 'Uncategorized'} • {activity.date}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '500' }}>
                      {activity.duration} Hour(s)
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Pressable
                      onPress={() =>
                        router.push(`/trip/${id}/edit-activity?activityId=${activity.id}`)
                      }
                      style={({ pressed }) => ({
                        flex: 1,
                        backgroundColor: colors.primary,
                        paddingVertical: 10,
                        paddingHorizontal: spacing.md,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        opacity: pressed ? 0.9 : 1,
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${activity.title}`}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Edit</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDelete(activity.id)}
                      style={({ pressed }) => ({
                        flex: 1,
                        backgroundColor: '#fee2e2',
                        borderWidth: 1,
                        borderColor: '#fca5a5',
                        paddingVertical: 10,
                        paddingHorizontal: spacing.md,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        opacity: pressed ? 0.8 : 1,
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${activity.title}`}
                    >
                      <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 13 }}>
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
    </>
  );
}
