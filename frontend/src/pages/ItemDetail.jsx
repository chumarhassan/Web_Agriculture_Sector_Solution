import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, weatherAPI, adviceAPI } from '../utils/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Cloud, TrendingUp, Lightbulb, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [prices, setPrices] = useState([]);
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(user?.region || 'Lahore');
  const [city, setCity] = useState('Lahore');
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, region, days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch item and prices
      const [itemRes, pricesRes] = await Promise.all([
        itemsAPI.getById(id),
        itemsAPI.getPrices(id, { region, days })
      ]);
      
      setItem(itemRes.data.data.item);
      setPrices(pricesRes.data.data.prices);

      // Fetch weather
      try {
        const weatherRes = await weatherAPI.getWeather(city);
        setWeather(weatherRes.data.data);
      } catch (error) {
        console.error('Weather fetch failed:', error);
      }

      // Fetch advice
      try {
        const adviceRes = await adviceAPI.getAdvice({ itemId: id, city, region });
        setAdvice(adviceRes.data.data);
      } catch (error) {
        console.error('Advice fetch failed:', error);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: prices.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: `Price (PKR per ${item?.unit})`,
        data: prices.map(p => p.price),
        borderColor: '#60A5FA',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#60A5FA',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#E6EEF8'
        }
      },
      tooltip: {
        backgroundColor: '#0B1220',
        titleColor: '#E6EEF8',
        bodyColor: '#E6EEF8',
        borderColor: '#60A5FA',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Price: ${context.parsed.y} PKR`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value) {
            return value + ' PKR';
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading item details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted">Item not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
          <p className="text-muted capitalize">{item.category} • {item.unit}</p>
          {item.description && (
            <p className="text-muted mt-2">{item.description}</p>
          )}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <select
                className="input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City (for weather)</label>
              <input
                type="text"
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <select
                className="input"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Price Chart */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-primary" size={24} />
              <h2 className="text-xl font-semibold">Price History</h2>
            </div>
            
            {prices.length > 0 ? (
              <div style={{ height: '350px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted">
                No price data available for this region
              </div>
            )}

            {/* Price Statistics */}
            {prices.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted mb-1">Latest</div>
                  <div className="text-lg font-semibold text-primary">
                    {prices[prices.length - 1]?.price} PKR
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Average</div>
                  <div className="text-lg font-semibold">
                    {(prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(2)} PKR
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Lowest</div>
                  <div className="text-lg font-semibold text-success">
                    {Math.min(...prices.map(p => p.price))} PKR
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Highest</div>
                  <div className="text-lg font-semibold text-danger">
                    {Math.max(...prices.map(p => p.price))} PKR
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Weather Card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="text-primary" size={24} />
              <h2 className="text-xl font-semibold">Weather</h2>
            </div>

            {weather ? (
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold mb-2">{weather.temperature}°C</div>
                  <div className="text-muted capitalize">{weather.condition}</div>
                  {weather.description && (
                    <div className="text-sm text-muted mt-1 capitalize">{weather.description}</div>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-muted text-sm">Humidity</span>
                    <span className="font-medium">{weather.humidity}%</span>
                  </div>
                  {weather.windSpeed && (
                    <div className="flex justify-between">
                      <span className="text-muted text-sm">Wind Speed</span>
                      <span className="font-medium">{weather.windSpeed} m/s</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted text-sm">Rain</span>
                    <span className={`font-medium ${weather.rain ? 'text-primary' : 'text-muted'}`}>
                      {weather.rain ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {weather.mock && (
                  <p className="text-xs text-muted pt-2 border-t border-gray-700">
                    * Mock data (configure API key for real data)
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted text-sm">Weather data unavailable</p>
            )}
          </Card>
        </div>

        {/* Advice Card */}
        {advice && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="text-warning" size={24} />
              <h2 className="text-xl font-semibold">Farming Advice</h2>
            </div>

            <div className="space-y-3">
              {advice.advice.map((tip, index) => (
                <div key={index} className="flex gap-3 p-4 bg-background rounded-lg">
                  <div className="text-warning font-bold">{index + 1}.</div>
                  <div className="flex-1 text-muted">{tip}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-sm">
              <span className="text-muted">
                Confidence: <span className="font-semibold text-text">{advice.confidence}%</span>
              </span>
              <span className="text-muted">
                Source: <span className="font-semibold text-text capitalize">{advice.source}</span>
              </span>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ItemDetail;
