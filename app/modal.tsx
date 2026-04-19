import { colors, radius, spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.card,
          padding: spacing.lg,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.md,
            textAlign: 'center',
          }}
        >
          Modal Title
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
            marginBottom: spacing.lg,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          This is a generic modal template. Current modals are implemented via
          Stack.Screen presentation prop.
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            opacity: pressed ? 0.9 : 1,
            width: '100%',
          })}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            Dismiss
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
