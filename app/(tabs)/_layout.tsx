import { getColors, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Stack, Tabs } from 'expo-router';
import { useContext } from 'react';
import { Image, Text, View } from 'react-native';

// tab layout for the main logged-in area. two tabs: trips and profile
export default function TabLayout() {
  const themeContext = useContext(ThemeContext);
  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  return (
    <>
      {}
      <Stack.Screen options={{ headerShown: false }} />

      <Tabs
        screenOptions={{
          // shared header + tab bar styling pulled from the theme
          headerStyle: {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: colors.text,
          },
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: -8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        {/* trips tab home screen with logo + tagline in header */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trips',
            headerTitle: () => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <Image
                  source={require('@/assets/images/tripuplogo.png')}
                  style={{
                    width: 32,
                    height: 32,
                    resizeMode: 'contain',
                  }}
                />
                <View>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: colors.text,
                    }}
                  >
                    TripUp
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      marginTop: 2,
                      fontWeight: '500',
                    }}
                  >
                    Plan & Organize
                  </Text>
                </View>
              </View>
            ),
            tabBarLabel: 'Trips',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20 }}>✈️</Text>
            ),
          }}
        />

        {/* profile tab; account info, settings, streak, export, logout */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerTitle: () => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>👤</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: colors.text,
                    }}
                  >
                    Profile
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      marginTop: 2,
                      fontWeight: '500',
                    }}
                  >
                    Account & Settings
                  </Text>
                </View>
              </View>
            ),
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20 }}>👤</Text>
            ),
          }}
        />
      </Tabs>
    </>
  );
}