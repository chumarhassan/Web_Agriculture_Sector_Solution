import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../utils/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      await forumAPI.createPost({
        ...data,
        tags
      });
      navigate('/forum');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="secondary" onClick={() => navigate('/forum')} className="mb-4">
            ← Back to Forum
          </Button>
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-muted">Share your knowledge with the community</p>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                className="input"
                placeholder="What's your post about?"
                {...register('title', { 
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters'
                  },
                  maxLength: {
                    value: 200,
                    message: 'Title cannot exceed 200 characters'
                  }
                })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-danger">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                className="input"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select a category</option>
                <option value="question">Question</option>
                <option value="discussion">Discussion</option>
                <option value="advice">Advice</option>
                <option value="news">News</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-danger">{errors.category.message}</p>
              )}
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium mb-2">Region (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Lahore, Karachi"
                defaultValue={user?.region}
                {...register('region')}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <textarea
                className="input"
                rows="10"
                placeholder="Write your post content here... Be detailed and helpful!"
                {...register('content', { 
                  required: 'Content is required',
                  minLength: {
                    value: 10,
                    message: 'Content must be at least 10 characters'
                  }
                })}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-danger">{errors.content.message}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-background rounded-full text-sm text-primary flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-danger hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="success"
                fullWidth
                disabled={loading}
              >
                <PlusCircle size={20} className="inline mr-2" />
                {loading ? 'Creating...' : 'Create Post'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/forum')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreatePost;
