import { getColors, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useContext } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

// custom splash screen shown while the db loads + seed runs on first launch
// the real native splash is also hidden from _layout.tsx via SplashScreen.hideAsync()
export default function SplashScreen() {
  const themeContext = useContext(ThemeContext);
  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

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


      {/* tagline */}
      <Text
        style={{
          fontSize: 14,
          color: colors.muted,
          marginBottom: 40,
          textAlign: 'center',
          fontWeight: '500',
        }}
      >
        Plan. Organise. Discover.
      </Text>

      {/* spinner while things load */}
      <ActivityIndicator size="large" color={colors.primary} />

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
