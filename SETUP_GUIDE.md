# 🚀 Quick Setup Guide

## ✅ What's Been Created

Your complete MERN stack project is ready! Here's what you have:

### Backend (Node.js + Express + MongoDB)
- ✅ JWT authentication with admin/farmer roles
- ✅ 5 Mongoose models (User, Item, PricePoint, Post, Comment)
- ✅ RESTful API with 7 route groups
- ✅ Weather proxy (OpenWeatherMap)
- ✅ AI advice engine (rule-based + optional GPT)
- ✅ Forum system with CRUD operations
- ✅ Admin panel with statistics
- ✅ CSV bulk upload support
- ✅ Seed script with sample data
- ✅ Comprehensive error handling

### Frontend (React + Vite + Tailwind CSS)
- ✅ Modern React 18 with hooks
- ✅ Beautiful dark mode UI
- ✅ Authentication pages (Login/Register)
- ✅ Farmer Dashboard with search/filters
- ✅ Admin Dashboard with item management
- ✅ Interactive price charts (Chart.js)
- ✅ Weather widget
- ✅ AI advice display
- ✅ Forum with posts and comments
- ✅ Fully responsive design
- ✅ Reusable component library

## 🎯 Next Steps

### 1. Start MongoDB

**Option A: Local MongoDB**
```powershell
# If MongoDB is installed locally, start it:
mongod

# Or as Windows service:
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster
4. Get connection string
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-agriculture
   ```

### 2. Seed Database

```powershell
cd backend
npm run seed
```

You should see:
```
✅ Database seeded successfully!
📊 Summary:
   • Users: 1 admin + 3 farmers
   • Items: 6 agricultural products
   • Price Points: 126 data points
   • Posts: 3 forum posts
   • Comments: 3 comments
```

### 3. Start Backend Server

```powershell
# In backend directory
npm run dev
```

Server starts on http://localhost:5000

### 4. Start Frontend

**Open a NEW terminal:**
```powershell
cd frontend
npm run dev
```

Frontend starts on http://localhost:3000

### 5. Login & Explore!

Open browser to http://localhost:3000

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Farmer Account:**
- Email: `farmer1@example.com`
- Password: `farmer123`

## 🔍 Testing Features

### As Farmer:
1. **Dashboard** - View items and prices for your region
2. **Search** - Filter items by name, category
3. **Item Detail** - Click any item to see:
   - 7-day price chart
   - Weather data
   - Farming advice
4. **Forum** - Create posts, add comments

### As Admin:
1. **Admin Panel** - Access at `/admin`
2. **Add Items** - Create new agricultural products
3. **Upload Prices** - Use CSV upload feature
4. **View Stats** - See system statistics

## 📊 CSV Upload Format

Create a CSV file with this format:

```csv
itemName,region,date,price
Tomato,Lahore,2025-11-04,45.50
Potato,Karachi,2025-11-04,38.00
Onion,Peshawar,2025-11-03,40.00
```

Upload via Admin Dashboard → "Upload Prices (CSV)" button

## 🔑 Optional API Keys

### Weather (OpenWeatherMap)
1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Add to `backend/.env`:
   ```
   OPENWEATHER_API_KEY=your_key_here
   ```
4. Without this: App shows mock weather data

### AI Advice (OpenAI)
1. Sign up at https://platform.openai.com/
2. Get API key
3. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Without this: App uses rule-based advice

## 📁 File Locations

```
Web_Hackathon/
├── backend/
│   ├── .env                    ← Configuration here
│   ├── server.js               ← Entry point
│   ├── controllers/            ← Business logic
│   ├── models/                 ← Database schemas
│   ├── routes/                 ← API endpoints
│   └── scripts/seed.js         ← Sample data
│
├── frontend/
│   ├── src/
│   │   ├── pages/              ← Main pages
│   │   ├── components/         ← Reusable components
│   │   ├── contexts/           ← State management
│   │   └── utils/api.js        ← API calls
│   └── vite.config.js          ← Build config
│
└── README.md                   ← Main documentation
```

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check MongoDB is running
mongosh

# If connection fails, verify MONGODB_URI in .env
```

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check `vite.config.js` proxy configuration
- Try http://localhost:5000/api/health in browser

### Seed script fails
```powershell
# Drop database and re-seed
mongosh smart-agriculture --eval "db.dropDatabase()"
npm run seed
```

### Port already in use
```powershell
# Change PORT in backend/.env to different number
PORT=5001

# Or kill process using port
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

## 📚 Documentation

- **Main README**: `./README.md`
- **Backend README**: `./backend/README.md` (API docs, Postman collection)
- **Frontend README**: `./frontend/README.md` (Components, deployment)

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: '#60A5FA',  // Change to your brand color
  // ... other colors
}
```

### Add New Routes
1. Backend: Create controller in `controllers/`, add route in `routes/`
2. Frontend: Add page in `src/pages/`, add route in `App.jsx`

### Modify Seed Data
Edit `backend/scripts/seed.js` to change:
- Items
- Regions
- Price ranges
- Sample posts

## 🚀 Deployment

### Backend → Railway/Render
1. Push to GitHub
2. Connect repo to hosting platform
3. Set environment variables
4. Deploy

### Frontend → Vercel
1. Push to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` to backend URL
4. Deploy

### Database → MongoDB Atlas
Already supports remote connections!

## ✨ Features to Explore

1. **Price Trends** - See how prices change over time
2. **Weather Integration** - Get real-time weather for farming
3. **AI Advice** - Intelligent recommendations based on data
4. **Community Forum** - Connect with other farmers
5. **Admin Tools** - Manage data efficiently
6. **CSV Import** - Bulk upload price data
7. **Dark Mode** - Beautiful, easy on eyes
8. **Mobile Responsive** - Works on all devices

## 🎓 Learning Resources

- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Express.js**: https://expressjs.com/
- **MongoDB**: https://www.mongodb.com/docs/
- **Chart.js**: https://www.chartjs.org/

## 💡 Ideas for Extension

- Add email notifications
- Implement push notifications
- Add more chart types (bar, pie)
- Create mobile app with React Native
- Add export to PDF feature
- Implement WebSocket for real-time updates
- Add user profiles with avatars
- Create API rate limiting
- Add caching with Redis
- Implement pagination for large datasets

## 🙌 You're All Set!

Your complete MERN stack Smart Agriculture Market Tracker is ready to use!

**Start both servers and visit http://localhost:3000 to begin! 🎉**
