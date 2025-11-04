const Item = require('../models/Item.model');
const PricePoint = require('../models/PricePoint.model');
const axios = require('axios');

// Helper function to generate rule-based advice
const generateRuleBasedAdvice = (item, priceData, weatherData) => {
  const advice = [];
  let confidence = 0;

  // Analyze price trend
  if (priceData.length >= 2) {
    const prices = priceData.map(p => p.price);
    const recentPrice = prices[prices.length - 1];
    const oldPrice = prices[0];
    const priceChange = ((recentPrice - oldPrice) / oldPrice) * 100;

    if (priceChange > 10) {
      advice.push(`${item.name} کی قیمتیں بڑھ رہی ہیں (+${priceChange.toFixed(1)}%)۔ اگر آپ کے پاس اسٹاک ہے تو فروخت کرنے کا اچھا وقت ہے۔`);
      confidence += 30;
    } else if (priceChange < -10) {
      advice.push(`${item.name} کی قیمتیں گر رہی ہیں (${priceChange.toFixed(1)}%)۔ اسٹاک رکھنے یا متنوع حکمت عملی پر غور کریں۔`);
      confidence += 25;
    } else {
      advice.push(`${item.name} کی قیمتیں مستحکم ہیں۔ مارکیٹ کی صورتحال معمول کے مطابق ہے۔`);
      confidence += 20;
    }

    // Price volatility check
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = prices.some(p => Math.abs(p - avgPrice) / avgPrice > 0.15);
    
    if (volatility) {
      advice.push('قیمتوں میں زیادہ اتار چڑھاؤ ہے۔ مارکیٹ پر قریب سے نظر رکھیں۔');
      confidence += 15;
    }
  }

  // Weather-based advice
  if (weatherData) {
    if (weatherData.rain) {
      if (['vegetable', 'fruit'].includes(item.category)) {
        advice.push('بارش کی پیش گوئی ہے۔ پانی کے زیادہ ہونے سے فصل کی حفاظت کریں۔');
        confidence += 20;
      }
    } else {
      if (item.category === 'vegetable') {
        advice.push('خشک موسم۔ سبزیوں کے لئے مناسب آبپاشی یقینی بنائیں۔');
        confidence += 15;
      }
    }

    if (weatherData.temperature > 35) {
      advice.push('درجہ حرارت زیادہ ہے۔ سایہ فراہم کریں اور پانی زیادہ دیں۔');
      confidence += 20;
    } else if (weatherData.temperature < 10) {
      advice.push('درجہ حرارت کم ہے۔ حساس فصل کو سردی سے بچائیں۔');
      confidence += 20;
    }
  }

  // Seasonal advice (simplified)
  const month = new Date().getMonth();
  if (item.category === 'vegetable' && (month >= 2 && month <= 4)) {
    advice.push('بہار کا موسم: پتوں والی سبزیوں کی کاشت کا اچھا وقت ہے۔');
    confidence += 10;
  }

  return {
    advice: advice.length > 0 ? advice : ['اس وقت کوئی خاص سفارش نہیں۔ قیمتوں اور موسم کی نگرانی جاری رکھیں۔'],
    confidence: Math.min(confidence, 95) // Cap at 95%
  };
};

// Main controller function
exports.getAdvice = async (req, res, next) => {
  try {
    const { itemId, region, city } = req.query;

    if (!itemId || !region) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and region are required'
      });
    }

    // Get item details
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Get recent price data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const priceData = await PricePoint.find({
      item: itemId,
      region: region,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 }).limit(10);

    // Get weather data
    let weatherData = null;
    try {
      const weatherApiKey = process.env.OPENWEATHER_API_KEY;
      const weatherCity = city || region;
      
      if (weatherApiKey) {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity},PK&appid=${weatherApiKey}&units=metric`
        );
        
        weatherData = {
          temperature: weatherResponse.data.main.temp,
          rain: weatherResponse.data.weather[0].main.toLowerCase().includes('rain'),
          description: weatherResponse.data.weather[0].description
        };
      }
    } catch (weatherError) {
      console.log('Weather API error:', weatherError.message);
    }

    // Generate rule-based advice
    const ruleBasedResult = generateRuleBasedAdvice(item, priceData, weatherData);

    // Return response
    res.json({
      success: true,
      data: {
        item: {
          id: item._id,
          name: item.name,
          category: item.category
        },
        advice: ruleBasedResult.advice,
        confidence: ruleBasedResult.confidence,
        source: 'rule-based',
        priceDataPoints: priceData.length,
        weatherIncluded: weatherData !== null
      }
    });

  } catch (error) {
    next(error);
  }
};
