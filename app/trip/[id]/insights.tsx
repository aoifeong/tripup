import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';

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

type CategoryStats = {
  categoryId: number;
  categoryName: string;
  color: string;
  count: number;
  duration: number;
};

// day/week/month toggle controls how the bar chart data gets bucketed
type TimeView = 'day' | 'week' | 'month';

// insights screen with summary stats, pie chart for category breakdown, and bar chart for activities over time
export default function InsightsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeContext = useContext(ThemeContext);

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [categoryMap, setCategoryMap] = useState<Map<number, Category>>(new Map());
  const [timeView, setTimeView] = useState<TimeView>('day');

  // reload on focus so recently added activities show up
  useFocusEffect(
  useCallback(() => {
    loadData();
  }, [id])
);

  const loadData = async () => {
    try {
      if (!id) return;

      const categoryRows = await db.select().from(categoriesTable);
      setCategoryMap(new Map(categoryRows.map((cat) => [cat.id, cat])));

      const activityRows = await db
        .select()
        .from(activitiesTable)
        .where(eq(activitiesTable.tripId, Number(id)));
      setActivities(activityRows);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  };

  // convert any date to the monday of that week 
  // used to bucket activities into weeks for the bar chart
 const getWeekKey = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDay();
  // if sunday (0), go back 6 days. otherwise go back (day-1) days to hit monday
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().split('T')[0];
};

  // month bucket is just YYYY-MM, drops the day
  const getMonthKey = (dateStr: string): string => {
    return dateStr.substring(0, 7);
  };

  // pretty x-axis labels for the bar chart depending on which view is active
  const formatBucketLabel = (key: string, view: TimeView): string => {
  if (view === 'day') {
    const d = new Date(key);
    if (isNaN(d.getTime())) return key;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (view === 'week') {
    const d = new Date(key);
    if (isNaN(d.getTime())) return key;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  // month key is YYYY-MM, append -01 so Date can parse it
  const d = new Date(`${key}-01T00:00:00`);
  if (isNaN(d.getTime())) return key;
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

  // big useMemo that recomputes everything when activities or timeView changes
  // returns the summary stats, bar chart data, and pie chart data in one go
  const { insights, barData, pieData } = useMemo(() => {
    const totalActivities = activities.length;
    const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
    const averageDuration = totalActivities > 0 ? Math.round(totalDuration / totalActivities) : 0;

    // tally activities per category - count + total duration
    const catStats: Record<number, CategoryStats> = {};
    activities.forEach((activity) => {
      const category = categoryMap.get(activity.categoryId);
      const categoryName = category?.name || 'Unknown';
      const categoryColor = category?.color || '#3b82f6';

      if (!catStats[activity.categoryId]) {
        catStats[activity.categoryId] = {
          categoryId: activity.categoryId,
          categoryName,
          color: categoryColor,
          count: 0,
          duration: 0,
        };
      }
      catStats[activity.categoryId].count++;
      catStats[activity.categoryId].duration += activity.duration;
    });

    const statsArray = Object.values(catStats);
    // sort by count descending to find the one used most
    const mostFrequent =
      [...statsArray].sort((a, b) => b.count - a.count)[0]?.categoryName || '';

    // build the bar chart buckets based on the current time view
    const buckets: Record<string, number> = {};
    activities.forEach((a) => {
      let key: string;
      if (timeView === 'day') key = a.date;
      else if (timeView === 'week') key = getWeekKey(a.date);
      else key = getMonthKey(a.date);

      buckets[key] = (buckets[key] || 0) + 1;
    });

    // sort the keys so the bars are in chronological order
    const sortedKeys = Object.keys(buckets).sort();
    const bars = sortedKeys.map((key) => ({
      value: buckets[key],
      label: formatBucketLabel(key, timeView),
      frontColor: colors.primary,
      // topLabelComponent puts the count number right above each bar
      topLabelComponent: () => (
        <Text style={{ color: colors.text, fontSize: 10, fontWeight: '600', marginBottom: 4 }}>
          {buckets[key]}
        </Text>
      ),
    }));

    // shape the data for the pie chart; each slice = category's total duration
    const pies = statsArray.map((stat) => ({
      value: stat.duration,
      color: stat.color,
      text: totalDuration > 0 ? `${Math.round((stat.duration / totalDuration) * 100)}%` : '0%',
      label: stat.categoryName,
    }));

    return {
      insights: {
        totalActivities,
        totalDuration,
        averageDuration,
        mostFrequentCategory: mostFrequent,
        categoryStats: statsArray,
        bucketCount: sortedKeys.length,
      },
      barData: bars,
      pieData: pies,
    };
  }, [activities, categoryMap, timeView, colors.primary, colors.text]);

  if (!id) return null;

  const viewLabels: Record<TimeView, string> = {
    day: 'Daily',
    week: 'Weekly',
    month: 'Monthly',
  };

  const chartTitle =
    timeView === 'day'
      ? 'Activities per Day'
      : timeView === 'week'
      ? 'Activities per Week'
      : 'Activities per Month';

  return (
    <>
      <Stack.Screen options={{ title: 'Insights' }} />
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
            marginBottom: spacing.md,
          }}
        >
          Trip Insights
        </Text>

        {/* day/week/month segmented toggle; changes what the bar chart groups by */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: 4,
            marginBottom: spacing.lg,
          }}
          accessibilityRole="tablist"
          accessibilityLabel="Time view selector"
        >
          {(['day', 'week', 'month'] as TimeView[]).map((view) => {
            const isActive = timeView === view;
            return (
              <Pressable
                key={view}
                onPress={() => setTimeView(view)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  alignItems: 'center',
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${viewLabels[view]} view`}
              >
                <Text
                  style={{
                    color: isActive ? '#fff' : colors.text,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {viewLabels[view]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* summary stat cards; total count, total time, average, most frequent category */}
        <View style={{ gap: spacing.lg, marginBottom: spacing.xl }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: spacing.sm, textTransform: 'uppercase' }}>
              Total Activities
            </Text>
            <Text style={{ fontSize: 36, fontWeight: '700', color: colors.primary }}>
              {insights.totalActivities}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              Across {insights.bucketCount}{' '}
              {timeView === 'day'
                ? insights.bucketCount === 1
                  ? 'day'
                  : 'days'
                : timeView === 'week'
                ? insights.bucketCount === 1
                  ? 'week'
                  : 'weeks'
                : insights.bucketCount === 1
                ? 'month'
                : 'months'}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: spacing.sm, textTransform: 'uppercase' }}>
              Total Time Spent
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 36, fontWeight: '700', color: colors.primary }}>
                {insights.totalDuration}
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 4 }}>Hours</Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: spacing.sm, textTransform: 'uppercase' }}>
              Average Duration
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 36, fontWeight: '700', color: colors.primary }}>
                {insights.averageDuration}
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 4 }}>Hour per activity</Text>
            </View>
          </View>

          {insights.mostFrequentCategory && (
            <View
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.lg,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: spacing.sm, textTransform: 'uppercase' }}>
                Most Frequent Category
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
                {insights.mostFrequentCategory}
              </Text>
            </View>
          )}
        </View>

        {/* donut pie chart showing time split by category, with legend below */}
        {pieData.length > 0 && (
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.xl,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
                marginBottom: spacing.lg,
              }}
            >
              Time by Category
            </Text>

            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <PieChart
                data={pieData}
                donut
                radius={100}
                innerRadius={55}
                innerCircleColor={colors.card}
                // total hours in the middle of the donut hole
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
                      {insights.totalDuration}h
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>Total</Text>
                  </View>
                )}
              />
            </View>

            {/* legend- colour dot + category name + hours + percentage */}
            <View style={{ gap: spacing.sm }}>
              {insights.categoryStats.map((stat) => {
                const pct =
                  insights.totalDuration > 0
                    ? Math.round((stat.duration / insights.totalDuration) * 100)
                    : 0;
                return (
                  <View
                    key={stat.categoryId}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
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
                    <Text style={{ flex: 1, fontSize: 13, color: colors.text }}>
                      {stat.categoryName}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted }}>
                      {stat.duration}h ({pct}%)
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* bar chart- title and data both change based on the selected time view */}
        {barData.length > 0 && (
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.xl,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
                marginBottom: spacing.lg,
              }}
            >
              {chartTitle}
            </Text>

            <BarChart
              data={barData}
              barWidth={28}
              spacing={18}
              barBorderRadius={4}
              yAxisThickness={0}
              xAxisThickness={0}
              noOfSections={4}
              yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
              hideRules
              isAnimated
            />
          </View>
        )}

        {/* empty state if the user hasnt added any activities to this trip yet */}
        {insights.categoryStats.length === 0 && (
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
              Add activities to see insights
            </Text>
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </>
  );
}