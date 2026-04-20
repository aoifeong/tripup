import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable } from '@/db/schema';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type Category = {
  id: number;
  name: string;
  color: string;
};

// form for creating a new activity inside the current trip
export default function AddActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeContext = useContext(ThemeContext);
  const router = useRouter();

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // load categories once on mount so can show the radio list
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const rows = await db.select().from(categoriesTable);
      setCategories(rows);
      // pre-select the first one so user doesnt have to tap before saving
      if (rows.length > 0) {
        setSelectedCategoryId(rows[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // validate all fields then insert into the db, then pop back to the activities list
  const handleAddActivity = async () => {
    setError('');
    setLoading(true);

    try {
      if (!title.trim()) {
        setError('Activity title is required');
        setLoading(false);
        return;
      }

      if (!date.trim()) {
        setError('Date is required');
        setLoading(false);
        return;
      }

      if (!duration.trim() || isNaN(Number(duration))) {
        setError('Duration must be a valid number');
        setLoading(false);
        return;
      }

      if (!selectedCategoryId) {
        setError('Please select a category');
        setLoading(false);
        return;
      }

      if (!id) {
        setError('Trip not found');
        setLoading(false);
        return;
      }

      await db.insert(activitiesTable).values({
        tripId: Number(id),
        title: title.trim(),
        date: date.trim(),
        duration: Number(duration),
        categoryId: selectedCategoryId,
      });

      router.back();
    } catch (err) {
      console.error('Error adding activity:', err);
      setError('Failed to add activity. Please try again.');
      setLoading(false);
    }
  };

  if (!id) return null;

  // only enable the save button when everything's filled in + valid
  const isFormValid =
    title.trim().length > 0 &&
    date.trim().length > 0 &&
    duration.trim().length > 0 &&
    !isNaN(Number(duration)) &&
    selectedCategoryId !== null;

  return (
    <>
    <Stack.Screen options={{ title: 'Add Activity' }} />
    <ScrollView
    style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Add Activity
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted }}>
          Log a new activity for this trip
        </Text>
      </View>

      {/* error banner with accessibility live region so screen readers announce it */}
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
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
        >
          <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '500' }}>
            {error}
          </Text>
        </View>
      ) : null}

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
          placeholder="e.g., Museum Visit"
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
          Duration (hours)
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
        />
      </View>

      {/* category picker; built as radio buttons so only one can be selected */}
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
              const isSelected = selectedCategoryId === cat.id;

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
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
                  {/* little radio circle; filled dot when selected */}
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

      <Pressable
        onPress={handleAddActivity}
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
  </>);
}