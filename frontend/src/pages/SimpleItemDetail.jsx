import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, weatherAPI, adviceAPI } from '../utils/api';
import { t } from '../utils/translations';
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
import { ArrowLeft, Cloud, TrendingUp, Lightbulb, Calendar, MapPin } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SimpleItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, selectedRegion } = useAuth();
  const [item, setItem] = useState(null);
  const [prices, setPrices] = useState([]);
  const [weather, setWeather] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [displayRegion, setDisplayRegion] = useState(null); // Track which region data is for

  // Urdu item names
  const itemNames = {
    'Tomato': 'ٹماٹر 🍅',
    'Potato': 'آلو 🥔',
    'Onion': 'پیاز 🧅',
    'Carrot': 'گاجر 🥕',
    'Apple': 'سیب 🍎',
    'Banana': 'کیلا 🍌',
    'Wheat': 'گندم 🌾',
    'Rice': 'چاول 🍚',
    'Milk': 'دودھ 🥛',
    'Chicken': 'مرغی 🐔',
    'Beef': 'گائے کا گوشت 🥩',
    'Mutton': 'بکرے کا گوشت 🍖',
    'Egg': 'انڈا 🥚',
    'Sugar': 'چینی 🍬',
    'Oil': 'تیل 🛢️',
  };

  const categoryNames = {
    'vegetable': 'سبزیاں 🥬',
    'fruit': 'پھل 🍇',
    'grain': 'اناج 🌾',
    'dairy': 'دودھ 🥛',
    'meat': 'گوشت 🍖',
    'other': 'دیگر 📦',
  };

  const regionNames = {
    'Lahore': 'لاہور',
    'Karachi': 'کراچی',
    'Islamabad': 'اسلام آباد',
    'Peshawar': 'پشاور',
    'Quetta': 'کوئٹہ',
    'Multan': 'ملتان',
    'Faisalabad': 'فیصل آباد',
    'Hyderabad': 'حیدرآباد',
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, days]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Use selected region from context, fallback to user region, then Lahore
      const regionToUse = selectedRegion || user?.region || 'Lahore';
      console.log('Selected region from context:', selectedRegion);
      console.log('User region:', user?.region);
      console.log('Region to use for data:', regionToUse);
      setDisplayRegion(regionToUse);

      // Fetch item details
      const itemResponse = await itemsAPI.getById(id);
      console.log('Item response:', itemResponse.data);
      setItem(itemResponse.data.data.item); // Backend returns data.data.item

      // Fetch price history using the correct API function
      const priceResponse = await itemsAPI.getPrices(id, { 
        days: days,
        region: regionToUse
      });
      console.log('Price response:', priceResponse.data);
      console.log('Fetching prices for region:', regionToUse);
      // Backend returns data.data.prices (not just data.data)
      setPrices(priceResponse.data.data.prices || []);

      // Fetch weather if we have region
      if (regionToUse) {
        try {
          const weatherResponse = await weatherAPI.getWeather(regionToUse);
          console.log('Weather response:', weatherResponse.data);
          setWeather(weatherResponse.data.data);
        } catch (error) {
          console.error('Weather fetch failed:', error);
        }
      }

      // Fetch advice
      try {
        const adviceResponse = await adviceAPI.getAdvice({
          itemId: id,
          region: regionToUse,
        });
        setAdvice(adviceResponse.data.data);
      } catch (error) {
        console.error('Advice fetch failed:', error);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    console.log('getChartData called, prices:', prices);
    
    if (!prices || prices.length === 0) {
      console.log('No prices available for chart');
      return {
        labels: [],
        datasets: []
      };
    }

    const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date));
    console.log('Sorted prices for chart:', sortedPrices.length, 'items');
    
    return {
      labels: sortedPrices.map(p => {
        const date = new Date(p.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          label: 'قیمت (روپے)',
          data: sortedPrices.map(p => p.price),
          borderColor: 'rgb(22, 163, 74)', // green-600
          backgroundColor: 'rgba(22, 163, 74, 0.3)', // green with more opacity
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(22, 163, 74)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: 'rgb(16, 185, 129)', // emerald-500
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
          borderWidth: 3, // thicker line
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16,
            family: "'Noto Nastaliq Urdu', serif"
          }
        }
      },
      title: {
        display: true,
        text: `آخری ${days} دن کی قیمتیں`,
        font: {
          size: 20,
          family: "'Noto Nastaliq Urdu', serif",
          weight: 'bold'
        }
      },
      tooltip: {
        bodyFont: {
          size: 14,
          family: "'Noto Nastaliq Urdu', serif"
        },
        titleFont: {
          size: 16,
          family: "'Noto Nastaliq Urdu', serif"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          font: {
            size: 14
          },
          callback: function(value) {
            return value + ' روپے';
          }
        },
        grid: {
          color: 'rgba(22, 163, 74, 0.1)', // light green grid
          borderColor: 'rgba(22, 163, 74, 0.3)',
        }
      },
      x: {
        ticks: {
          font: {
            size: 14
          }
        },
        grid: {
          color: 'rgba(22, 163, 74, 0.2)', // more visible green grid
          borderColor: 'rgba(22, 163, 74, 0.5)',
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-2xl text-gray-700 dark:text-gray-300">لوڈ ہو رہا ہے...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl text-red-600 dark:text-red-400">شے نہیں ملی</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xl font-bold hover:shadow-lg transition-all"
          >
            واپس جائیں
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = prices && prices.length > 0 
    ? Math.max(...prices.map(p => p.price))
    : item.price || 0;

  const avgPrice = prices && prices.length > 0
    ? (prices.reduce((sum, p) => sum + p.price, 0) / prices.length).toFixed(0)
    : currentPrice;

  const minPrice = prices && prices.length > 0
    ? Math.min(...prices.map(p => p.price))
    : currentPrice;

  const maxPrice = prices && prices.length > 0
    ? Math.max(...prices.map(p => p.price))
    : currentPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">واپس</span>
          </button>
          <h1 className="text-4xl font-bold mb-2">{itemNames[item.name] || item.name}</h1>
          <div className="flex items-center gap-3 text-lg">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-lg">
              {categoryNames[item.category] || item.category}
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg">
              <MapPin className="w-5 h-5" />
              {regionNames[displayRegion] || displayRegion || 'لاہور'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">موجودہ قیمت</h3>
            <p className="text-4xl font-bold">{currentPrice}</p>
            <p className="text-xl mt-1">روپے فی کلو</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">اوسط قیمت</h3>
            <p className="text-4xl font-bold">{avgPrice}</p>
            <p className="text-xl mt-1">روپے فی کلو</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">کم سے کم</h3>
            <p className="text-4xl font-bold">{minPrice}</p>
            <p className="text-xl mt-1">روپے فی کلو</p>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">زیادہ سے زیادہ</h3>
            <p className="text-4xl font-bold">{maxPrice}</p>
            <p className="text-xl mt-1">روپے فی کلو</p>
          </div>
        </div>

        {/* Days Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            دورانیہ منتخب کریں
          </h3>
          <div className="flex gap-3 flex-wrap">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
                  days === d
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                آخری {d} دن
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            قیمت کا چارٹ
          </h3>
          <div className="h-96">
            <Line data={getChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Weather */}
        {weather && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <Cloud className="w-6 h-6" />
              موسم کی معلومات
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-lg">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-gray-600 dark:text-gray-400 mb-1">درجہ حرارت</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {weather.temperature}°C
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-gray-600 dark:text-gray-400 mb-1">نمی</p>
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {weather.humidity}%
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-gray-600 dark:text-gray-400 mb-1">ہوا کی رفتار</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {weather.windSpeed} km/h
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-gray-600 dark:text-gray-400 mb-1">موسم</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {weather.condition}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advice */}
        {advice && advice.advice && advice.advice.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              کاشتکاری کے مشورے
            </h3>
            <div className="space-y-3">
              {advice.advice.map((adv, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                    {adv}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleItemDetail;
