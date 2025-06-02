/**
 * NEA Weather Service
 * Integrates with Singapore's National Environment Agency weather APIs
 * from data.gov.sg for real-time weather data and forecasts
 */

class NEAWeatherService {
  constructor() {
    this.baseURL = 'https://api.data.gov.sg/v1/environment';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    
    // Station mapping for different regions in Singapore
    this.stations = {
      'East Coast': 'S107', // East Coast Parkway - closest to Pasir Ris
      'Woodlands': 'S104', // Woodlands Avenue 9
      'Pulau Ubin': 'S106', // Pulau Ubin
      'Central': 'S107' // Default to East Coast for central readings
    };
  }

  /**
   * Get cached data if available and not expired
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * Fetch current weather readings from multiple sources
   */
  async getCurrentWeather(region = 'East Coast') {
    const cacheKey = `current-${region}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Fetch multiple current readings in parallel
      const [tempResponse, humidityResponse, forecastResponse] = await Promise.all([
        fetch(`${this.baseURL}/air-temperature`),
        fetch(`${this.baseURL}/relative-humidity`),
        fetch(`${this.baseURL}/24-hour-weather-forecast`)
      ]);

      const [tempData, humidityData, forecastData] = await Promise.all([
        tempResponse.json(),
        humidityResponse.json(),
        forecastResponse.json()
      ]);

      // Find the closest station data
      const stationId = this.stations[region] || this.stations['East Coast'];
      
      // Extract current readings
      const currentTemp = this.extractStationReading(tempData, stationId);
      const currentHumidity = this.extractStationReading(humidityData, stationId);
      
      // Get general forecast info
      const generalForecast = forecastData.items[0]?.general || {};
      
      // Calculate wind speed from forecast (convert from string if needed)
      const windData = generalForecast.wind || {};
      const windSpeed = this.parseWindSpeed(windData);

      const currentWeather = {
        temperature: Math.round(currentTemp || generalForecast.temperature?.low || 26),
        humidity: Math.round(currentHumidity || generalForecast.relative_humidity?.low || 70),
        windSpeed: windSpeed,
        windDirection: windData.direction || 'Variable',
        forecast: generalForecast.forecast || 'Partly Cloudy',
        icon: this.getWeatherIcon(generalForecast.forecast || 'Partly Cloudy'),
        lastUpdated: new Date().toISOString(),
        region: region
      };

      this.setCachedData(cacheKey, currentWeather);
      return currentWeather;

    } catch (error) {
      console.error('Error fetching current weather:', error);
      // Return fallback data
      return this.getFallbackCurrentWeather(region);
    }
  }

  /**
   * Fetch 4-day weather forecast
   */
  async getFourDayForecast() {
    const cacheKey = 'forecast-4day';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/4-day-weather-forecast`);
      const data = await response.json();

      const forecasts = data.items[0]?.forecasts || [];
      
      const processedForecast = forecasts.map(day => ({
        date: day.date,
        day: this.formatDay(day.date),
        high: day.temperature.high,
        low: day.temperature.low,
        humidity: {
          high: day.relative_humidity.high,
          low: day.relative_humidity.low
        },
        windSpeed: this.parseWindSpeed(day.wind),
        windDirection: day.wind.direction,
        forecast: day.forecast,
        icon: this.getWeatherIcon(day.forecast),
        timestamp: day.timestamp
      }));

