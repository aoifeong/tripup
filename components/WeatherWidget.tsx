import { getColors, radius, spacing } from '@/constants/theme';
import { ThemeContext } from '@/contexts/ThemeContext';
import { fetchWeather, getWeatherEmoji, WeatherData } from '@/services/weather';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

type WeatherWidgetProps = {
  destination: string;
};

// weather widget- calls the openweathermap api and shows current conditions for the trip destination
// handles all three states: loading, error, success
export default function WeatherWidget({ destination }: WeatherWidgetProps) {
  const themeContext = useContext(ThemeContext);
  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // refetch whenever the destination prop changes
  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(destination);
        setWeather(data);
      } catch (err) {
        // pull the error message out safely whether it's an Error or something else
        const message = err instanceof Error ? err.message : 'Failed to load weather';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [destination]);

  // loading state- spinner while fetching
  if (loading) {
    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
        }}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            marginTop: spacing.sm,
          }}
        >
          Fetching weather...
        </Text>
      </View>
    );
  }

  // error state- typically if the destination isnt recognised by the api
  if (error) {
    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.lg,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 18,
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  // if somehow no weather and no error, render nothing
  if (!weather) {
    return null;
  }

  // map the api's icon code to a matching emoji
  const emoji = getWeatherEmoji(weather.icon);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.lg,
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
         Weather
      </Text>

      {/* big temperature on the left, weather emoji on the right */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: colors.text,
            }}
          >
            {weather.temp}°C
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.muted,
              marginTop: 4,
            }}
          >
            {weather.description}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 4,
            }}
          >
            Feels like {weather.feelsLike}°C
          </Text>
        </View>

        <Text
          style={{
            fontSize: 64,
            marginRight: spacing.md,
          }}
        >
          {emoji}
        </Text>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 0.5,
          backgroundColor: colors.border,
          marginVertical: spacing.md,
        }}
      />

      {/* three-column row of extra stats- humidity, wind, city name */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            Humidity
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {weather.humidity}%
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            Wind
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {weather.windSpeed} m/s
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 4,
              textTransform: 'uppercase',
            }}
          >
            Location
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            {weather.city}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 10,
          color: colors.muted,
          marginTop: spacing.md,
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        Current weather • Updated in real-time
      </Text>
    </View>
  );
}
