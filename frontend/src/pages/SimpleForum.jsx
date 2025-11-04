import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../utils/api';
import { t } from '../utils/translations';
import { MessageSquare, Plus, Search, User, Calendar, MessageCircle, ArrowLeft } from 'lucide-react';

const SimpleForum = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isAdmin = user?.role === 'admin';

  const categories = isAdmin ? [
    { value: 'all', label: 'All', emoji: '📋', color: 'from-gray-400 to-gray-600' },
    { value: 'question', label: 'Question', emoji: '❓', color: 'from-blue-400 to-blue-600' },
    { value: 'discussion', label: 'Discussion', emoji: '💬', color: 'from-green-400 to-green-600' },
    { value: 'news', label: 'News', emoji: '📈', color: 'from-purple-400 to-purple-600' },
    { value: 'advice', label: 'Advice', emoji: '💡', color: 'from-yellow-400 to-orange-600' },
  ] : [
    { value: 'all', label: 'تمام', emoji: '📋', color: 'from-gray-400 to-gray-600' },
    { value: 'question', label: 'سوال', emoji: '❓', color: 'from-blue-400 to-blue-600' },
    { value: 'discussion', label: 'گفتگو', emoji: '💬', color: 'from-green-400 to-green-600' },
    { value: 'news', label: 'خبریں', emoji: '📈', color: 'from-purple-400 to-purple-600' },
    { value: 'advice', label: 'مشورے', emoji: '💡', color: 'from-yellow-400 to-orange-600' },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await forumAPI.getPosts();
      // Backend returns data.posts (with pagination), not just data
      const postsData = response.data.data?.posts || response.data.posts || response.data || [];
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (isAdmin) {
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      if (diffDays === 0) return 'آج';
      if (diffDays === 1) return 'کل';
      if (diffDays < 7) return `${diffDays} دن پہلے`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} ہفتے پہلے`;
      return `${Math.floor(diffDays / 30)} مہینے پہلے`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-2xl text-gray-700 dark:text-gray-300">
            {isAdmin ? 'Loading...' : 'لوڈ ہو رہا ہے...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" dir={isAdmin ? 'ltr' : 'rtl'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
          >
            {isAdmin ? (
              <>
                <ArrowLeft className="w-5 h-5" />
                <span className="text-lg">Back</span>
              </>
            ) : (
              <>
                <ArrowLeft className="w-5 h-5" />
                <span className="text-lg">واپس</span>
              </>
            )}
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <MessageSquare className="w-10 h-10" />
                {isAdmin ? "Farmers' Forum" : 'کاشتکاروں کا فورم'}
              </h1>
              <p className="text-xl opacity-90">
                {isAdmin ? 'Ask questions and share experiences' : 'سوالات پوچھیں اور تجربات شیئر کریں'}
              </p>
            </div>
            <button
              onClick={() => navigate('/forum/create')}
              className="px-6 py-4 bg-white text-green-600 rounded-xl text-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-6 h-6" />
              {isAdmin ? 'Create New Post' : 'نیا پیغام لکھیں'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="relative">
            <Search className={`absolute ${isAdmin ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAdmin ? 'Search...' : 'تلاش کریں...'}
              className={`w-full ${isAdmin ? 'pl-12 pr-6' : 'pr-12 pl-6'} py-4 text-xl border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white`}
              dir={isAdmin ? 'ltr' : 'rtl'}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            {isAdmin ? 'Categories' : 'اقسام'}
          </h3>
          <div className="flex gap-3 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all flex items-center gap-2 ${
                  selectedCategory === cat.value
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center">
              <MessageSquare className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <p className="text-2xl text-gray-600 dark:text-gray-400">
                {isAdmin ? 'No posts found' : 'کوئی پیغام نہیں ملا'}
              </p>
              <button
                onClick={() => navigate('/forum/create')}
                className="mt-6 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xl font-bold hover:shadow-lg transition-all"
              >
                {isAdmin ? 'Write First Post' : 'پہلا پیغام لکھیں'}
              </button>
            </div>
          ) : (
            filteredPosts.map(post => {
              const category = categories.find(c => c.value === post.category);
              return (
                <div
                  key={post._id}
                  onClick={() => navigate(`/forum/${post._id}`)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-green-500"
                >
                  <div className="flex items-start gap-4">
                    {/* Category Badge */}
                    <div className={`bg-gradient-to-br ${category?.color || 'from-gray-400 to-gray-600'} text-white rounded-xl p-4 flex-shrink-0`}>
                      <span className="text-4xl">{category?.emoji || '📋'}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 leading-relaxed" dir="auto">
                        {post.title}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed" dir="auto">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 text-base flex-wrap">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          <span>{post.author?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments?.length || 0} {isAdmin ? 'comments' : 'تبصرے'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleForum;