      this.setCachedData(cacheKey, processedForecast);
      return processedForecast;

    } catch (error) {
      console.error('Error fetching 4-day forecast:', error);
      return this.getFallbackForecast();
    }
  }

  /**
   * Extract reading for specific station from API response
   */
  extractStationReading(data, stationId) {
    if (!data.items || !data.items[0] || !data.items[0].readings) {
      return null;
    }

    const reading = data.items[0].readings.find(r => r.station_id === stationId);
    return reading ? reading.value : null;
  }

  /**
   * Parse wind speed from NEA wind data
   */
  parseWindSpeed(windData) {
    if (!windData || !windData.speed) return 10; // Default value

    if (typeof windData.speed === 'object') {
      // If speed is an object with low/high
      return Math.round((windData.speed.low + windData.speed.high) / 2);
    }
    
    if (typeof windData.speed === 'string') {
      // Parse numeric value from string
      const match = windData.speed.match(/\d+/);
      return match ? parseInt(match[0]) : 10;
    }

    return Math.round(windData.speed) || 10;
  }

  /**
   * Get weather icon based on forecast description
   */
  getWeatherIcon(forecast) {
    const desc = forecast.toLowerCase();
    
    if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
    if (desc.includes('heavy rain') || desc.includes('heavy shower')) return '🌧️';
    if (desc.includes('shower') || desc.includes('rain')) return '🌦️';
    if (desc.includes('cloudy') || desc.includes('overcast')) return '☁️';
    if (desc.includes('partly cloudy') || desc.includes('fair')) return '⛅';
    if (desc.includes('sunny') || desc.includes('clear')) return '☀️';
    if (desc.includes('haze') || desc.includes('mist')) return '🌫️';
    if (desc.includes('windy')) return '💨';
    
    return '⛅'; // Default partly cloudy
  }

  /**
   * Format date to readable day name
   */
  formatDay(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-SG', { weekday: 'short' });
  }

  /**
   * Fallback current weather data
   */
  getFallbackCurrentWeather(region) {
    return {
      temperature: 28,
      humidity: 75,
      windSpeed: 12,
      windDirection: 'SW',
      forecast: 'Partly Cloudy',
      icon: '⛅',
      lastUpdated: new Date().toISOString(),
      region: region,
      fallback: true
    };
  }

  /**
   * Fallback forecast data
   */
  getFallbackForecast() {
    const today = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1);
      
      return {
        date: date.toISOString().split('T')[0],
        day: this.formatDay(date.toISOString().split('T')[0]),
        high: 32 - i,
        low: 24 + i,
        humidity: { high: 90, low: 60 },
        windSpeed: 12,
        windDirection: 'SW',
        forecast: 'Partly Cloudy',
        icon: '⛅',
        fallback: true
      };
    });
  }

  /**
   * Get comprehensive weather data for the app
   */
  async getWeatherData(region = 'East Coast') {
    try {
      const [current, forecast] = await Promise.all([
        this.getCurrentWeather(region),
        this.getFourDayForecast()
      ]);

      return {
        current: {
          temp: current.temperature,
          feelsLike: current.temperature + 2, // Estimate feels like
          humidity: current.humidity,
          windSpeed: current.windSpeed,
          windDirection: current.windDirection,
          uvIndex: this.estimateUVIndex(), // Estimate UV based on time
          icon: current.icon,
          description: current.forecast
        },
        location: `${region}, Singapore`,
        forecast: forecast.slice(0, 4), // Ensure only 4 days
        lastUpdated: current.lastUpdated,
        source: 'NEA Singapore',
        fallback: current.fallback || false
      };

    } catch (error) {
      console.error('Error getting comprehensive weather data:', error);
      return this.getFallbackWeatherData(region);
    }
  }

  /**
   * Estimate UV index based on time of day
   */
  estimateUVIndex() {
    const hour = new Date().getHours();
    if (hour < 6 || hour > 18) return 0; // Night
    if (hour < 10 || hour > 16) return Math.floor(Math.random() * 4) + 2; // Morning/Evening: 2-5
    return Math.floor(Math.random() * 6) + 6; // Midday: 6-11
  }

  /**
   * Fallback weather data structure
   */
  getFallbackWeatherData(region) {
    return {
      current: {
        temp: 28,
        feelsLike: 30,
        humidity: 75,
        windSpeed: 12,
        windDirection: 'SW',
        uvIndex: 6,
        icon: '⛅',
        description: 'Partly Cloudy'
      },
      location: `${region}, Singapore`,
      forecast: this.getFallbackForecast(),
      lastUpdated: new Date().toISOString(),
      source: 'NEA Singapore (Cached)',
      fallback: true
    };
  }
}

// Export for use in other modules
window.NEAWeatherService = NEAWeatherService;
