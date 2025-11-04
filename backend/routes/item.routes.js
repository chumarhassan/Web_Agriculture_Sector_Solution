const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');

// Public routes
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.get('/:id/prices', itemController.getItemPrices);

module.exports = router;
