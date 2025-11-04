import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../utils/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import { MessageSquare, Send, Trash2, Eye, Calendar, User } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await forumAPI.getPost(id);
      setPost(response.data.data.post);
      setComments(response.data.data.comments);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (data) => {
    try {
      await forumAPI.addComment(id, data);
      reset();
      fetchPost();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await forumAPI.deletePost(id);
      navigate('/forum');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await forumAPI.deleteComment(id, commentId);
      fetchPost();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading post...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted">Post not found</p>
          <Button variant="primary" onClick={() => navigate('/forum')} className="mt-4">
            Back to Forum
          </Button>
        </div>
      </Layout>
    );
  }

  const canDelete = user?._id === post.author._id || user?.role === 'admin';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="secondary" onClick={() => navigate('/forum')} className="mb-6">
          ← Back to Forum
        </Button>

        {/* Post */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold flex-1">{post.title}</h1>
            {canDelete && (
              <Button variant="danger" onClick={handleDeletePost}>
                <Trash2 size={18} />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted mb-6">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author.name}</span>
              {post.author.role === 'admin' && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">Admin</span>
              )}
            </div>
            {post.region && <span>📍 {post.region}</span>}
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{post.viewCount} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-text whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700 flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <span key={i} className="text-sm px-3 py-1 bg-background rounded-full text-primary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Comments Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmit(handleAddComment)} className="mb-8">
            <textarea
              className="input"
              rows="4"
              placeholder="Share your thoughts..."
              {...register('content', { 
                required: 'Comment cannot be empty',
                minLength: {
                  value: 1,
                  message: 'Comment is too short'
                }
              })}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-danger">{errors.content.message}</p>
            )}
            <Button type="submit" variant="primary" className="mt-3">
              <Send size={18} className="inline mr-2" />
              Post Comment
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="p-4 bg-background rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-muted" />
                      <span className="font-medium">{comment.author.name}</span>
                      {comment.author.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">Admin</span>
                      )}
                      <span className="text-muted">•</span>
                      <span className="text-muted">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {(user?._id === comment.author._id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-danger hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-muted whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PostDetail;
