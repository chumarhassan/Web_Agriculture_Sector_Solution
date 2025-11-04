import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, adviceAPI } from '../utils/api';
import { MessageSquare, LogOut, MapPin, Lightbulb, TrendingUp } from 'lucide-react';
import SimpleWeatherMap from '../components/SimpleWeatherMap';

const SimpleFarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(user?.region || 'Lahore');
  const [search, setSearch] = useState('');
  const [showWeatherMap, setShowWeatherMap] = useState(false);
  const [aiAdvice, setAiAdvice] = useState([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const regions = {
    'Lahore': 'لاہور',
    'Karachi': 'کراچی',
    'Islamabad': 'اسلام آباد',
    'Peshawar': 'پشاور',
    'Quetta': 'کوئٹہ',
    'Multan': 'ملتان',
    'Faisalabad': 'فیصل آباد'
  };

  const itemNames = {
    'Tomato': 'ٹماٹر',
    'Potato': 'آلو',
    'Onion': 'پیاز',
    'Carrot': 'گاجر',
    'Apple': 'سیب',
    'Banana': 'کیلا'
  };

  useEffect(() => {
    fetchItems();
    fetchAIAdvice();
  }, [region]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getAll({ region });
      setItems(response.data.data.items);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAdvice = async () => {
    try {
      setLoadingAdvice(true);
      
      // First, get all items to find IDs for popular items
      const itemsResponse = await itemsAPI.getAll({});
      const allItems = itemsResponse.data.data.items || [];
      
      // Get advice for popular items in the region
      const popularItemNames = ['Tomato', 'Potato', 'Onion'];
      const advicePromises = popularItemNames.map(async (itemName) => {
        try {
          // Find the item ID
          const item = allItems.find(i => i.name === itemName);
          if (!item) return null;
          
          const response = await adviceAPI.getAdvice({ 
            itemId: item._id, 
            region,
            city: region // Use region as city
          });
          
          return {
            item: itemName,
            advice: response.data.data.advice || [],
            confidence: response.data.data.confidence || 0
          };
        } catch (err) {
          console.error(`Error fetching advice for ${itemName}:`, err);
          return null;
        }
      });
      
      const results = await Promise.all(advicePromises);
      setAiAdvice(results.filter(r => r !== null && r.advice.length > 0));
    } catch (error) {
      console.error('Error fetching AI advice:', error);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🌾</span>
              <div>
                <h1 className="text-3xl font-bold">خوش آمدید!</h1>
                <p className="text-xl text-green-100">{user?.name}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowWeatherMap(!showWeatherMap)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold text-xl transition-all flex items-center gap-2"
              >
                <MapPin className="w-6 h-6" />
                موسم
              </button>
              <button
                onClick={() => navigate('/forum')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-xl transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-6 h-6" />
                فورم
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-xl hover:bg-green-50 transition-all flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                لاگ آؤٹ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Suggestions Card - NEW */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white rounded-full p-4">
              <Lightbulb className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">AI مشورے</h2>
              <p className="text-xl text-white opacity-90">آپ کے لیے خاص تجاویز</p>
            </div>
          </div>

          {loadingAdvice ? (
            <div className="bg-white bg-opacity-90 rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-xl text-gray-700">مشورے لوڈ ہو رہے ہیں...</p>
            </div>
          ) : aiAdvice.length > 0 ? (
            <div className="space-y-4">
              {aiAdvice.map((item, idx) => (
                <div key={idx} className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      {itemNames[item.item] || item.item}
                    </h3>
                    <span className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                      {item.confidence}% یقین
                    </span>
                  </div>
                  <div className="space-y-2">
                    {item.advice.map((advice, i) => (
                      <p key={i} className="text-lg text-gray-700 leading-relaxed flex gap-2">
                        <span className="text-orange-500">•</span>
                        <span>{advice}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white bg-opacity-90 rounded-2xl p-8 text-center">
              <p className="text-xl text-gray-600">ابھی کوئی مشورہ دستیاب نہیں</p>
            </div>
          )}
        </div>

        {/* Weather Map (if shown) */}
        {showWeatherMap && (
          <div className="mb-8">
            <SimpleWeatherMap />
          </div>
        )}

        {/* Region Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">اپنا علاقہ منتخب کریں</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(regions).map(([eng, urdu]) => (
              <button
                key={eng}
                onClick={() => setRegion(eng)}
                className={`px-6 py-5 text-2xl font-bold rounded-2xl transition-all ${
                  region === eng
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {urdu}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <label className="block text-3xl font-bold mb-6 text-gray-800">تلاش کریں</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-5 text-2xl border-4 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none bg-gray-50"
            placeholder="مثال: ٹماٹر، آلو..."
          />
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-24 w-24 border-8 border-green-600 border-t-transparent mx-auto"></div>
            <p className="text-3xl text-gray-600 mt-8">لوڈ ہو رہا ہے...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all cursor-pointer hover:scale-105"
              >
                {/* Item Name */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-5xl">
                      {item.name === 'Tomato' ? '🍅' : item.name === 'Potato' ? '🥔' : 
                       item.name === 'Onion' ? '🧅' : item.name === 'Carrot' ? '🥕' :
                       item.name === 'Apple' ? '🍎' : '🍌'}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {itemNames[item.name] || item.name}
                  </h3>
                  <p className="text-xl text-gray-500">
                    ({item.name})
                  </p>
                </div>

                {/* Price */}
                {item.latestPrice ? (
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 text-center">
                    <p className="text-xl text-gray-600 mb-2">آج کی قیمت</p>
                    <p className="text-5xl font-bold text-green-600 ltr">
                      {item.latestPrice.toFixed(0)} <span className="text-3xl">روپے</span>
                    </p>
                    <p className="text-lg text-gray-500 mt-2 ltr">
                      فی {item.unit === 'kg' ? 'کلو' : item.unit}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-2xl p-6 text-center">
                    <p className="text-xl text-gray-500">قیمت دستیاب نہیں</p>
                  </div>
                )}

                {/* View Button */}
                <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-2xl text-xl font-bold hover:shadow-xl transition-all">
                  مزید دیکھیں →
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl">
            <span className="text-8xl">📦</span>
            <p className="text-3xl text-gray-600 mt-8">کوئی شے نہیں ملی</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleFarmerDashboard;
