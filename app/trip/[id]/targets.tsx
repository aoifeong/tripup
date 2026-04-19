import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { activitiesTable, targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type Target = {
  id: number;
  tripId: number;
  name: string;
  targetValue: number;
};

type Activity = {
  id: number;
  tripId: number;
  title: string;
  date: string;
  duration: number;
  categoryId: number;
};

export default function TargetsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [targets, setTargets] = useState<Target[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('');

  const loadData = async () => {
    const targetRows = await db
      .select()
      .from(targetsTable)
      .where(eq(targetsTable.tripId, Number(id)));

    const activityRows = await db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.tripId, Number(id)));

    setTargets(targetRows);
    setActivities(activityRows);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const saveTarget = async () => {
    if (!name.trim() || !targetValue.trim()) return;

    await db.insert(targetsTable).values({
      tripId: Number(id),
      name: name.trim(),
      targetValue: Number(targetValue),
    });

    setName('');
    setTargetValue('');
    loadData();
  };

  const deleteTarget = async (targetId: number) => {
    await db.delete(targetsTable).where(eq(targetsTable.id, targetId));
    loadData();
  };

  const totalHours = activities.reduce((sum, activity) => sum + activity.duration, 0);

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
            Targets
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.muted,
          }}>
            Set activity goals
          </Text>
        </View>

        {/* Create Target Form */}
        <View style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          backgroundColor: colors.card,
          marginBottom: spacing.lg,
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.md,
          }}>
            Create New Target
          </Text>

          {/* Name Input */}
          <TextInput
            placeholder="Target name (e.g., Hiking Hours)"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.muted}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.background,
              color: colors.text,
              fontSize: 14,
              marginBottom: spacing.md,
            }}
            accessibilityLabel="Target name input"
          />

          {/* Hours Input */}
          <TextInput
            placeholder="Target hours (e.g., 10)"
            value={targetValue}
            onChangeText={setTargetValue}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.background,
              color: colors.text,
              fontSize: 14,
              marginBottom: spacing.md,
            }}
            accessibilityLabel="Target hours input"
          />

          {/* Save Button */}
          <Pressable
            onPress={saveTarget}
            disabled={!name.trim() || !targetValue.trim()}
            style={({ pressed }) => ({
              backgroundColor:
                name.trim() && targetValue.trim() ? colors.primary : colors.border,
              paddingVertical: 10,
              borderRadius: radius.md,
              alignItems: 'center',
              opacity: pressed && name.trim() && targetValue.trim() ? 0.9 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Save target"
          >
            <Text style={{
              color:
                name.trim() && targetValue.trim() ? '#fff' : colors.muted,
              fontWeight: '600',
              fontSize: 13,
            }}>
              Save Target
            </Text>
          </Pressable>
        </View>

        {/* Targets List */}
        {targets.length > 0 && (
          <View>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.muted,
              marginBottom: spacing.md,
              textTransform: 'uppercase',
            }}>
              Your Targets ({targets.length})
            </Text>

            {targets.map((target) => {
              const remaining = target.targetValue - totalHours;
              const met = totalHours >= target.targetValue;
              const progressPercent = Math.min(
                (totalHours / target.targetValue) * 100,
                100
              );

              return (
                <View
                  key={target.id}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                    marginBottom: spacing.md,
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  <View style={{
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 4,
                      }}>
                        {target.name}
                      </Text>
                      <Text style={{
                        color: colors.muted,
                        fontSize: 12,
                      }}>
                        Target: {target.targetValue}h
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: met ? '#22c55e' : colors.background,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    }}>
                      <Text style={{
                        fontSize: 11,
                        color: met ? '#fff' : colors.muted,
                        fontWeight: '600',
                      }}>
                        {met ? 'Complete' : 'In Progress'}
                      </Text>
                    </View>
                  </View>

                  {/* Progress */}
                  <View style={{ padding: spacing.md }}>
                    {/* Numbers */}
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: spacing.sm,
                    }}>
                      <Text style={{
                        color: colors.text,
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        {totalHours}h of {target.targetValue}h
                      </Text>
                      <Text style={{
                        color: colors.muted,
                        fontSize: 12,
                      }}>
                        {Math.round(progressPercent)}%
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.border,
                        borderRadius: 2,
                        overflow: 'hidden',
                        marginBottom: spacing.md,
                      }}
                      accessible={true}
                      accessibilityLabel={`Progress: ${Math.round(progressPercent)}%`}
                    >
                      <View
                        style={{
                          width: `${progressPercent}%`,
                          height: 8,
                          backgroundColor: met ? '#22c55e' : colors.primary,
                          borderRadius: 2,
                        }}
                      />
                    </View>

                    {/* Status Message */}
                    <Text style={{
                      color: colors.muted,
                      fontSize: 12,
                      textAlign: 'center',
                    }}>
                      {met
                        ? 'Target complete!'
                        : `${remaining}h remaining`}
                    </Text>
                  </View>

                  {/* Delete Action */}
                  <Pressable
                    onPress={() => deleteTarget(target.id)}
                    style={({ pressed }) => ({
                      padding: spacing.md,
                      alignItems: 'center',
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${target.name}`}
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
              );
            })}
          </View>
        )}

        {targets.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
            <Text style={{
              color: colors.text,
              fontSize: 15,
              fontWeight: '600',
              marginBottom: spacing.sm,
            }}>
              No targets yet
            </Text>
            <Text style={{
              color: colors.muted,
              fontSize: 13,
              textAlign: 'center',
            }}>
              Create a target to track your progress
            </Text>
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  );
}
