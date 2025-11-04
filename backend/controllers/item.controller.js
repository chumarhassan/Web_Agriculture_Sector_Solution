const Item = require('../models/Item.model');
const PricePoint = require('../models/PricePoint.model');

/**
 * @route   GET /api/items
 * @desc    Get all items with optional filtering
 * @access  Public
 * @query   region, search, category
 */
exports.getItems = async (req, res, next) => {
  try {
    const { region, search, category } = req.query;
    
    let filter = {};
    
    // Filter by category
    if (category) {
      filter.category = category;
    }
    
    // Search by name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const items = await Item.find(filter).sort({ name: 1 });

    // If region is specified, get latest price for each item
    if (region) {
      const itemsWithPrices = await Promise.all(
        items.map(async (item) => {
          const latestPrice = await PricePoint.findOne({
            item: item._id,
            region: region
          }).sort({ date: -1 });

          return {
            ...item.toObject(),
            latestPrice: latestPrice ? latestPrice.price : null,
            priceDate: latestPrice ? latestPrice.date : null
          };
        })
      );

      return res.json({
        success: true,
        data: { items: itemsWithPrices, count: itemsWithPrices.length },
        message: 'Items retrieved successfully'
      });
    }

    res.json({
      success: true,
      data: { items, count: items.length },
      message: 'Items retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/items/:id
 * @desc    Get single item by ID
 * @access  Public
 */
exports.getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: { item },
      message: 'Item retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/items/:id/prices
 * @desc    Get price history for an item
 * @access  Public
 * @query   region (required), days (default: 7)
 */
exports.getItemPrices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { region, days = 7 } = req.query;

    if (!region) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Region parameter is required'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get price points
    const prices = await PricePoint.find({
      item: id,
      region: region,
      date: { $gte: startDate, $lte: endDate }
    })
    .sort({ date: 1 })
    .populate('item', 'name unit');

    // Calculate statistics
    const priceValues = prices.map(p => p.price);
    const stats = priceValues.length > 0 ? {
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
      avg: priceValues.reduce((a, b) => a + b, 0) / priceValues.length,
      latest: priceValues[priceValues.length - 1],
      trend: priceValues.length > 1 
        ? ((priceValues[priceValues.length - 1] - priceValues[0]) / priceValues[0] * 100).toFixed(2)
        : 0
    } : null;

    res.json({
      success: true,
      data: { 
        prices, 
        count: prices.length,
        stats,
        region,
        days: parseInt(days)
      },
      message: 'Price history retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};
