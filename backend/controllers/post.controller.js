const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');

/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination
 * @access  Public
 * @query   page, limit, category, region, search
 */
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, region, search } = req.query;
    
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (region) {
      filter.region = region;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await Post.find(filter)
      .populate('author', 'name region')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Posts retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post with comments
 * @access  Public
 */
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name region role');

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Post not found'
      });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    // Get comments
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'name region role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { post, comments },
      message: 'Post retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, region } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title and content are required'
      });
    }

    const post = new Post({
      title,
      content,
      category: category || 'discussion',
      tags: tags || [],
      region: region || req.user.region,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'name region role');

    res.status(201).json({
      success: true,
      data: { post },
      message: 'Post created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private (Author only)
 */
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You can only update your own posts'
      });
    }

    const { title, content, category, tags, region } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (region) post.region = region;

    await post.save();
    await post.populate('author', 'name region role');

    res.json({
      success: true,
      data: { post },
      message: 'Post updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private (Author only)
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Post not found'
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You can only delete your own posts'
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    // Delete all comments on this post
    await Comment.deleteMany({ post: req.params.id });

    res.json({
      success: true,
      data: { post },
      message: 'Post and comments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Add a comment to a post
 * @access  Private
 */
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Post not found'
      });
    }

    const comment = new Comment({
      post: req.params.id,
      content,
      author: req.user._id
    });

    await comment.save();
    await comment.populate('author', 'name region role');

    res.status(201).json({
      success: true,
      data: { comment },
      message: 'Comment added successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:postId/comments/:commentId
 * @desc    Delete a comment
 * @access  Private (Author only)
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Comment not found'
      });
    }

    // Check if user is the author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'You can only delete your own comments'
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({
      success: true,
      data: { comment },
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
