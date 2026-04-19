import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { activitiesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditActivity() {
  const { id, activityId } = useLocalSearchParams<{
    id: string;
    activityId: string;
  }>();

  const router = useRouter();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const result = await db
          .select()
          .from(activitiesTable)
          .where(eq(activitiesTable.id, Number(activityId)));

        if (result.length > 0) {
          const activity = result[0];
          setTitle(activity.title);
          setDate(activity.date);
          setDuration(String(activity.duration));
        } else {
          setError('Activity not found');
        }
      } catch (err) {
        setError('Failed to load activity');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [activityId]);

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Activity title is required';
    if (!date.trim()) return 'Date is required';
    if (!duration.trim()) return 'Duration is required';
    if (isNaN(Number(duration))) return 'Duration must be a number';
    if (Number(duration) <= 0) return 'Duration must be greater than 0';
    return null;
  };

  const updateActivity = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await db
        .update(activitiesTable)
        .set({
          title: title.trim(),
          date: date.trim(),
          duration: Number(duration),
        })
        .where(eq(activitiesTable.id, Number(activityId)));

      router.back();
    } catch (err) {
      setError('Failed to update activity. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid =
    title.trim().length > 0 &&
    date.trim().length > 0 &&
    duration.trim().length > 0 &&
    !isNaN(Number(duration)) &&
    Number(duration) > 0;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Edit Activity
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          Update activity details
        </Text>
      </View>

      {/* Error State */}
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
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <Text
            style={{
              color: '#dc2626',
              fontSize: 13,
              fontWeight: '500',
            }}
          >
            {error}
          </Text>
        </View>
      ) : null}

      {/* Activity Title */}
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
          Activity Title
        </Text>
        <TextInput
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
          accessibilityLabel="Activity title"
        />
      </View>

      {/* Date */}
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
          Date
        </Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
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
          accessibilityLabel="Activity date"
        />
      </View>

      {/* Duration */}
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
          Duration (Hours)
        </Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
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
          accessibilityLabel="Activity duration"
        />
      </View>

      {/* Save Button - Main Action */}
      <Pressable
        onPress={updateActivity}
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
        accessibilityLabel="Update activity"
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
            Save Changes
          </Text>
        )}
      </Pressable>

      {/* Cancel Button - Secondary */}
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
        <Text
          style={{
            color: colors.text,
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          Cancel
        </Text>
      </Pressable>

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}
