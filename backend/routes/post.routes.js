const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');

// Public routes (with optional auth for view tracking)
router.get('/', optionalAuth, postController.getPosts);
router.get('/:id', optionalAuth, postController.getPostById);

// Protected routes
router.post('/', authMiddleware, postController.createPost);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

// Comment routes
router.post('/:id/comments', authMiddleware, postController.addComment);
router.delete('/:postId/comments/:commentId', authMiddleware, postController.deleteComment);

module.exports = router;
