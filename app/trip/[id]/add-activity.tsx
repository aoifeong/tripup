import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable } from '@/db/schema';
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

type Category = {
  id: number;
  name: string;
  color: string;
};

export default function AddActivity() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const rows = await db.select().from(categoriesTable);
      setCategories(rows);
      if (rows.length > 0) {
        setSelectedCategory(rows[0].id);
      }
    };

    loadCategories();
  }, []);

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Activity title is required';
    if (!date.trim()) return 'Date is required';
    if (!duration.trim()) return 'Duration is required';
    if (isNaN(Number(duration))) return 'Duration must be a number';
    if (Number(duration) <= 0) return 'Duration must be greater than 0';
    if (!selectedCategory) return 'Please select a category';
    return null;
  };

  const saveActivity = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await db.insert(activitiesTable).values({
        tripId: Number(id),
        title: title.trim(),
        date: date.trim(),
        duration: Number(duration),
        categoryId: selectedCategory!,
      });

      router.back();
    } catch (err) {
      setError('Failed to save activity. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid =
    title.trim().length > 0 &&
    date.trim().length > 0 &&
    duration.trim().length > 0 &&
    !isNaN(Number(duration)) &&
    Number(duration) > 0 &&
    selectedCategory !== null;

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
          Add Activity
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          Create a new activity for your trip
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
          placeholder="e.g., Museum visit, Hiking"
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
          accessibilityHint="Enter the name of the activity"
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
          accessibilityHint="Enter date in YYYY-MM-DD format"
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
          placeholder="e.g., 2.5"
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
          accessibilityHint="Enter duration in hours"
        />
      </View>

      {/* Category Selection */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.md,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Category
        </Text>

        {categories.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              No categories available
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: spacing.xs }}>
              Create a category first in the Categories tab
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  disabled={loading}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${cat.name} category`}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: isSelected ? '#fff' : colors.primary,
                      marginRight: spacing.md,
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#fff',
                          margin: 2,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      color: isSelected ? '#fff' : colors.text,
                      fontWeight: isSelected ? '600' : '500',
                      fontSize: 14,
                      flex: 1,
                    }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Save Button - Main Action */}
      <Pressable
        onPress={saveActivity}
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
        accessibilityLabel="Save activity"
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
            Save Activity
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
