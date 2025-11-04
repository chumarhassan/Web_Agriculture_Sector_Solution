# Smart Agriculture Market Tracker - Backend

Backend API for the Smart Agriculture Market Tracker application. Built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: JWT-based authentication with admin and farmer roles
- **Item Management**: CRUD operations for agricultural products
- **Price Tracking**: Historical price data across multiple regions
- **Weather Integration**: OpenWeatherMap API proxy for weather data
- **AI-Powered Advice**: Rule-based and optional GPT-powered farming advice
- **Forum System**: Posts and comments for farmer community
- **Admin Dashboard**: Statistics and bulk price upload

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **APIs**: OpenWeatherMap, OpenAI (optional)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/smart-agriculture
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   OPENWEATHER_API_KEY=your-openweather-api-key  # Optional
   OPENAI_API_KEY=your-openai-api-key            # Optional
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000`

## Default Credentials

After running the seed script, you can login with:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

**Farmer Users:**
- Email: `farmer1@example.com`, Password: `farmer123` (Region: Lahore)
- Email: `farmer2@example.com`, Password: `farmer123` (Region: Karachi)
- Email: `farmer3@example.com`, Password: `farmer123` (Region: Peshawar)

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123",
  "role": "farmer",
  "region": "Lahore"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response includes JWT token:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Items

#### List All Items
```http
GET /api/items?region=Lahore&search=tomato&category=vegetable
```

Parameters:
- `region` (optional): Filter by region and include latest prices
- `search` (optional): Search items by name
- `category` (optional): Filter by category (vegetable, fruit, grain, etc.)

#### Get Item Details
```http
GET /api/items/:id
```

#### Get Item Price History
```http
GET /api/items/:id/prices?region=Lahore&days=7
```

Parameters:
- `region` (required): Region name
- `days` (optional, default: 7): Number of days of history

#### 🌟 Compare Multiple Items (BONUS FEATURE)
```http
GET /api/items/compare?itemIds=id1,id2,id3&region=Lahore&days=7
```

**Use Case:** Compare price trends of multiple vegetables (e.g., "Tomato vs. Potato")

Parameters:
- `itemIds` (required): Comma-separated item IDs (2-5 items)
- `region` (required): Region name
- `days` (optional, default: 7): Number of days of history

**Response Example:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "item": {
          "_id": "...",
          "name": "Tomato",
          "category": "vegetable",
          "unit": "kg"
        },
        "prices": [
          { "date": "2025-11-01", "price": 45.50 },
          { "date": "2025-11-02", "price": 47.20 }
        ],
        "stats": {
          "min": 45.50,
          "max": 52.00,
          "avg": "48.35",
          "latest": 52.00,
          "trend": "14.29",
          "volatility": "2.45"
        }
      },
      {
        "item": {
          "_id": "...",
          "name": "Potato",
          "category": "vegetable",
          "unit": "kg"
        },
        "prices": [...],
        "stats": {...}
      }
    ],
    "region": "Lahore",
    "days": 7,
    "insights": {
      "bestPerformer": {
        "name": "Tomato",
        "trend": "14.29%"
      },
      "worstPerformer": {
        "name": "Potato",
        "trend": "-5.20%"
      }
    }
  }
}
```

### Admin Routes (Requires Admin Role)

#### Create Item
```http
POST /api/admin/items
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Wheat",
  "category": "grain",
  "unit": "kg",
  "description": "Premium quality wheat"
}
```

#### Update Item
```http
PUT /api/admin/items/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "category": "vegetable"
}
```

#### Delete Item
```http
DELETE /api/admin/items/:id
Authorization: Bearer <admin-token>
```

#### Bulk Upload Prices (CSV Support)
```http
POST /api/admin/prices/bulk
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "prices": [
    {
      "itemName": "Tomato",
      "region": "Lahore",
      "date": "2025-11-04",
      "price": 45.50
    },
    {
      "itemName": "Potato",
      "region": "Karachi",
      "date": "2025-11-04",
      "price": 38.00
    }
  ]
}
```

#### Get Dashboard Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

### Weather

