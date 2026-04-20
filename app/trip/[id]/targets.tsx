import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable, targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

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

type Target = {
  id: number;
  tripId: number;
  name: string;
  targetValue: number;
};

type CategoryStat = {
  categoryId: number;
  categoryName: string;
  color: string;
  count: number;
  duration: number;
};

// targets screen; shows progress against the trip's target activity count
// plus a per-category breakdown of time spent
export default function TargetsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeContext = useContext(ThemeContext);

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [target, setTarget] = useState<Target | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

  // refresh on focus so newly-added activities update the progress bar
  useFocusEffect(
  useCallback(() => {
    loadData();
  }, [id])
);

  // pulls activities + the trip's target + categories and tallies them up
  const loadData = async () => {
    try {
      if (!id) return;

      // categories
      const categoryRows = await db.select().from(categoriesTable);
      const categoryMap = new Map(categoryRows.map((cat) => [cat.id, cat]));

      // activities for this trip
      const activityRows = await db
        .select()
        .from(activitiesTable)
        .where(eq(activitiesTable.tripId, Number(id)));
      setActivities(activityRows);

      // target for this trip- assuming one target per trip
      const targetRows = await db
        .select()
        .from(targetsTable)
        .where(eq(targetsTable.tripId, Number(id)));
      setTarget(targetRows[0] ?? null);

      // group activities by category to get per-category count + total duration
      const stats: Record<number, CategoryStat> = {};
      activityRows.forEach((activity) => {
        const category = categoryMap.get(activity.categoryId);
        const categoryName = category?.name || 'Unknown';
        const categoryColor = category?.color || '#3b82f6';

        if (!stats[activity.categoryId]) {
          stats[activity.categoryId] = {
            categoryId: activity.categoryId,
            categoryName,
            color: categoryColor,
            count: 0,
            duration: 0,
          };
        }
        stats[activity.categoryId].count++;
        stats[activity.categoryId].duration += activity.duration;
      });

      setCategoryStats(Object.values(stats));
    } catch (err) {
      console.error('Failed to load targets:', err);
    }
  };

  if (!id) return null;

  const totalActivities = activities.length;
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);

  // figure out progress % against the target
  // then flag whether the target was met or exceeded so the ui can change colors
  const targetValue = target?.targetValue ?? 0;
  const progress = targetValue > 0 ? (totalActivities / targetValue) * 100 : 0;
  const remaining = Math.max(targetValue - totalActivities, 0);
  const isMet = totalActivities >= targetValue && targetValue > 0;
  const isExceeded = totalActivities > targetValue && targetValue > 0;

  // three states: exceeded (purple), met (green), behind (amber)
  // colors for badge bg/border/text all change together
  const statusColor = isExceeded ? '#9333ea' : isMet ? '#22c55e' : '#f59e0b';
  const statusBg = isExceeded ? '#f3e8ff' : isMet ? '#dcfce7' : '#fef3c7';
  const statusBorder = isExceeded ? '#c084fc' : isMet ? '#86efac' : '#fcd34d';
  const statusLabel = isExceeded
    ? 'Target Exceeded!'
    : isMet
    ? 'Target Met!'
    : 'Behind Target';

  return (
    <>
      <Stack.Screen options={{ title: 'Targets' }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.lg,
          }}
        >
          Activity Targets
        </Text>

        {/* main target card; shows X / Y activities, status badge, progress bar */}
        {target ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginBottom: spacing.sm,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {target.name}
            </Text>

            {/* big number with target beside it, like "3 / 6 activities" */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 40, fontWeight: '700', color: colors.primary }}>
                {totalActivities}
              </Text>
              <Text style={{ fontSize: 18, color: colors.muted, marginLeft: 8 }}>
                / {targetValue} activities
              </Text>
            </View>

            {/* status badge with screen reader label so assistive tech announces the state */}
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: statusBg,
                borderWidth: 1,
                borderColor: statusBorder,
                paddingHorizontal: spacing.md,
                paddingVertical: 6,
                borderRadius: radius.md,
                marginBottom: spacing.md,
              }}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Target status: ${statusLabel}`}
            >
              <Text style={{ color: statusColor, fontWeight: '600', fontSize: 13 }}>
                {statusLabel}
              </Text>
            </View>

            {/* progress bar; fills based on progress %, capped at 100 so it doesnt overflow */}
            <View
              style={{
                height: 10,
                backgroundColor: colors.border,
                borderRadius: 5,
                overflow: 'hidden',
                marginBottom: spacing.sm,
              }}
            >
              <View
                style={{
                  height: '100%',
                  backgroundColor: statusColor,
                  width: `${Math.min(progress, 100)}%`,
                }}
              />
            </View>

            {/* shows "X% complete" + either "Y to go" / "Goal reached!" / "+Z over target" */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {Math.round(progress)}% complete
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {isExceeded
                  ? `+${totalActivities - targetValue} over target`
                  : remaining === 0
                  ? 'Goal reached!'
                  : `${remaining} to go`}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 14 }}>No target set for this trip</Text>
          </View>
        )}

        {/* small summary cards: total activities + total hours */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
                marginBottom: 4,
                textTransform: 'uppercase',
              }}
            >
              Activities
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
              {totalActivities}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
                marginBottom: 4,
                textTransform: 'uppercase',
              }}
            >
              Total Hours
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
              {totalDuration}
            </Text>
          </View>
        </View>

        {/* breakdown by category: each card shows count + duration + % of total time */}
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: spacing.lg,
            }}
          >
            By Category
          </Text>

          {categoryStats.length === 0 ? (
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
              <Text style={{ color: colors.muted, fontSize: 14 }}>No activities yet</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: spacing.sm }}>
                Add activities to see targets
              </Text>
            </View>
          ) : (
            <View style={{ gap: spacing.lg }}>
              {categoryStats.map((stat) => (
                <View
                  key={stat.categoryId}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.lg,
                  }}
                >
                  {/* colour dot + category name */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: spacing.md,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: stat.color,
                        marginRight: spacing.md,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        flex: 1,
                      }}
                    >
                      {stat.categoryName}
                    </Text>
                  </View>

                  <View style={{ marginBottom: spacing.md }}>
                    <View style={{ marginBottom: spacing.sm }}>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                        Activities
                      </Text>
                      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
                        {stat.count}
                      </Text>
                    </View>

                    <View>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                        Total Duration
                      </Text>
                      <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
                        {stat.duration}{' '}
                        <Text style={{ fontSize: 14, fontWeight: '400' }}>hour(s)</Text>
                      </Text>
                    </View>
                  </View>

                  {/* percentage bar of how much total time this category takes up */}
                  <View>
                    <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>
                      {totalDuration > 0
                        ? Math.round((stat.duration / totalDuration) * 100)
                        : 0}
                      % of total time
                    </Text>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.border,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: stat.color,
                          width: `${
                            totalDuration > 0 ? (stat.duration / totalDuration) * 100 : 0
                          }%`,
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </>
  );
}