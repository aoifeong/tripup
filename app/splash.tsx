import { colors, spacing } from '@/constants/theme';
import { ActivityIndicator, Image, Text, View } from 'react-native';

/**
 * Splash Screen
 * 
 * Shown while the app initializes and loads data.
 * Displays the TripUp logo and branding.
 */
export default function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
      }}
    >
      {/* Logo */}
      <View style={{ marginBottom: 30 }}>
        <Image
          source={require('@/assets/images/tripuplogo.png')}
          style={{
            width: 100,
            height: 100,
            resizeMode: 'contain',
          }}
        />
      </View>

      {/* App Name */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
          letterSpacing: 1,
        }}
      >
        TripUp
      </Text>

      {/* Tagline */}
      <Text
        style={{
          fontSize: 14,
          color: colors.muted,
          marginBottom: 40,
          textAlign: 'center',
          fontWeight: '500',
        }}
      >
        Plan. Organize. Explore.
      </Text>

      {/* Loading Indicator */}
      <ActivityIndicator size="large" color={colors.primary} />

      {/* Loading Text */}
      <Text
        style={{
          fontSize: 12,
          color: colors.muted,
          marginTop: 20,
          letterSpacing: 0.5,
        }}
      >
        Initializing...
      </Text>
    </View>
  );
}
