import { AuthContext, User } from '@/app/_layout';
import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!auth) return null;

  const { setCurrentUser } = auth;

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }

      if (!email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Check if email exists
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.trim()));

      if (existing.length > 0) {
        setError('An account with this email already exists');
        setLoading(false);
        return;
      }

      // Create user
      await db.insert(usersTable).values({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      const createdUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.trim()));

      if (createdUsers.length > 0) {
        setCurrentUser(createdUsers[0] as User);
        setError('');
        router.replace('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

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
      <View style={{ marginBottom: spacing.xl, marginTop: spacing.lg }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Create Account
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.muted,
          }}
        >
          Sign up to get started with your trips
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
          accessibilityLiveRegion="assertive"
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

      {/* Name Input */}
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
          Full Name
        </Text>
        <TextInput
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
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
          accessibilityLabel="Full name"
          accessibilityHint="Enter your full name"
        />
      </View>

      {/* Email Input */}
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
          Email
        </Text>
        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
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
          accessibilityLabel="Email address"
          accessibilityHint="Enter your email address"
        />
      </View>

      {/* Password Input */}
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
          Password
        </Text>
        <TextInput
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.muted}
          secureTextEntry
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
          accessibilityLabel="Password"
          accessibilityHint="Enter a password with at least 6 characters"
        />
        {password.length > 0 && password.length < 6 && (
          <Text
            style={{
              fontSize: 12,
              color: '#ea580c',
              marginTop: spacing.xs,
            }}
          >
            Password must be at least 6 characters
          </Text>
        )}
      </View>

      {/* Confirm Password Input */}
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
          Confirm Password
        </Text>
        <TextInput
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor={colors.muted}
          secureTextEntry
          editable={!loading}
          style={{
            borderWidth: 1,
            borderColor:
              confirmPassword && password !== confirmPassword
                ? '#fca5a5'
                : colors.border,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.card,
            color: colors.text,
            fontSize: 15,
          }}
          accessibilityLabel="Confirm password"
          accessibilityHint="Re-enter your password to confirm"
        />
        {confirmPassword && password !== confirmPassword && (
          <Text
            style={{
              fontSize: 12,
              color: '#dc2626',
              marginTop: spacing.xs,
            }}
          >
            Passwords do not match
          </Text>
        )}
      </View>

      {/* Register Button - Main Action */}
      <Pressable
        onPress={handleRegister}
        disabled={!isFormValid || loading}
        style={({ pressed }) => ({
          backgroundColor: isFormValid && !loading ? colors.primary : colors.border,
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          marginBottom: spacing.lg,
          opacity: pressed && isFormValid && !loading ? 0.9 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Create account"
        accessibilityHint="Register with your information"
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
            Create Account
          </Text>
        )}
      </Pressable>

      {/* Divider */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 0.5,
            backgroundColor: colors.border,
          }}
        />
        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            marginHorizontal: spacing.md,
          }}
        >
          Already have an account?
        </Text>
        <View
          style={{
            flex: 1,
            height: 0.5,
            backgroundColor: colors.border,
          }}
        />
      </View>

      {/* Login Link - Secondary Action */}
      <Pressable
        onPress={() => router.push('/login')}
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
        accessibilityLabel="Sign in"
        accessibilityHint="Go to login screen to sign in with existing account"
      >
        <Text
          style={{
            color: colors.primary,
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          Sign In
        </Text>
      </Pressable>

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}
