const Item = require('../models/Item.model');
const PricePoint = require('../models/PricePoint.model');
const axios = require('axios');

/**
 * Rule-based advice engine
 * Analyzes recent prices and weather to provide farming advice
 */
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
      advice.push(`${item.name} prices are rising (+${priceChange.toFixed(1)}%). Good time to sell if you have stock.`);
      confidence += 30;
    } else if (priceChange < -10) {
      advice.push(`${item.name} prices are falling (${priceChange.toFixed(1)}%). Consider holding stock or diversifying.`);
      confidence += 25;
    } else {
      advice.push(`${item.name} prices are stable. Market conditions are normal.`);
      confidence += 20;
    }

    // Price volatility check
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = prices.some(p => Math.abs(p - avgPrice) / avgPrice > 0.15);
    
    if (volatility) {
      advice.push('High price volatility detected. Monitor market closely.');
      confidence += 15;
    }
  }

  // Weather-based advice
  if (weatherData) {
    if (weatherData.rain) {
      if (['vegetable', 'fruit'].includes(item.category)) {
        advice.push('Rain forecasted. Ensure proper drainage and protect crops from excess moisture.');
        confidence += 20;
      }
    } else {
      if (item.category === 'vegetable') {
        advice.push('Dry weather. Ensure adequate irrigation for vegetables.');
        confidence += 15;
      }
    }

    if (weatherData.temperature > 35) {
      advice.push('High temperature alert. Provide shade and increase watering frequency.');
      confidence += 20;
    } else if (weatherData.temperature < 10) {
      advice.push('Low temperature warning. Protect sensitive crops from cold.');
      confidence += 20;
    }
  }

  // Seasonal advice (simplified)
  const month = new Date().getMonth();
  if (item.category === 'vegetable' && (month >= 2 && month <= 4)) {
    advice.push('Spring season: Good time for planting leafy vegetables.');
    confidence += 10;
  }

  return {
    advice: advice.length > 0 ? advice : ['No specific recommendations at this time. Monitor prices and weather regularly.'],
    confidence: Math.min(confidence, 95) // Cap at 95%
  };
};

/**
 * Enhanced advice using OpenAI GPT (optional)
 * Falls back to rule-based if API key not configured
 */
const generateAIAdvice = async (item, priceData, weatherData) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null; // Fall back to rule-based
  }

  try {
    // Prepare context for AI
    const priceContext = priceData.length > 0
      ? `Recent prices: ${priceData.map(p => `${p.date.toLocaleDateString()}: $${p.price}`).join(', ')}`
      : 'No recent price data available';

    const weatherContext = weatherData
      ? `Weather: ${weatherData.temperature}°C, ${weatherData.condition}, Humidity: ${weatherData.humidity}%`
      : 'No weather data available';

    const prompt = `You are an agricultural advisor. Based on the following data for ${item.name} (${item.category}):

${priceContext}
${weatherContext}

Provide 2-3 short, actionable farming recommendations. Keep each point under 20 words. Be specific and practical.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiAdvice = response.data.choices[0].message.content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '').trim());

    return {
      advice: aiAdvice,
      confidence: 85,
      source: 'AI'
    };
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return null; // Fall back to rule-based
  }
};

/**
 * @route   GET /api/advice
 * @desc    Get farming advice based on item prices and weather
 * @access  Public
 * @query   itemId (required), city, region
 */
exports.getAdvice = async (req, res, next) => {
  try {
    const { itemId, city, region } = req.query;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'itemId parameter is required'
      });
    }

    // Get item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Item not found'
      });
    }

    // Get recent price data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let priceData = [];
    if (region) {
      priceData = await PricePoint.find({
        item: itemId,
        region: region,
        date: { $gte: sevenDaysAgo }
      }).sort({ date: 1 });
    }

    // Get weather data
    let weatherData = null;
    if (city) {
      try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (apiKey) {
          const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
              params: {
                q: city,
                appid: apiKey,
                units: 'metric'
              }
            }
          );
          weatherData = {
            temperature: weatherResponse.data.main.temp,
            condition: weatherResponse.data.weather[0].main,
            humidity: weatherResponse.data.main.humidity,
            rain: weatherResponse.data.weather[0].main.toLowerCase().includes('rain')
          };
        }
      } catch (error) {
        console.error('Weather fetch error:', error.message);
      }
    }

    // Try AI advice first, fall back to rule-based
    let adviceResult = await generateAIAdvice(item, priceData, weatherData);
    
    if (!adviceResult) {
      adviceResult = generateRuleBasedAdvice(item, priceData, weatherData);
      adviceResult.source = 'rule-based';
    }

    res.json({
      success: true,
      data: {
        item: {
          id: item._id,
          name: item.name,
          category: item.category
        },
        advice: adviceResult.advice,
        confidence: adviceResult.confidence,
        source: adviceResult.source,
        priceDataPoints: priceData.length,
        weatherIncluded: !!weatherData
      },
      message: 'Advice generated successfully'
    });
  } catch (error) {
    next(error);
  }
};
