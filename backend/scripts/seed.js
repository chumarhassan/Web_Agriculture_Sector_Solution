const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify'); // ✅ Fixed import style
const User = require('../models/User.model');
const Item = require('../models/Item.model');
const PricePoint = require('../models/PricePoint.model');
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');

// Load environment variables
dotenv.config();

/**
 * Seed script to populate database with initial data
 * Run with: npm run seed
 */

const regions = ['Lahore', 'Karachi', 'Peshawar'];

const items = [
  { name: 'Tomato', category: 'vegetable', unit: 'kg', description: 'Fresh red tomatoes' },
  { name: 'Potato', category: 'vegetable', unit: 'kg', description: 'High quality potatoes' },
  { name: 'Onion', category: 'vegetable', unit: 'kg', description: 'Fresh onions' },
  { name: 'Carrot', category: 'vegetable', unit: 'kg', description: 'Organic carrots' },
  { name: 'Apple', category: 'fruit', unit: 'kg', description: 'Crisp red apples' },
  { name: 'Banana', category: 'fruit', unit: 'dozen', description: 'Ripe yellow bananas' }
];

/**
 * Generate simulated 7-day price series with realistic variations
 */
const generatePriceSeries = (basePrice, days = 7) => {
  const prices = [];
  let currentPrice = basePrice;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Add random variation (-10% to +10%)
    const variation = (Math.random() - 0.5) * 0.2;
    currentPrice = basePrice * (1 + variation);

    // Add slight trend
    const trend = (days - i) * 0.02;
    currentPrice = currentPrice * (1 + trend);

    prices.push({
      date,
      price: Math.round(currentPrice * 100) / 100 // Round to 2 decimals
    });
  }

  return prices;
};

/**
 * Base prices for each item across regions
 */
const basePrices = {
  'Tomato': { 'Lahore': 45, 'Karachi': 50, 'Peshawar': 42 },
  'Potato': { 'Lahore': 35, 'Karachi': 38, 'Peshawar': 33 },
  'Onion': { 'Lahore': 40, 'Karachi': 45, 'Peshawar': 38 },
  'Carrot': { 'Lahore': 55, 'Karachi': 60, 'Peshawar': 52 },
  'Apple': { 'Lahore': 150, 'Karachi': 160, 'Peshawar': 145 },
  'Banana': { 'Lahore': 80, 'Karachi': 85, 'Peshawar': 75 }
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-agriculture');
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await PricePoint.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('✓ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      region: 'Lahore'
    });
    await admin.save();
    console.log('✓ Admin user created (email: admin@example.com, password: admin123)');

    // Create sample farmer users
    console.log('👥 Creating farmer users...');
    const farmers = [];
    for (let i = 0; i < 3; i++) {
      const farmer = new User({
        name: `Farmer ${i + 1}`,
        email: `farmer${i + 1}@example.com`,
        passwordHash: 'farmer123',
        role: 'farmer',
        region: regions[i]
      });
      await farmer.save();
      farmers.push(farmer);
    }
    console.log(`✓ Created ${farmers.length} farmer users`);

    // Create items (with slug)
    console.log('📦 Creating items...');
    const createdItems = [];
    for (const itemData of items) {
      const item = new Item({
        ...itemData,
        slug: slugify(itemData.name, { lower: true }) // ✅ Added slug
      });
      await item.save();
      createdItems.push(item);
      console.log(`  ✓ Created item: ${item.name}`);
    }

    // Generate price points
    console.log('💰 Generating price data...');
    let priceCount = 0;

    for (const item of createdItems) {
      for (const region of regions) {
        const basePrice = basePrices[item.name][region];
        const priceSeries = generatePriceSeries(basePrice, 7);

        for (const priceData of priceSeries) {
          const pricePoint = new PricePoint({
            item: item._id,
            region: region,
            date: priceData.date,
            price: priceData.price
          });
          await pricePoint.save();
          priceCount++;
        }
      }
    }
    console.log(`✓ Created ${priceCount} price points (7 days × ${createdItems.length} items × ${regions.length} regions)`);

    // Create sample forum posts
    console.log('📝 Creating forum posts...');
    const samplePosts = [
      {
        title: 'Best time to plant tomatoes in Lahore?',
        content: 'I am planning to start tomato cultivation. What is the best season to plant tomatoes in Lahore region? Any advice would be appreciated.',
        category: 'question',
        tags: ['tomato', 'planting', 'season'],
        author: farmers[0]._id,
        region: 'Lahore'
      },
      {
        title: 'Potato prices rising - time to sell?',
        content: 'I have noticed potato prices have been increasing over the past week. Should I sell my stock now or wait for prices to go higher?',
        category: 'discussion',
        tags: ['potato', 'prices', 'market'],
        author: farmers[1]._id,
        region: 'Karachi'
      },
      {
        title: 'Organic farming techniques for vegetables',
        content: 'I want to shift to organic farming for my vegetable crops. Can experienced farmers share their organic farming techniques and challenges?',
        category: 'advice',
        tags: ['organic', 'vegetables', 'techniques'],
        author: farmers[2]._id,
        region: 'Peshawar'
      }
    ];

    const createdPosts = [];
    for (const postData of samplePosts) {
      const post = new Post(postData);
      await post.save();
      createdPosts.push(post);
    }
    console.log(`✓ Created ${createdPosts.length} forum posts`);

    // Create sample comments
    console.log('💬 Creating comments...');
    const sampleComments = [
      {
        post: createdPosts[0]._id,
        content: 'Best time is February to March for spring season. Make sure soil is well-drained.',
        author: farmers[1]._id
      },
      {
        post: createdPosts[0]._id,
        content: 'I planted in early March last year and got excellent yield. Good luck!',
        author: farmers[2]._id
      },
      {
        post: createdPosts[1]._id,
        content: 'Check the 7-day trend. If prices are stable or rising, it might be good to hold for a few more days.',
        author: farmers[0]._id
      }
    ];

    for (const commentData of sampleComments) {
      const comment = new Comment(commentData);
      await comment.save();
    }
    console.log(`✓ Created ${sampleComments.length} comments`);

    // Summary
    console.log('\n✅ Database seeded successfully!');
    console.log('═══════════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`   • Users: 1 admin + ${farmers.length} farmers`);
    console.log(`   • Items: ${createdItems.length} agricultural products`);
    console.log(`   • Price Points: ${priceCount} data points`);
    console.log(`   • Posts: ${createdPosts.length} forum posts`);
    console.log(`   • Comments: ${sampleComments.length} comments`);
    console.log('═══════════════════════════════════════');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@example.com');
    console.log('     Password: admin123');
    console.log('   Farmers:');
    for (let i = 0; i < farmers.length; i++) {
      console.log(`     Email: farmer${i + 1}@example.com, Password: farmer123`);
    }
    console.log('\n🚀 You can now start the server with: npm start or npm run dev');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

// Run seed
seedDatabase();
