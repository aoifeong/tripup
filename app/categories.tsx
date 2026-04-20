import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Stack } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type Category = {
  id: number;
  name: string;
  color: string;
};

const COLOR_PALETTE = [
  'red', 'orange', 'amber', 'lime', 'green',
  'teal', 'blue', 'indigo', 'purple', 'pink'
];

export default function CategoriesScreen() {
  const themeContext = useContext(ThemeContext);
  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');

  const loadCategories = async () => {
    const rows = await db.select().from(categoriesTable);
    setCategories(rows);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return;

    await db.insert(categoriesTable).values({
      name: name.trim(),
      color: selectedColor,
    });

    setName('');
    setSelectedColor('blue');
    loadCategories();
  };

  const deleteCategory = async (id: number) => {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    loadCategories();
  };

  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      red: '#ef4444',
      orange: '#f97316',
      amber: '#eab308',
      lime: '#84cc16',
      green: '#22c55e',
      teal: '#14b8a6',
      blue: '#3b82f6',
      indigo: '#6366f1',
      purple: '#a855f7',
      pink: '#ec4899',
    };
    return colorMap[colorName] || '#3b82f6';
  };

  return (
    <>
    <Stack.Screen options={{ title: 'Categories' }} />
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
      style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
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
              marginBottom: 4,
            }}
          >
            Categories
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.muted,
            }}
          >
            Organize your activities
          </Text>
        </View>

        {/* Create Category Form */}
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            backgroundColor: colors.card,
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing.md,
            }}
          >
            Create New Category
          </Text>

          {/* Name Input */}
          <TextInput
            placeholder="Category name"
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
            accessibilityLabel="Category name input"
          />

          {/* Color Picker */}
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.muted,
              marginBottom: spacing.sm,
              textTransform: 'uppercase',
            }}
          >
            Select Color
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: spacing.md,
            }}
          >
            {COLOR_PALETTE.map((colorName) => (
              <Pressable
                key={colorName}
                onPress={() => setSelectedColor(colorName)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  backgroundColor: getColorHex(colorName),
                  borderWidth: selectedColor === colorName ? 2 : 0,
                  borderColor: colors.text,
                }}
                accessibilityRole="button"
                accessibilityLabel={colorName}
                accessibilityState={{ selected: selectedColor === colorName }}
              />
            ))}
          </View>

          {/* Add Button */}
          <Pressable
            onPress={addCategory}
            disabled={!name.trim()}
            style={({ pressed }) => ({
              backgroundColor: name.trim() ? colors.primary : colors.border,
              paddingVertical: 10,
              borderRadius: radius.md,
              alignItems: 'center',
              opacity: pressed && name.trim() ? 0.9 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Add category"
          >
            <Text
              style={{
                color: name.trim() ? '#fff' : colors.muted,
                fontWeight: '600',
                fontSize: 13,
              }}
            >
              Add Category
            </Text>
          </Pressable>
        </View>

        {/* Categories List */}
        {categories.length > 0 && (
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.muted,
                marginBottom: spacing.md,
                textTransform: 'uppercase',
              }}
            >
              Your Categories ({categories.length})
            </Text>

            {categories.map((category) => (
              <View
                key={category.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  backgroundColor: colors.card,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    backgroundColor: getColorHex(category.color),
                    marginRight: spacing.md,
                  }}
                  accessible={false}
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    {category.name}
                  </Text>
                </View>

                <Pressable
                  onPress={() => deleteCategory(category.id)}
                  style={({ pressed }) => ({
                    padding: spacing.sm,
                    opacity: pressed ? 0.7 : 1,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${category.name}`}
                >
                  <Text
                    style={{
                      color: '#dc2626',
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {categories.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: '600',
                marginBottom: spacing.sm,
              }}
            >
              No categories yet
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              Create your first category to organize activities
            </Text>
          </View>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  </>);
}

