import { useEffect, useState } from 'react';
import { weatherAPI } from '../utils/api';
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react';

const WeatherMap = () => {
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);

  // Major Pakistani cities with coordinates for positioning
  const cities = [
    { name: 'Islamabad', lat: 33.6844, lon: 73.0479, x: '45%', y: '25%' },
    { name: 'Lahore', lat: 31.5204, lon: 74.3587, x: '50%', y: '35%' },
    { name: 'Karachi', lat: 24.8607, lon: 67.0011, x: '25%', y: '85%' },
    { name: 'Peshawar', lat: 34.0151, lon: 71.5249, x: '35%', y: '20%' },
    { name: 'Quetta', lat: 30.1798, lon: 66.9750, x: '15%', y: '40%' },
    { name: 'Multan', lat: 30.1575, lon: 71.5249, x: '42%', y: '48%' },
    { name: 'Faisalabad', lat: 31.4504, lon: 73.1350, x: '45%', y: '38%' },
    { name: 'Hyderabad', lat: 25.3960, lon: 68.3578, x: '28%', y: '75%' }
  ];

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    const data = {};
    
    // Fetch weather for all cities
    for (const city of cities) {
      try {
        const response = await weatherAPI.getWeather(city.name);
        data[city.name] = response.data.data;
      } catch (error) {
        console.error(`Failed to fetch weather for ${city.name}:`, error);
        // Use mock data if API fails
        data[city.name] = {
          temp: 25 + Math.random() * 15,
          condition: ['Clear', 'Rain', 'Clouds'][Math.floor(Math.random() * 3)],
          humidity: 40 + Math.random() * 40
        };
      }
    }
    
    setWeatherData(data);
    setLoading(false);
  };

  // Determine color based on weather condition and temperature
  const getRegionColor = (cityName) => {
    const weather = weatherData[cityName];
    if (!weather) return 'rgba(100, 200, 100, 0.3)'; // default green
    
    const condition = weather.condition?.toLowerCase() || '';
    const temp = weather.temp || 25;
    
    // Blue for rain
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
      return 'rgba(59, 130, 246, 0.5)'; // blue
    }
    
    // Yellow/Orange for heat (>35°C)
    if (temp > 35) {
      return 'rgba(251, 191, 36, 0.5)'; // yellow
    }
    
    // Orange for very hot (>40°C)
    if (temp > 40) {
      return 'rgba(249, 115, 22, 0.5)'; // orange
    }
    
    // Green for normal
    return 'rgba(34, 197, 94, 0.4)'; // green
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain')) return <CloudRain size={20} className="text-blue-400" />;
    if (conditionLower.includes('cloud')) return <Cloud size={20} className="text-gray-400" />;
    if (conditionLower.includes('clear')) return <Sun size={20} className="text-yellow-400" />;
    return <Wind size={20} className="text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted">Loading weather map...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Pakistan Weather Map</h3>
        <button
          onClick={fetchWeatherData}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Map Legend */}
      <div className="mb-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-400"></div>
          <span className="text-muted">Rain</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-400"></div>
          <span className="text-muted">Heat (&gt;35°C)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-400"></div>
          <span className="text-muted">Normal</span>
        </div>
      </div>

      {/* Pakistan Map Visualization */}
      <div className="relative bg-background rounded-lg p-4 min-h-[500px] border border-border">
        {/* SVG Pakistan Map Outline */}
        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 w-full h-full opacity-20"
          style={{ pointerEvents: 'none' }}
        >
          {/* Simplified Pakistan border */}
          <path
            d="M 80 80 L 200 60 L 280 100 L 320 180 L 300 280 L 280 360 L 200 420 L 120 460 L 80 400 L 60 320 L 70 200 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
        </svg>

        {/* City markers with color-coded regions */}
        {cities.map((city) => {
          const weather = weatherData[city.name];
          if (!weather) return null;

          return (
            <div
              key={city.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: city.x, top: city.y }}
            >
              {/* Color-coded region circle */}
              <div
                className="absolute inset-0 rounded-full blur-3xl -z-10"
                style={{
                  width: '120px',
                  height: '120px',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: getRegionColor(city.name)
                }}
              />

              {/* City marker */}
              <div className="relative bg-surface border-2 border-primary rounded-lg p-3 shadow-lg hover:scale-110 transition-transform cursor-pointer group">
                <div className="flex items-center gap-2 mb-1">
                  {getWeatherIcon(weather.condition)}
                  <span className="font-semibold text-sm whitespace-nowrap">{city.name}</span>
                </div>
                <div className="text-xs text-muted">
                  <div className="font-bold text-primary">{Math.round(weather.temp)}°C</div>
                  <div>{weather.condition}</div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-background border border-border rounded-lg p-3 shadow-xl whitespace-nowrap">
                    <div className="text-sm font-bold mb-1">{city.name}</div>
                    <div className="text-xs text-muted space-y-1">
                      <div>🌡️ Temp: {Math.round(weather.temp)}°C</div>
                      <div>☁️ Condition: {weather.condition}</div>
                      <div>💧 Humidity: {Math.round(weather.humidity)}%</div>
                      {weather.windSpeed && (
                        <div>💨 Wind: {Math.round(weather.windSpeed)} km/h</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weather Summary Table */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {cities.map((city) => {
          const weather = weatherData[city.name];
          if (!weather) return null;

          return (
            <div
              key={city.name}
              className="bg-background rounded-lg p-3 border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                {getWeatherIcon(weather.condition)}
                <span className="font-semibold text-sm">{city.name}</span>
              </div>
              <div className="text-xs text-muted space-y-1">
                <div className="flex justify-between">
                  <span>Temp:</span>
                  <span className="font-bold text-primary">{Math.round(weather.temp)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span>{Math.round(weather.humidity)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherMap;
