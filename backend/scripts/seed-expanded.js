const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const User = require('../models/User.model');
const Item = require('../models/Item.model');
const PricePoint = require('../models/PricePoint.model');
const Post = require('../models/Post.model');
const Comment = require('../models/Comment.model');

// Load environment variables
dotenv.config();

/**
 * EXPANDED SEED DATA FOR PRODUCTION-READY APP
 * Run with: npm run seed
 */

const regions = ['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Hyderabad'];

const items = [
  // Vegetables
  { name: 'Tomato', category: 'vegetable', unit: 'kg', description: 'Fresh red tomatoes' },
  { name: 'Potato', category: 'vegetable', unit: 'kg', description: 'High quality potatoes' },
  { name: 'Onion', category: 'vegetable', unit: 'kg', description: 'Fresh onions' },
  { name: 'Carrot', category: 'vegetable', unit: 'kg', description: 'Organic carrots' },
  { name: 'Cauliflower', category: 'vegetable', unit: 'kg', description: 'Fresh cauliflower' },
  { name: 'Cabbage', category: 'vegetable', unit: 'kg', description: 'Green cabbage' },
  { name: 'Spinach', category: 'vegetable', unit: 'kg', description: 'Fresh spinach leaves' },
  { name: 'Cucumber', category: 'vegetable', unit: 'kg', description: 'Fresh cucumber' },
  
  // Fruits
  { name: 'Apple', category: 'fruit', unit: 'kg', description: 'Crisp red apples' },
  { name: 'Banana', category: 'fruit', unit: 'dozen', description: 'Ripe yellow bananas' },
  { name: 'Mango', category: 'fruit', unit: 'kg', description: 'Sweet mangoes' },
  { name: 'Orange', category: 'fruit', unit: 'kg', description: 'Juicy oranges' },
  { name: 'Grapes', category: 'fruit', unit: 'kg', description: 'Fresh grapes' },
  
  // Grains
  { name: 'Wheat', category: 'grain', unit: 'kg', description: 'High quality wheat' },
  { name: 'Rice', category: 'grain', unit: 'kg', description: 'Basmati rice' },
  
  // Dairy
  { name: 'Milk', category: 'dairy', unit: 'liter', description: 'Fresh milk' },
  { name: 'Yogurt', category: 'dairy', unit: 'kg', description: 'Fresh yogurt' },
  
  // Livestock
  { name: 'Chicken', category: 'livestock', unit: 'kg', description: 'Fresh chicken' },
  { name: 'Beef', category: 'livestock', unit: 'kg', description: 'Quality beef' },
  { name: 'Mutton', category: 'livestock', unit: 'kg', description: 'Fresh mutton' },
];

/**
 * Generate realistic price series with seasonal trends
 */
const generatePriceSeries = (basePrice, days = 30) => {
  const prices = [];
  let currentPrice = basePrice;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Add random daily variation (-5% to +8%)
    const dailyVariation = (Math.random() - 0.4) * 0.13;
    currentPrice = basePrice * (1 + dailyVariation);

    // Add weekly cycle (lower on Sundays, higher on Fridays)
    const dayOfWeek = date.getDay();
    const weeklyFactor = dayOfWeek === 0 ? 0.95 : dayOfWeek === 5 ? 1.08 : 1.0;
    currentPrice = currentPrice * weeklyFactor;

    // Add gentle trend over time
    const trend = ((days - i) / days) * 0.15 * (Math.random() > 0.5 ? 1 : -1);
    currentPrice = currentPrice * (1 + trend);

    prices.push({
      date,
      price: Math.round(currentPrice * 100) / 100
    });
  }

  return prices;
};

/**
 * Base prices for all items across regions
 */
