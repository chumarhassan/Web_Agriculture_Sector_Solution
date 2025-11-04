const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Item management
router.post('/items', adminController.createItem);
router.put('/items/:id', adminController.updateItem);
router.delete('/items/:id', adminController.deleteItem);

// Price management
router.post('/prices/bulk', adminController.addPricesBulk);

// Statistics
router.get('/stats', adminController.getStats);

module.exports = router;