#### Get Weather Data
```http
GET /api/weather?city=Lahore
```

Returns mock data if `OPENWEATHER_API_KEY` is not configured.

### Advice

#### Get Farming Advice
```http
GET /api/advice?itemId=<item-id>&city=Lahore&region=Lahore
```

Parameters:
- `itemId` (required): Item ID
- `city` (optional): City for weather data
- `region` (optional): Region for price data

Returns rule-based advice. If `OPENAI_API_KEY` is configured, uses GPT for enhanced advice.

### Forum

#### List Posts
```http
GET /api/posts?page=1&limit=10&category=question&search=tomato
```

#### Get Post Details
```http
GET /api/posts/:id
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "How to grow tomatoes?",
  "content": "I need advice on tomato cultivation...",
  "category": "question",
  "tags": ["tomato", "cultivation"]
}
```

#### Update Post
```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "content": "Updated content"
}
```

#### Delete Post
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /api/posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great question! Here's my advice..."
}
```

#### Delete Comment
```http
DELETE /api/posts/:postId/comments/:commentId
Authorization: Bearer <token>
```

## Postman Collection

Import this collection into Postman for quick testing:

```json
{
  "info": {
    "name": "Smart Agriculture API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"farmer\",\n  \"region\": \"Lahore\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Items",
      "item": [
        {
          "name": "Get All Items",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/items?region=Lahore",
              "host": ["{{baseUrl}}"],
              "path": ["items"],
              "query": [
                {
                  "key": "region",
                  "value": "Lahore"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

## Database Schema

### User
- name: String (required)
- email: String (unique, required)
- passwordHash: String (required)
- role: String (enum: 'admin', 'farmer')
- region: String (required)

### Item
- name: String (unique, required)
- slug: String (unique, auto-generated)
- category: String (enum: vegetable, fruit, grain, etc.)
- unit: String (enum: kg, lb, ton, etc.)
- description: String

### PricePoint
- item: ObjectId (ref: Item)
- region: String (required)
- date: Date (default: now)
- price: Number (required)

### Post
- title: String (required)
- content: String (required)
- author: ObjectId (ref: User)
- region: String
- category: String (enum: question, discussion, advice, news, other)
- tags: [String]
- viewCount: Number (default: 0)

### Comment
- post: ObjectId (ref: Post)
- content: String (required)
- author: ObjectId (ref: User)

## Error Handling

All errors are handled centrally and return consistent format:
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

## API Keys Setup

### OpenWeatherMap (Optional)
1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Add to `.env`: `OPENWEATHER_API_KEY=your_key`

### OpenAI (Optional)
1. Sign up at https://platform.openai.com/
2. Get API key
3. Add to `.env`: `OPENAI_API_KEY=your_key`

Without these keys, the app uses fallback mock data and rule-based logic.

## Deployment

### Option 1: Railway
1. Create account at railway.app
2. Create new project
3. Connect GitHub repo
4. Add environment variables
5. Deploy

### Option 2: Render
1. Create account at render.com
2. Create new Web Service
3. Connect GitHub repo
4. Add environment variables
5. Deploy

### Option 3: Heroku
```bash
heroku create smart-agriculture-api
heroku addons:create mongolab
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### MongoDB Atlas Setup
1. Create free cluster at mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP (0.0.0.0/0 for development)
4. Get connection string
5. Update `MONGODB_URI` in `.env`

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── item.controller.js
│   ├── admin.controller.js
│   ├── post.controller.js
│   ├── weather.controller.js
│   └── advice.controller.js
├── models/              # Mongoose schemas
│   ├── User.model.js
│   ├── Item.model.js
│   ├── PricePoint.model.js
│   ├── Post.model.js
│   └── Comment.model.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── item.routes.js
│   ├── admin.routes.js
│   ├── post.routes.js
│   ├── weather.routes.js
│   ├── advice.routes.js
│   └── price.routes.js
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   └── errorHandler.js
├── scripts/            # Utility scripts
│   └── seed.js
├── server.js           # Entry point
├── package.json
├── .env.example
└── README.md
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Populate database with sample data

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT
