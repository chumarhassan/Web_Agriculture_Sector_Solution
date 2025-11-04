import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../utils/api';
import UrduKeyboard from '../components/UrduKeyboard';
import { ArrowLeft, User, Calendar, MessageCircle, Keyboard, Send, AlertCircle } from 'lucide-react';

const SimplePostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = {
    'question': { label: 'سوال', emoji: '❓', color: 'from-blue-400 to-blue-600' },
    'discussion': { label: 'گفتگو', emoji: '💬', color: 'from-green-400 to-green-600' },
    'news': { label: 'خبریں', emoji: '📈', color: 'from-purple-400 to-purple-600' },
    'advice': { label: 'مشورے', emoji: '💡', color: 'from-yellow-400 to-orange-600' },
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await forumAPI.getPost(id);
      // Backend returns { post, comments } in data
      const responseData = response.data.data || response.data;
      setPost(responseData.post || responseData);
      setComments(responseData.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('پیغام لوڈ کرنے میں خرابی');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('براہ کرم تبصرہ لکھیں');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await forumAPI.addComment(id, { content: comment });
      setComment('');
      await fetchPost(); // Refresh to show new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('تبصرہ شامل کرنے میں خرابی');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyboardInsert = (char) => {
    setComment(prev => prev + char);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'آج';
    if (diffDays === 1) return 'کل';
    if (diffDays < 7) return `${diffDays} دن پہلے`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ہفتے پہلے`;
    return `${Math.floor(diffDays / 30)} مہینے پہلے`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-2xl text-gray-700 dark:text-gray-300">لوڈ ہو رہا ہے...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl text-red-600 dark:text-red-400">پیغام نہیں ملا</p>
          <button
            onClick={() => navigate('/forum')}
            className="mt-6 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xl font-bold hover:shadow-lg transition-all"
          >
            واپس جائیں
          </button>
        </div>
      </div>
    );
  }

  const category = categories[post.category] || categories['discussion'];

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
          <div className="flex items-center gap-3">
            <span className="text-5xl">{category.emoji}</span>
            <div>
              <div className="px-4 py-1 bg-white bg-opacity-20 rounded-lg inline-block mb-2">
                <span className="text-lg">{category.label}</span>
              </div>
              <h1 className="text-3xl font-bold leading-relaxed" dir="auto">{post.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {post.author?.name || 'Unknown'}
              </p>
              <p className="text-base text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap" dir="auto">
            {post.content}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            تبصرے ({comments.length})
          </h2>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border-2 border-red-500 rounded-xl p-4 mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <p className="text-lg text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <label className="text-xl font-bold text-gray-800 dark:text-white">
                اپنا تبصرہ لکھیں
              </label>
              <button
                type="button"
                onClick={() => setShowKeyboard(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-base font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Keyboard className="w-5 h-5" />
                اردو کی بورڈ
              </button>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اپنا تبصرہ یہاں لکھیں..."
              rows="4"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none mb-4"
              dir="auto"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl text-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  بھیجا جا رہا ہے...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  تبصرہ بھیجیں
                </>
              )}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  ابھی کوئی تبصرہ نہیں ہے
                </p>
                <p className="text-lg text-gray-400 dark:text-gray-500 mt-2">
                  پہلا تبصرہ کریں!
                </p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {comment.author?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed" dir="auto">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
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

export default SimplePostDetail;
