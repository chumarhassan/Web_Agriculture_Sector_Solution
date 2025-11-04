# 🌾 Smart Agriculture Market Tracker

A comprehensive MERN stack application for tracking agricultural market prices with JWT authentication, role-based access control, weather integration, and AI-powered farming advice.

## 📋 Features

### Core Features
- **JWT Authentication** - Secure login/register with admin and farmer roles
- **Price Tracking** - Historical price data across multiple regions
- **Weather Integration** - Real-time weather via OpenWeatherMap API
- **AI Advice Engine** - Rule-based and GPT-powered farming recommendations
- **Forum System** - Community discussion with posts and comments
- **Admin Dashboard** - Item management and bulk CSV price uploads
- **Interactive Charts** - 7-day price trends with Chart.js
- **Dark Mode** - Beautiful dark theme with Tailwind CSS
- **Responsive Design** - Mobile-first approach that works on all devices

### User Roles
- **Admin** - Manage items, upload prices, view statistics
- **Farmer** - Track prices, get advice, participate in forum

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Axios for external API calls

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- React Hook Form
- Chart.js + react-chartjs-2
- PapaParse for CSV parsing
- Lucide React for icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Web_Hackathon
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env with your MongoDB URI and secrets

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Login

Use these credentials after seeding:

**Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Farmer:**
- Email: `farmer1@example.com`
- Password: `farmer123`

## 📁 Project Structure

```
Web_Hackathon/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & error handling
│   ├── scripts/          # Database seed script
│   ├── server.js         # Entry point
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── utils/        # API utilities
│   │   └── App.jsx
│   └── README.md
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-agriculture
JWT_SECRET=your-super-secret-jwt-key
OPENWEATHER_API_KEY=your-api-key  # Optional
OPENAI_API_KEY=your-api-key       # Optional
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Items (Public)
- `GET /api/items` - List all items (with filters)
- `GET /api/items/:id` - Get item details
- `GET /api/items/:id/prices` - Get price history

### Admin (Protected)
- `POST /api/admin/items` - Create item
- `PUT /api/admin/items/:id` - Update item
- `DELETE /api/admin/items/:id` - Delete item
- `POST /api/admin/prices/bulk` - Bulk upload prices
- `GET /api/admin/stats` - Get statistics

### Weather
- `GET /api/weather?city=Lahore` - Get weather data

### Advice
- `GET /api/advice?itemId=xxx&city=Lahore&region=Lahore` - Get farming advice

### Forum
- `GET /api/posts` - List posts
- `GET /api/posts/:id` - Get post with comments
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:postId/comments/:commentId` - Delete comment

See backend README for detailed API documentation and Postman collection.

## 🎨 Design System

### Colors
- Background: `#0F172A`
- Surface: `#0B1220`
- Primary: `#60A5FA`
- Success: `#34D399`
- Text: `#E6EEF8`
- Muted: `#9CA3AF`

### Components
- Reusable Button, Card, Table, Modal components
- Consistent spacing and shadows
- Hover animations with scale transforms

## 📊 Sample Data

After running `npm run seed` in backend:
- 1 Admin user
- 3 Farmer users
- 6 Agricultural items (Tomato, Potato, Onion, Carrot, Apple, Banana)
- 126 Price points (7 days × 6 items × 3 regions)
- 3 Forum posts with comments

## 🧪 Testing

### Backend
```bash
cd backend
# Use Postman collection provided in README
```

### Frontend
```bash
cd frontend
npm run lint  # Check code quality
```

## 📦 Deployment

### Backend (Railway/Render)
1. Create new project
2. Connect GitHub repo
3. Set environment variables
4. Deploy from main branch

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set `VITE_API_URL` environment variable
3. Deploy automatically on push

### Database (MongoDB Atlas)
1. Create free cluster
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in backend .env

## 🔌 API Keys Setup

### OpenWeatherMap (Optional)
1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Add to backend `.env`: `OPENWEATHER_API_KEY=your_key`
4. Without this, app returns mock weather data

### OpenAI (Optional)
1. Sign up at https://platform.openai.com/
2. Get API key
3. Add to backend `.env`: `OPENAI_API_KEY=your_key`
4. Without this, app uses rule-based advice

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB connection
- Verify all dependencies installed
- Check port 5000 is available

**Frontend can't connect to backend:**
- Ensure backend is running
- Check proxy configuration in vite.config.js
- Verify CORS settings in backend

**Seed script fails:**
- Drop existing database: `mongosh smart-agriculture --eval "db.dropDatabase()"`
- Re-run: `npm run seed`

## 📝 Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start with nodemon
- `npm run seed` - Seed database

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- OpenWeatherMap for weather API
- OpenAI for GPT API
- Tailwind CSS for styling framework
- Chart.js for data visualization

## 📧 Support

For issues or questions, please open a GitHub issue or contact the maintainers.

---

**Built with ❤️ for the agriculture community**