const basePrices = {
  'Tomato': { 'Lahore': 45, 'Karachi': 50, 'Islamabad': 48, 'Peshawar': 42, 'Quetta': 55, 'Multan': 43, 'Faisalabad': 44, 'Hyderabad': 51 },
  'Potato': { 'Lahore': 35, 'Karachi': 38, 'Islamabad': 37, 'Peshawar': 33, 'Quetta': 40, 'Multan': 34, 'Faisalabad': 35, 'Hyderabad': 39 },
  'Onion': { 'Lahore': 40, 'Karachi': 45, 'Islamabad': 43, 'Peshawar': 38, 'Quetta': 48, 'Multan': 39, 'Faisalabad': 41, 'Hyderabad': 46 },
  'Carrot': { 'Lahore': 55, 'Karachi': 60, 'Islamabad': 58, 'Peshawar': 52, 'Quetta': 65, 'Multan': 53, 'Faisalabad': 54, 'Hyderabad': 61 },
  'Cauliflower': { 'Lahore': 50, 'Karachi': 55, 'Islamabad': 52, 'Peshawar': 48, 'Quetta': 58, 'Multan': 49, 'Faisalabad': 51, 'Hyderabad': 56 },
  'Cabbage': { 'Lahore': 30, 'Karachi': 35, 'Islamabad': 32, 'Peshawar': 28, 'Quetta': 38, 'Multan': 29, 'Faisalabad': 31, 'Hyderabad': 36 },
  'Spinach': { 'Lahore': 25, 'Karachi': 28, 'Islamabad': 27, 'Peshawar': 23, 'Quetta': 30, 'Multan': 24, 'Faisalabad': 26, 'Hyderabad': 29 },
  'Cucumber': { 'Lahore': 35, 'Karachi': 40, 'Islamabad': 38, 'Peshawar': 33, 'Quetta': 43, 'Multan': 34, 'Faisalabad': 36, 'Hyderabad': 41 },
  'Apple': { 'Lahore': 150, 'Karachi': 160, 'Islamabad': 155, 'Peshawar': 145, 'Quetta': 165, 'Multan': 148, 'Faisalabad': 152, 'Hyderabad': 162 },
  'Banana': { 'Lahore': 80, 'Karachi': 85, 'Islamabad': 82, 'Peshawar': 75, 'Quetta': 90, 'Multan': 78, 'Faisalabad': 81, 'Hyderabad': 87 },
  'Mango': { 'Lahore': 120, 'Karachi': 130, 'Islamabad': 125, 'Peshawar': 115, 'Quetta': 140, 'Multan': 118, 'Faisalabad': 122, 'Hyderabad': 132 },
  'Orange': { 'Lahore': 100, 'Karachi': 110, 'Islamabad': 105, 'Peshawar': 95, 'Quetta': 115, 'Multan': 98, 'Faisalabad': 102, 'Hyderabad': 112 },
  'Grapes': { 'Lahore': 180, 'Karachi': 195, 'Islamabad': 188, 'Peshawar': 175, 'Quetta': 200, 'Multan': 178, 'Faisalabad': 182, 'Hyderabad': 197 },
  'Wheat': { 'Lahore': 50, 'Karachi': 55, 'Islamabad': 52, 'Peshawar': 48, 'Quetta': 58, 'Multan': 49, 'Faisalabad': 51, 'Hyderabad': 56 },
  'Rice': { 'Lahore': 120, 'Karachi': 130, 'Islamabad': 125, 'Peshawar': 115, 'Quetta': 135, 'Multan': 118, 'Faisalabad': 122, 'Hyderabad': 132 },
  'Milk': { 'Lahore': 150, 'Karachi': 160, 'Islamabad': 155, 'Peshawar': 145, 'Quetta': 170, 'Multan': 148, 'Faisalabad': 152, 'Hyderabad': 162 },
  'Yogurt': { 'Lahore': 180, 'Karachi': 195, 'Islamabad': 188, 'Peshawar': 175, 'Quetta': 200, 'Multan': 178, 'Faisalabad': 182, 'Hyderabad': 197 },
  'Chicken': { 'Lahore': 320, 'Karachi': 350, 'Islamabad': 335, 'Peshawar': 310, 'Quetta': 360, 'Multan': 318, 'Faisalabad': 325, 'Hyderabad': 355 },
  'Beef': { 'Lahore': 700, 'Karachi': 750, 'Islamabad': 725, 'Peshawar': 680, 'Quetta': 770, 'Multan': 695, 'Faisalabad': 710, 'Hyderabad': 760 },
  'Mutton': { 'Lahore': 950, 'Karachi': 1000, 'Islamabad': 975, 'Peshawar': 920, 'Quetta': 1050, 'Multan': 940, 'Faisalabad': 960, 'Hyderabad': 1010 },
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting EXPANDED database seed...');

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
      passwordHash: 'admin123',
      role: 'admin',
      region: 'Lahore'
    });
    await admin.save();
    console.log('✓ Admin user created');

    // Create 10 farmer users
    console.log('👥 Creating 10 farmer users...');
    const farmers = [];
    const farmerNames = [
      'احمد علی', 'محمد حسن', 'علی رضا', 'فاطمہ زہرا', 'عائشہ خان',
      'یاسر حسین', 'بلال احمد', 'صادقہ پروین', 'حمزہ فاروق', 'زینب بیگم'
    ];

    for (let i = 0; i < 10; i++) {
      const farmer = new User({
        name: farmerNames[i],
        email: `farmer${i + 1}@example.com`,
        passwordHash: `farmer${i + 1}23`,
        role: 'farmer',
        region: regions[i % regions.length]
      });
      await farmer.save();
      farmers.push(farmer);
    }
    console.log(`✓ Created 10 farmer users`);

    // Create items
    console.log('📦 Creating items...');
    const createdItems = [];
    for (const itemData of items) {
      const item = new Item({
        ...itemData,
        slug: slugify(itemData.name, { lower: true })
      });
      await item.save();
      createdItems.push(item);
    }
    console.log(`✓ Created ${items.length} items`);

    // Create price history (30 days for each item in each region)
    console.log('💰 Creating comprehensive price history...');
    let priceCount = 0;

    for (const item of createdItems) {
      for (const region of regions) {
        if (basePrices[item.name] && basePrices[item.name][region]) {
          const basePrice = basePrices[item.name][region];
          const priceSeries = generatePriceSeries(basePrice, 30);

          for (const priceData of priceSeries) {
            const pricePoint = new PricePoint({
              item: item._id,
              region: region,
              price: priceData.price,
              date: priceData.date,
              source: 'system'
            });
            await pricePoint.save();
            priceCount++;
          }
        }
      }
    }
    console.log(`✓ Created ${priceCount} price points (30 days × ${items.length} items × ${regions.length} regions)`);

    // Create 20 forum posts with Urdu and English content
    console.log('📝 Creating 20 forum posts...');
    const postTitles = [
      { title: 'ٹماٹر کی کاشت کا بہترین وقت', content: 'میں جاننا چاہتا ہوں کہ ٹماٹر کی کاشت کا بہترین وقت کیا ہے؟ اور کون سی قسم کی زمین موزوں ہے؟', category: 'question' },
      { title: 'What is the best time to plant tomatoes?', content: 'I want to know when is the best season for planting tomatoes and what type of soil is suitable?', category: 'question' },
      { title: 'لاہور میں آلو کی قیمت میں اضافہ', content: 'آج کل لاہور میں آلو کی قیمت بہت زیادہ ہو گئی ہے۔ کیا کسی کو معلوم ہے کہ یہ کب نارمل ہوگی؟', category: 'news' },
      { title: 'Onion prices dropping in Karachi', content: 'Good news! Onion prices have started to decrease in Karachi market. Good time to sell if you have stock.', category: 'news' },
      { title: 'آرگینک کھاد کے فوائد', content: 'میں نے آرگینک کھاد استعمال کی ہے اور نتائج بہت اچھے ہیں۔ فصل کی کوالٹی بھی بہتر ہے۔', category: 'advice' },
      { title: 'How to protect crops from pests', content: 'I have been using natural pest control methods and they are working great. Happy to share my experience.', category: 'advice' },
      { title: 'موسم کی تبدیلی کا فصل پر اثر', content: 'اس سال موسم کی تبدیلی سے فصل پر کیا اثر پڑا ہے؟ آپ کے علاقے میں کیا صورتحال ہے؟', category: 'discussion' },
      { title: 'New irrigation techniques discussion', content: 'Let s discuss modern irrigation methods that can save water and improve crop yield.', category: 'discussion' },
      { title: 'سیب کی باغبانی کے تجربات', content: 'میں نے سیب کی باغبانی شروع کی ہے۔ کوئی تجربہ کار کسان مشورہ دے سکتا ہے؟', category: 'question' },
      { title: 'Mango season profits', content: 'This mango season was very profitable for us. Would love to hear about your experiences.', category: 'discussion' },
      { title: 'پشاور میں گندم کی قیمت', content: 'پشاور میں گندم کی قیمت میں استحکام ہے۔ اچھا وقت ہے فروخت کے لیے۔', category: 'news' },
      { title: 'Rice farming challenges', content: 'What are the main challenges you face in rice farming? Let s discuss solutions together.', category: 'question' },
      { title: 'کھاد کی کونسی قسم بہتر ہے؟', content: 'کیمیکل کھاد اور آرگینک کھاد میں کیا فرق ہے؟ کون سی زیادہ فائدہ مند ہے؟', category: 'question' },
      { title: 'Government subsidy programs', content: 'Are there any new government subsidy programs for farmers? Please share information.', category: 'discussion' },
      { title: 'دودھ کی ڈیری فارمنگ', content: 'میں ڈیری فارم شروع کرنا چاہتا ہوں۔ کیا یہ منافع بخش ہے؟', category: 'question' },
      { title: 'Chicken farming tips', content: 'I have been doing poultry farming for 5 years. Happy to answer any questions.', category: 'advice' },
      { title: 'کراچی میں سبزیوں کی قیمتیں', content: 'کراچی میں سبزیوں کی قیمتیں اچھی ہیں۔ خاص طور پر ٹماٹر اور پیاز۔', category: 'news' },
      { title: 'Weather forecast for next week', content: 'According to forecasts, heavy rain expected. Take precautions for your crops.', category: 'advice' },
      { title: 'زمین کی تیاری کیسے کریں؟', content: 'نئی فصل کے لیے زمین کی تیاری کا صحیح طریقہ کیا ہے؟', category: 'question' },
      { title: 'Export opportunities for farmers', content: 'Let s discuss export opportunities and how we can access international markets.', category: 'discussion' },
    ];

    const createdPosts = [];
    for (let i = 0; i < postTitles.length; i++) {
      const postData = postTitles[i];
      const author = farmers[i % farmers.length];
      
      const post = new Post({
        title: postData.title,
        content: postData.content,
        author: author._id,
        category: postData.category,
      });
      await post.save();
      createdPosts.push(post);
    }
    console.log(`✓ Created 20 forum posts`);

    // Add comments to posts
    console.log('💬 Adding comments to posts...');
    const comments = [
      'بہت اچھی معلومات، شکریہ!',
      'Very helpful, thanks for sharing!',
      'میں بھی یہی سوچ رہا تھا',
      'I agree with this approach',
      'کیا آپ مزید تفصیل دے سکتے ہیں؟',
      'Can you provide more details please?',
      'یہ بہت کارآمد ہے',
      'This is very useful information',
    ];

    let commentCount = 0;
    for (const post of createdPosts) {
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments per post
      for (let i = 0; i < numComments; i++) {
        const commenter = farmers[Math.floor(Math.random() * farmers.length)];
        const comment = new Comment({
          content: comments[Math.floor(Math.random() * comments.length)],
          author: commenter._id,
          post: post._id,
        });
        await comment.save();
        commentCount++;
      }
    }
    console.log(`✓ Added ${commentCount} comments to posts`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 11 (1 admin + 10 farmers)`);
    console.log(`   - Items: ${items.length}`);
    console.log(`   - Price Points: ${priceCount}`);
    console.log(`   - Forum Posts: 20`);
    console.log(`   - Comments: ${commentCount}`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Admin: admin@example.com / admin123`);
    console.log(`   Farmers: farmer1@example.com / farmer123 (farmer1-10)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
