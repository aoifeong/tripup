import { AuthContext } from '@/app/_layout';
import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, tripsTable, usersTable } from '@/db/schema';
import { exportUserActivitiesToCSV } from '@/utils/csvExport';
import { eq, inArray } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

// profile screen; streak card, account info, dark mode toggle, csv export, logout, delete account
export default function ProfileScreen() {
  const auth = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState({ current: 0, longest: 0, totalDays: 0 });

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);
  const currentUser = auth?.currentUser ?? null;

  // reload streak every time the screen comes into focus
  // useFocusEffect instead of useEffect because adding an activity on another screen
  // should update the streak when coming back to this tab
  useFocusEffect(
  useCallback(() => {
    if (currentUser) {
      loadStreak();
    }
  }, [currentUser])
);

  // calculates current streak, longest streak, and total unique days with activity
  const loadStreak = async () => {
    try {
      if (!currentUser) return;

      // grab all trips the user has
      const userTrips = await db
        .select()
        .from(tripsTable)
        .where(eq(tripsTable.userId, currentUser.id));

      if (userTrips.length === 0) {
        setStreak({ current: 0, longest: 0, totalDays: 0 });
        return;
      }

      // then all activities across those trips
      const tripIds = userTrips.map((t) => t.id);
      const allActivities = await db
        .select()
        .from(activitiesTable)
        .where(inArray(activitiesTable.tripId, tripIds));

      // dedupe dates; multiple activities on the same day = one active day for streak purposes
      const uniqueDates = new Set(allActivities.map((a) => a.date));
      const sortedDates = Array.from(uniqueDates).sort();

      if (sortedDates.length === 0) {
        setStreak({ current: 0, longest: 0, totalDays: 0 });
        return;
      }

      // longest streak: walk through every pair of consecutive dates
      // if theyre one day apart, extend the running count. otherwise reset
      let longest = 1;
      let running = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round(
          (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          running++;
          longest = Math.max(longest, running);
        } else {
          running = 1;
        }
      }

      // current streak: only counts if the most recent activity was today or yesterday
      // otherwise the streak is considered broken
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const latestDate = new Date(sortedDates[sortedDates.length - 1]);
      latestDate.setHours(0, 0, 0, 0);

      const daysSinceLatest = Math.round(
        (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let current = 0;
      if (daysSinceLatest <= 1) {
        // streak islive; count backwards from the latest date through consecutive days
        current = 1;
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const prev = new Date(sortedDates[i]);
          const next = new Date(sortedDates[i + 1]);
          const diff = Math.round(
            (next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff === 1) {
            current++;
          } else {
            break;
          }
        }
      }

      setStreak({
        current,
        longest,
        totalDays: uniqueDates.size,
      });
    } catch (err) {
      console.error('Failed to load streak:', err);
    }
  };

  if (!auth || !themeContext) return null;

  const { setCurrentUser } = auth;
  const { isDarkMode, toggleTheme } = themeContext;

  // if not logged in, show sign in/register options instead of profile
  if (!currentUser) {
    return (
      <ScrollView
        style={{ backgroundColor: colors.background }}
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

  // builds a csv of all activities and opens the native share sheet
  const handleExport = async () => {
  try {
    setLoading(true);
    const shared = await exportUserActivitiesToCSV(currentUser.id);
    if (!shared) {
      Alert.alert('No Activities', 'You have no activities to export yet.');
    }
  } catch (err) {
    console.error('Export failed:', err);
    Alert.alert('Export Failed', 'Could not export activities. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // clears current user and sends them back to login
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
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

  // removes the user from the db entirely. confirmation dialog first because this is permanent
  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
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
      style={{ backgroundColor: colors.background }}
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

      {/* streak card; shows current streak with flame emoji + longest + total active days */}
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
            marginBottom: spacing.md,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Activity Streak
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 40, marginRight: spacing.md }}>
            {streak.current > 0 ? '🔥' : '💤'}
          </Text>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>
              {streak.current}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>
              {streak.current === 1 ? 'day current streak' : 'days current streak'}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 0.5,
            backgroundColor: colors.border,
            marginVertical: spacing.sm,
          }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase' }}>
              Longest Streak
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase' }}>
              Total Active Days
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              {streak.totalDays}
            </Text>
          </View>
        </View>

        {/* little nudge if the user had a streak but let it break */}
        {streak.current === 0 && streak.totalDays > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              fontStyle: 'italic',
              marginTop: spacing.md,
            }}
          >
            Log an activity today to start a new streak!
          </Text>
        )}
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
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4, textTransform: 'uppercase' }}>
            Name
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {currentUser.name}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4, textTransform: 'uppercase' }}>
            Email
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {currentUser.email}
          </Text>
        </View>
      </View>

      {/* dark mode toggle; the actual theme state lives in ThemeContext */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.lg,
          backgroundColor: colors.card,
          marginBottom: spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.muted,
              marginBottom: spacing.xs,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Appearance
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
            Dark Mode
          </Text>
        </View>

        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={isDarkMode ? '#fff' : colors.card}
          accessible={true}
          accessibilityLabel="Toggle dark mode"
          accessibilityRole="switch"
          accessibilityState={{ checked: isDarkMode }}
        />
      </View>

      {/* Divider */}
      <View style={{ height: 0.5, backgroundColor: colors.border, marginVertical: spacing.lg }} />

{/* csv export button; advanced feature, calls exportUserActivitiesToCSV helper */}
<Pressable
  onPress={handleExport}
  disabled={loading}
  style={({ pressed }) => ({
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    opacity: pressed && !loading ? 0.7 : 1,
  })}
  accessibilityRole="button"
  accessibilityLabel="Export activities to CSV"
  accessibilityHint="Export all your activities as a CSV file"
>
  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>
   Export Activities (CSV)
  </Text>
</Pressable>

      {/* Sign Out Button */}
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
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15, letterSpacing: 0.5 }}>
            Sign Out
          </Text>
        )}
      </Pressable>

      {/* Delete Account Button */}
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
        <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 15 }}>
          Delete Account
        </Text>
      </Pressable>

      <View style={{ marginTop: spacing.lg }}>
        <Text style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic', lineHeight: 18 }}>
          Deleting your account will remove all your data permanently. This action cannot be undone. Soz.
        </Text>
      </View>

      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}