import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumAPI } from '../utils/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { MessageSquare, Plus, Search, Eye, Calendar } from 'lucide-react';

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [page, category]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await forumAPI.getPosts(params);
      setPosts(response.data.data.posts);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const getCategoryColor = (cat) => {
    const colors = {
      question: 'text-primary',
      discussion: 'text-success',
      advice: 'text-warning',
      news: 'text-danger',
      other: 'text-muted'
    };
    return colors[cat] || 'text-muted';
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
              <p className="text-muted">Share knowledge and discuss farming topics</p>
            </div>
            <Button variant="primary" onClick={() => navigate('/forum/create')}>
              <Plus size={20} className="inline mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              <option value="question">Questions</option>
              <option value="discussion">Discussions</option>
              <option value="advice">Advice</option>
              <option value="news">News</option>
              <option value="other">Other</option>
            </select>
          </form>
        </Card>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading posts...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Card
                    key={post._id}
                    className="p-6 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => navigate(`/forum/${post._id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-text hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full bg-background capitalize ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>

                    <p className="text-muted mb-4 line-clamp-2">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        <span>by {post.author?.name || 'Unknown'}</span>
                      </div>

                      {post.region && (
                        <div className="flex items-center gap-2">
                          <span>📍 {post.region}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{post.viewCount} views</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-background rounded text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare size={48} className="text-muted mx-auto mb-4" />
                  <p className="text-muted mb-4">No posts found</p>
                  <Button variant="primary" onClick={() => navigate('/forum/create')}>
                    Create the first post
                  </Button>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="secondary"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                <span className="text-muted px-4">
                  Page {page} of {pagination.pages}
                </span>
                
                <Button
                  variant="secondary"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Forum;
