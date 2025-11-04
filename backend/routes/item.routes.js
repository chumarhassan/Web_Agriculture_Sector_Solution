const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');

// Public routes
router.get('/', itemController.getItems);
router.get('/compare', itemController.compareItems); // BONUS: Multi-item comparison
router.get('/:id', itemController.getItemById);
router.get('/:id/prices', itemController.getItemPrices);

module.exports = router;
