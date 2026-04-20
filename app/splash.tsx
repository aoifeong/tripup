import { getColors, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useContext } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

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
