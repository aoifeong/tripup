import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

type ActivityRow = {
  id: number;
  title: string;
  date: string;
  duration: number;
  categoryName: string | null;
  categoryColor: string | null;
};

type CategoryTotal = {
  name: string;
  totalHours: number;
  color: string;
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

export default function InsightsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activities, setActivities] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const loadInsights = async () => {
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

    loadInsights();
  }, [id]);

  const totalActivities = activities.length;
  const totalHours = activities.reduce(
    (sum, activity) => sum + activity.duration,
    0
  );

  const groupedTotals: CategoryTotal[] = Object.values(
    activities.reduce((acc, activity) => {
      const category = activity.categoryName ?? 'Unknown';
      const categoryColor = getCategoryColor(activity.categoryColor);

      if (!acc[category]) {
        acc[category] = { name: category, totalHours: 0, color: categoryColor };
      }

      acc[category].totalHours += activity.duration;
      return acc;
    }, {} as Record<string, CategoryTotal>)
  );

  const maxHours =
    groupedTotals.length > 0
      ? Math.max(...groupedTotals.map((item) => item.totalHours))
      : 1;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
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
          Insights
        </Text>
        <Text style={{
          fontSize: 13,
          color: colors.muted,
        }}>
          Trip analytics
        </Text>
      </View>

      {/* Summary Stats */}
      <View style={{
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
      }}>
        <View style={{
          flex: 1,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          backgroundColor: colors.card,
        }}>
          <Text style={{
            fontSize: 12,
            color: colors.muted,
            fontWeight: '500',
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>
            Activities
          </Text>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
          }}>
            {totalActivities}
          </Text>
        </View>

        <View style={{
          flex: 1,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          backgroundColor: colors.card,
        }}>
          <Text style={{
            fontSize: 12,
            color: colors.muted,
            fontWeight: '500',
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>
            Total Hours
          </Text>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.primary,
          }}>
            {totalHours}h
          </Text>
        </View>
      </View>

      {/* Breakdown Chart */}
      {groupedTotals.length > 0 && (
        <View style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          backgroundColor: colors.card,
          marginBottom: spacing.lg,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.lg,
          }}>
            Hours by Category
          </Text>

          {groupedTotals.map((item) => {
            const barWidthPercent = (item.totalHours / maxHours) * 100;
            const percentage = totalHours > 0 
              ? Math.round((item.totalHours / totalHours) * 100)
              : 0;

            return (
              <View key={item.name} style={{ marginBottom: spacing.lg }}>
                {/* Label */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 8,
                    flex: 1 
                  }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: item.color,
                      }}
                      accessible={false}
                    />
                    <Text style={{
                      color: colors.text,
                      fontSize: 13,
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={{
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: '600',
                  }}>
                    {item.totalHours}h ({percentage}%)
                  </Text>
                </View>

                {/* Bar */}
                <View
                  style={{
                    height: 8,
                    backgroundColor: colors.border,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                  accessible={true}
                  accessibilityLabel={`${item.name}: ${item.totalHours} hours, ${percentage}% of total`}
                >
                  <View
                    style={{
                      width: `${barWidthPercent}%`,
                      height: 8,
                      backgroundColor: item.color,
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Empty State */}
      {totalActivities === 0 && (
        <View style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.lg,
          backgroundColor: colors.card,
          alignItems: 'center',
        }}>
          <Text style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}>
            No activities yet
          </Text>
          <Text style={{
            color: colors.muted,
            fontSize: 13,
            textAlign: 'center',
          }}>
            Add your first activity to see insights
          </Text>
        </View>
      )}

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}
