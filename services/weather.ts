// weather service- wraps the openweathermap api
// api key comes from .env.local (EXPO_PUBLIC_WEATHER_API_KEY) so its not committed to git

export type WeatherData = {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  windSpeed: number;
};

export type WeatherError = {
  message: string;
  code?: string;
};

// EXPO_PUBLIC_ prefix means this gets bundled into the app at build time
// the actual value is in .env.local which is gitignored
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

// fetches current weather for a destination name. returns null if no api key is set,
// throws a friendly error if the location isnt found
export const fetchWeather = async (
  destination: string
): Promise<WeatherData | null> => {
  if (!API_KEY) {
    console.warn('Weather API key not configured');
    return null;
  }

  try {
    // encodeURIComponent handles spaces/special chars in destination names 
    // units=metric gives me celsius + m/s instead of fahrenheit + mph
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        destination
      )}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      // 404 means the location name wasnt recognised
      if (response.status === 404) {
        throw new Error(`Location "${destination}" not found`);
      }
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    // rounds temps to whole numbers, wind to 1 decimal place
    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].main,
      icon: data.weather[0].icon,
      city: data.name,
      country: data.sys.country,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch weather';
    console.error('Weather API error:', message);
    throw new Error(message);
  }
};

// maps openweather's icon codes to emojis
// falls back to a generic emoji if the icon code isnt recognised
export const getWeatherEmoji = (icon: string): string => {
  const iconMap: Record<string, string> = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };

  return iconMap[icon] || '🌤️';
};
