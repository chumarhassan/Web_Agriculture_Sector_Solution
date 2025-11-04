const Item = require('../models/Item.model');
const PricePoint = require('../models/PricePoint.model');
const User = require('../models/User.model');

/**
 * @route   POST /api/admin/items
 * @desc    Create a new item
 * @access  Private (Admin only)
 */
exports.createItem = async (req, res, next) => {
  try {
    const { name, category, unit, description } = req.body;

    if (!name || !category || !unit) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide name, category, and unit'
      });
    }

    const item = new Item({
      name,
      category,
      unit,
      description
    });

    await item.save();

    res.status(201).json({
      success: true,
      data: { item },
      message: 'Item created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/items/:id
 * @desc    Update an item
 * @access  Private (Admin only)
 */
exports.updateItem = async (req, res, next) => {
  try {
    const { name, category, unit, description } = req.body;

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, category, unit, description },
      { new: true, runValidators: true }
    );

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
      message: 'Item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/items/:id
 * @desc    Delete an item
 * @access  Private (Admin only)
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Item not found'
      });
    }

    // Also delete all price points for this item
    await PricePoint.deleteMany({ item: req.params.id });

    res.json({
      success: true,
      data: { item },
      message: 'Item and associated prices deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/prices/bulk
 * @desc    Add multiple price points in bulk (CSV upload support)
 * @access  Private (Admin only)
 * @body    Array of { itemName, region, date, price }
 */
exports.addPricesBulk = async (req, res, next) => {
  try {
    const pricesData = req.body.prices;

    if (!Array.isArray(pricesData) || pricesData.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide an array of prices'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    // Process each price entry
    for (const entry of pricesData) {
      try {
        const { itemName, region, date, price } = entry;

        // Find item by name
        const item = await Item.findOne({ name: itemName });
        
        if (!item) {
          results.failed.push({
            entry,
            reason: `Item '${itemName}' not found`
          });
          continue;
        }

        // Create price point
        const pricePoint = new PricePoint({
          item: item._id,
          region,
          date: date ? new Date(date) : new Date(),
          price: parseFloat(price)
        });

        await pricePoint.save();
        results.success.push(pricePoint);
      } catch (error) {
        results.failed.push({
          entry,
          reason: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        successCount: results.success.length,
        failedCount: results.failed.length,
        failed: results.failed
      },
      message: `Bulk upload completed. ${results.success.length} prices added, ${results.failed.length} failed.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/stats
 * @desc    Get summary statistics for admin dashboard
 * @access  Private (Admin only)
 */
exports.getStats = async (req, res, next) => {
  try {
    // Get counts
    const totalItems = await Item.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalPricePoints = await PricePoint.countDocuments();

    // Get recent price updates
    const recentPrices = await PricePoint.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('item', 'name unit');

    // Get items by category
    const itemsByCategory = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get price points by region
    const pricesByRegion = await PricePoint.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          items: totalItems,
          users: totalUsers,
          pricePoints: totalPricePoints
        },
        recentPrices,
        itemsByCategory,
        usersByRole,
        pricesByRegion
      },
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};
