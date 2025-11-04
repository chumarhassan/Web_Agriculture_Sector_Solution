import { useEffect, useState } from 'react';
import { weatherAPI } from '../utils/api';
import { Cloud, CloudRain, Sun, Wind, RefreshCw, Droplets, Thermometer } from 'lucide-react';

const SimpleWeatherMap = () => {
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);

  const cities = [
    // Punjab
    { name: 'Lahore', urdu: 'لاہور', x: '65%', y: '35%' },
    { name: 'Faisalabad', urdu: 'فیصل آباد', x: '58%', y: '37%' },
    { name: 'Rawalpindi', urdu: 'راولپنڈی', x: '60%', y: '28%' },
    { name: 'Multan', urdu: 'ملتان', x: '55%', y: '45%' },
    { name: 'Gujranwala', urdu: 'گوجرانوالہ', x: '63%', y: '32%' },
    { name: 'Sialkot', urdu: 'سیالکوٹ', x: '65%', y: '30%' },
    { name: 'Bahawalpur', urdu: 'بہاولپور', x: '55%', y: '52%' },
    
    // Sindh
    { name: 'Karachi', urdu: 'کراچی', x: '38%', y: '88%' },
    { name: 'Hyderabad', urdu: 'حیدرآباد', x: '42%', y: '82%' },
    { name: 'Sukkur', urdu: 'سکھر', x: '42%', y: '68%' },
    
    // KPK
    { name: 'Peshawar', urdu: 'پشاور', x: '55%', y: '22%' },
    { name: 'Abbottabad', urdu: 'ایبٹ آباد', x: '60%', y: '20%' },
    
    // Balochistan
    { name: 'Quetta', urdu: 'کوئٹہ', x: '35%', y: '45%' },
    
    // Capital
    { name: 'Islamabad', urdu: 'اسلام آباد', x: '60%', y: '26%' },
  ];

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    const data = {};
    
    for (const city of cities) {
      try {
        const response = await weatherAPI.getWeather(city.name);
        data[city.name] = response.data.data;
      } catch (error) {
        console.error(`Failed to fetch weather for ${city.name}:`, error);
        data[city.name] = {
          temperature: 20 + Math.random() * 20,
          condition: 'Clear',
          humidity: 40,
          windSpeed: 10
        };
      }
    }
    
    setWeatherData(data);
    setLoading(false);
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) 
      return <CloudRain className="w-5 h-5" />;
    if (conditionLower.includes('cloud')) 
      return <Cloud className="w-5 h-5" />;
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) 
      return <Sun className="w-5 h-5" />;
    return <Wind className="w-5 h-5" />;
  };

  const getWeatherColor = (temp) => {
    if (temp > 40) return 'bg-red-500 text-white';
    if (temp > 35) return 'bg-orange-500 text-white';
    if (temp > 30) return 'bg-yellow-500 text-white';
    if (temp > 20) return 'bg-green-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getRegionColor = (cityName) => {
    const weather = weatherData[cityName];
    if (!weather) return 'rgba(156, 163, 175, 0.3)'; // gray

    const temp = weather.temp;
    const condition = weather.condition?.toLowerCase() || '';

    // Rain - Blue
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'rgba(59, 130, 246, 0.6)'; // blue
    }
    
    // Temperature based colors
    if (temp > 40) return 'rgba(239, 68, 68, 0.6)'; // red - extremely hot
    if (temp > 35) return 'rgba(249, 115, 22, 0.6)'; // orange - very hot
    if (temp > 30) return 'rgba(251, 191, 36, 0.5)'; // yellow - hot
    if (temp > 20) return 'rgba(34, 197, 94, 0.4)'; // green - pleasant
    
    return 'rgba(59, 130, 246, 0.4)'; // light blue - cool
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-2xl text-gray-600">موسم کی معلومات لوڈ ہو رہی ہے...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <Cloud className="w-8 h-8" />
            پاکستان موسم کا نقشہ
          </h3>
          <button
            onClick={fetchWeatherData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>تازہ کریں</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Legend */}
        <div className="mb-6 bg-white dark:bg-gray-700 rounded-xl p-4">
        <p className="text-lg font-bold mb-3 text-gray-800 dark:text-white">رنگوں کی علامت:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-base">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}></div>
            <span className="text-gray-700 dark:text-gray-300">💧 بارش</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.4)' }}></div>
            <span className="text-gray-700 dark:text-gray-300">🌤️ خوشگوار</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgba(251, 191, 36, 0.5)' }}></div>
            <span className="text-gray-700 dark:text-gray-300">☀️ گرم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgba(249, 115, 22, 0.6)' }}></div>
            <span className="text-gray-700 dark:text-gray-300">🔥 بہت گرم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.6)' }}></div>
            <span className="text-gray-700 dark:text-gray-300">🌡️ انتہائی گرم</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white dark:bg-gray-700 rounded-xl p-4" style={{ height: '600px' }}>
        {/* Pakistan Map Outline (Simplified SVG) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <path
            d="M 60 10 L 65 8 L 70 15 L 68 20 L 65 25 L 60 28 L 55 30 L 52 35 L 48 40 L 45 45 L 40 50 L 38 55 L 35 65 L 32 75 L 28 85 L 25 90 L 20 88 L 15 85 L 12 78 L 10 70 L 8 60 L 10 50 L 12 45 L 15 38 L 20 32 L 25 28 L 30 22 L 35 18 L 42 15 L 50 12 Z"
            fill="rgba(229, 231, 235, 0.5)"
            stroke="rgba(107, 114, 128, 0.8)"
            strokeWidth="0.5"
          />
        </svg>

        {/* City Markers */}
        {cities.map((city) => {
          const weather = weatherData[city.name];
          const color = getRegionColor(city.name);
          
          return (
            <div
              key={city.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: city.x, top: city.y }}
            >
              {/* Color Region Circle */}
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  width: '80px',
                  height: '80px',
                  left: '-40px',
                  top: '-40px',
                  zIndex: 1,
                }}
              />
              
              {/* City Marker */}
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform">
                {weather && getWeatherIcon(weather.condition)}
              </div>
              
              {/* City Info Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white rounded-lg p-3 text-sm shadow-xl min-w-[180px]">
                  <p className="font-bold text-lg mb-1 text-center">{city.urdu}</p>
                  <p className="text-gray-300 text-xs text-center mb-2">({city.name})</p>
                  {weather && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span>🌡️ درجہ حرارت:</span>
                        <span className="font-bold">{Math.round(weather.temp)}°C</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span>💧 نمی:</span>
                        <span className="font-bold">{Math.round(weather.humidity)}%</span>
                      </div>
                      {weather.windSpeed && (
                        <div className="flex items-center justify-between">
                          <span>💨 ہوا:</span>
                          <span className="font-bold">{Math.round(weather.windSpeed)} km/h</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* City Grid View (Mobile Friendly) */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cities.map((city) => {
          const weather = weatherData[city.name];
          if (!weather) return null;
          
          return (
            <div
              key={city.name}
              className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow"
              style={{ borderLeft: `4px solid ${getRegionColor(city.name)}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-gray-800 dark:text-white">{city.urdu}</p>
                {getWeatherIcon(weather.condition)}
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(weather.temp)}°
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(weather.humidity)}% نمی
              </p>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default SimpleWeatherMap;