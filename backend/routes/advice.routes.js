const express = require('express');
const router = express.Router();
const adviceController = require('../controllers/advice.controller');

router.get('/', adviceController.getAdvice);

module.exports = router;
