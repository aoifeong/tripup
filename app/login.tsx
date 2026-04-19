import { AuthContext, User } from '@/app/_layout';
import { colors, radius, spacing } from '@/constants/theme';
import { db } from '@/db/client';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!auth) return null;

  const { setCurrentUser } = auth;

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      if (!password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.trim()));

      if (users.length === 0) {
        setError('No account found with that email');
        setLoading(false);
        return;
      }

      const user = users[0];

      if (user.password !== password) {
        setError('Email or password is incorrect');
        setLoading(false);
        return;
      }

      setCurrentUser(user as User);
      setError('');
      router.replace('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isFormValid = email.trim().length > 0 && password.length > 0;

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
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
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
            }}
          >
            Sign in to your account to continue
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
              borderColor: error ? '#fca5a5' : colors.border,
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
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={colors.muted}
            secureTextEntry
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: error ? '#fca5a5' : colors.border,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              color: colors.text,
              fontSize: 15,
            }}
            accessibilityLabel="Password"
            accessibilityHint="Enter your password"
          />
        </View>

        {/* Login Button - Main Action */}
        <Pressable
          onPress={handleLogin}
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
          accessibilityLabel="Login"
          accessibilityHint="Sign in with your email and password"
          accessible={true}
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
              Sign In
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
            New here?
          </Text>
          <View
            style={{
              flex: 1,
              height: 0.5,
              backgroundColor: colors.border,
            }}
          />
        </View>

        {/* Register Link - Secondary Action */}
        <Pressable
          onPress={() => router.push('/register')}
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
          accessibilityLabel="Create account"
          accessibilityHint="Go to registration screen to create a new account"
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
      </View>
    </ScrollView>
  );
}
