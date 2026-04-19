import { AuthContext } from '@/app/_layout';
import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

export default function ProfileScreen() {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!auth) return null;

  const { currentUser, setCurrentUser } = auth;

  if (!currentUser) {
    return (
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          backgroundColor: colors.background,
          justifyContent: 'center',
        }}
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
            Profile
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Sign in to access your profile
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/login')}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            marginBottom: spacing.sm,
            opacity: pressed ? 0.9 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            Sign In
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/register')}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 12,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Create account"
        >
          <Text
            style={{
              color: colors.primary,
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            Create Account
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: () => {
          setCurrentUser(null);
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            try {
              await db.delete(usersTable).where(eq(usersTable.id, currentUser.id));
              setCurrentUser(null);
              router.replace('/register');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

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
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Profile
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted }}>
          Account settings and preferences
        </Text>
      </View>

      {/* User Info Card */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.lg,
          backgroundColor: colors.card,
          marginBottom: spacing.lg,
        }}
      >
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
          Account Information
        </Text>

        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            Name
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {currentUser.name}
          </Text>
        </View>

        <View>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            Email
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {currentUser.email}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 0.5,
          backgroundColor: colors.border,
          marginVertical: spacing.lg,
        }}
      />

      {/* Sign Out Button - Primary Action */}
      <Pressable
        onPress={handleLogout}
        disabled={loading}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          marginBottom: spacing.sm,
          opacity: pressed && !loading ? 0.9 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Sign out from account"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            Sign Out
          </Text>
        )}
      </Pressable>

      {/* Delete Account Button - Destructive Action */}
      <Pressable
        onPress={handleDeleteProfile}
        disabled={loading}
        style={({ pressed }) => ({
          backgroundColor: '#fee2e2',
          borderWidth: 1,
          borderColor: '#fca5a5',
          paddingVertical: 12,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          opacity: pressed && !loading ? 0.8 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Delete account permanently"
      >
        <Text
          style={{
            color: '#dc2626',
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          Delete Account
        </Text>
      </Pressable>

      {/* Info Text */}
      <View style={{ marginTop: spacing.lg }}>
        <Text
          style={{
            fontSize: 12,
            color: colors.muted,
            fontStyle: 'italic',
            lineHeight: 18,
          }}
        >
          Deleting your account will remove all your data permanently. This action cannot be undone.
        </Text>
      </View>

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}
