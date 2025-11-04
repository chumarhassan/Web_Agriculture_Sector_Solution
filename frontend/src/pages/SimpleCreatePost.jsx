import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../utils/api';
import UrduKeyboard from '../components/UrduKeyboard';
import { ArrowLeft, Keyboard, Send, AlertCircle } from 'lucide-react';

const SimpleCreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'discussion',
  });
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'question', label: 'سوال', emoji: '❓', color: 'from-blue-400 to-blue-600' },
    { value: 'discussion', label: 'گفتگو', emoji: '💬', color: 'from-green-400 to-green-600' },
    { value: 'news', label: 'خبریں', emoji: '📈', color: 'from-purple-400 to-purple-600' },
    { value: 'advice', label: 'مشورے', emoji: '💡', color: 'from-yellow-400 to-orange-600' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('براہ کرم تمام معلومات بھریں');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await forumAPI.createPost(formData);
      navigate('/forum');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('پیغام بھیجنے میں خرابی');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyboardInsert = (char) => {
    if (activeField === 'title') {
      setFormData(prev => ({
        ...prev,
        title: prev.title + char
      }));
    } else if (activeField === 'content') {
      setFormData(prev => ({
        ...prev,
        content: prev.content + char
      }));
    }
  };

  const openKeyboard = (field) => {
    setActiveField(field);
    setShowKeyboard(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/forum')}
            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">واپس</span>
          </button>
          <h1 className="text-4xl font-bold">نیا پیغام لکھیں ✍️</h1>
          <p className="text-xl mt-2 opacity-90">اپنا سوال یا تجربہ شیئر کریں</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <p className="text-xl text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Category Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-4">
              قسم منتخب کریں
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-6 rounded-xl text-xl font-bold transition-all flex items-center gap-3 ${
                    formData.category === cat.value
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                  }`}
                >
                  <span className="text-4xl">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-2xl font-bold text-gray-800 dark:text-white">
                عنوان
              </label>
              <button
                type="button"
                onClick={() => openKeyboard('title')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-base font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Keyboard className="w-5 h-5" />
                اردو کی بورڈ
              </button>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="اپنے پیغام کا عنوان لکھیں..."
              className="w-full px-6 py-4 text-xl border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              dir="auto"
            />
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-2xl font-bold text-gray-800 dark:text-white">
                تفصیلات
              </label>
              <button
                type="button"
                onClick={() => openKeyboard('content')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-base font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Keyboard className="w-5 h-5" />
                اردو کی بورڈ
              </button>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="اپنا پیغام تفصیل سے لکھیں..."
              rows="10"
              className="w-full px-6 py-4 text-xl border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              dir="auto"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl text-2xl font-bold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  بھیجا جا رہا ہے...
                </>
              ) : (
                <>
                  <Send className="w-7 h-7" />
                  پیغام بھیجیں
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/forum')}
              className="px-8 py-6 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-2xl text-2xl font-bold hover:shadow-2xl transition-all"
            >
              منسوخ
            </button>
          </div>
        </form>
      </div>

      {/* Urdu Keyboard Modal */}
      {showKeyboard && (
        <UrduKeyboard
          onInsert={handleKeyboardInsert}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
};

export default SimpleCreatePost;
