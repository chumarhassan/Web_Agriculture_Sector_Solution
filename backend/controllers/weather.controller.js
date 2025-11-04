const axios = require('axios');

/**
 * @route   GET /api/weather
 * @desc    Proxy for OpenWeatherMap API
 * @access  Public
 * @query   city (required)
 */
exports.getWeather = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'City parameter is required'
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      // Return mock data if API key is not configured
      return res.json({
        success: true,
        data: {
          city,
          temperature: 25,
          condition: 'Clear',
          humidity: 60,
          description: 'Clear sky',
          rain: false,
          mock: true
        },
        message: 'Mock weather data (configure OPENWEATHER_API_KEY for real data)'
      });
    }

    // Call OpenWeatherMap API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric'
        }
      }
    );

    const weatherData = {
      city: response.data.name,
      temperature: response.data.main.temp,
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      rain: response.data.weather[0].main.toLowerCase().includes('rain'),
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon
    };

    res.json({
      success: true,
      data: weatherData,
      message: 'Weather data retrieved successfully'
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'City not found'
      });
    }
    
    if (error.response && error.response.status === 401) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Invalid weather API key'
      });
    }

    next(error);
  }
};
