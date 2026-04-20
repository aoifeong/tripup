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

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

export const fetchWeather = async (
  destination: string
): Promise<WeatherData | null> => {
  if (!API_KEY) {
    console.warn('Weather API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        destination
      )}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Location "${destination}" not found`);
      }
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

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

export const getWeatherEmoji = (icon: string): string => {
  const iconMap: Record<string, string> = {
    '01d': '☀️',  // clear sky day
    '01n': '🌙',  // clear sky night
    '02d': '⛅',  // few clouds day
    '02n': '☁️',  // few clouds night
    '03d': '☁️',  // scattered clouds day
    '03n': '☁️',  // scattered clouds night
    '04d': '☁️',  // broken clouds day
    '04n': '☁️',  // broken clouds night
    '09d': '🌧️',  // shower rain day
    '09n': '🌧️',  // shower rain night
    '10d': '🌦️',  // rain day
    '10n': '🌧️',  // rain night
    '11d': '⛈️',  // thunderstorm day
    '11n': '⛈️',  // thunderstorm night
    '13d': '❄️',  // snow day
    '13n': '❄️',  // snow night
    '50d': '🌫️',  // mist day
    '50n': '🌫️',  // mist night
  };

  return iconMap[icon] || '🌤️';
};
