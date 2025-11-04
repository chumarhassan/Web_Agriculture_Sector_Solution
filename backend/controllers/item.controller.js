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

/**
 * @route   GET /api/items/compare?itemIds=id1,id2,id3&region=Lahore&days=7
 * @desc    Compare price trends of multiple items (BONUS FEATURE)
 * @access  Public
 * @query   itemIds (comma-separated), region (required), days (default: 7)
 */
exports.compareItems = async (req, res, next) => {
  try {
    const { itemIds, region, days = 7 } = req.query;

    if (!itemIds) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'itemIds parameter is required (comma-separated list)'
      });
    }

    if (!region) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'region parameter is required'
      });
    }

    // Parse item IDs
    const itemIdArray = itemIds.split(',').map(id => id.trim());

    if (itemIdArray.length < 2) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide at least 2 items to compare'
      });
    }

    if (itemIdArray.length > 5) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Maximum 5 items can be compared at once'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Fetch all items
    const items = await Item.find({ _id: { $in: itemIdArray } });

    if (items.length !== itemIdArray.length) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'One or more items not found'
      });
    }

    // Fetch price data for all items
    const comparisonData = await Promise.all(
      items.map(async (item) => {
        const prices = await PricePoint.find({
          item: item._id,
          region: region,
          date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        // Calculate statistics
        const priceValues = prices.map(p => p.price);
        const stats = priceValues.length > 0 ? {
          min: Math.min(...priceValues),
          max: Math.max(...priceValues),
          avg: (priceValues.reduce((a, b) => a + b, 0) / priceValues.length).toFixed(2),
          latest: priceValues[priceValues.length - 1],
          trend: priceValues.length > 1 
            ? ((priceValues[priceValues.length - 1] - priceValues[0]) / priceValues[0] * 100).toFixed(2)
            : 0,
          volatility: priceValues.length > 1
            ? calculateVolatility(priceValues).toFixed(2)
            : 0
        } : null;

        return {
          item: {
            _id: item._id,
            name: item.name,
            category: item.category,
            unit: item.unit
          },
          prices: prices.map(p => ({
            date: p.date,
            price: p.price
          })),
          stats
        };
      })
    );

    // Find best and worst performers
    const itemsWithStats = comparisonData.filter(d => d.stats);
    let bestPerformer = null;
    let worstPerformer = null;
    
    if (itemsWithStats.length > 0) {
      bestPerformer = itemsWithStats.reduce((max, item) => 
        parseFloat(item.stats.trend) > parseFloat(max.stats.trend) ? item : max
      );
      worstPerformer = itemsWithStats.reduce((min, item) => 
        parseFloat(item.stats.trend) < parseFloat(min.stats.trend) ? item : min
      );
    }

    res.json({
      success: true,
      data: {
        items: comparisonData,
        region,
        days: parseInt(days),
        dateRange: {
          start: startDate,
          end: endDate
        },
        insights: {
          bestPerformer: bestPerformer ? {
            name: bestPerformer.item.name,
            trend: `${bestPerformer.stats.trend}%`
          } : null,
          worstPerformer: worstPerformer ? {
            name: worstPerformer.item.name,
            trend: `${worstPerformer.stats.trend}%`
          } : null
        }
      },
      message: 'Price comparison data retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate volatility (standard deviation)
function calculateVolatility(prices) {
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  return Math.sqrt(variance);
}
