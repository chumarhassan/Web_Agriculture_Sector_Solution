🌾 Smart Agriculture Market Tracker

A full-stack web application for real-time agricultural market insights, price tracking, and farmer community interaction.
Built with Node.js, Express, MongoDB, and React (Vite + Tailwind CSS).

🚀 Features
Backend (Node.js + Express + MongoDB)

🔐 JWT Authentication (Admin & Farmer roles)

🌽 Item Management – CRUD for agricultural products

💰 Price Tracking – Historical and regional price data

🌦️ Weather Integration – OpenWeatherMap API

🤖 AI Advice – Rule-based or GPT-powered farming tips

💬 Forum System – Posts, comments & community discussions

📊 Admin Dashboard – Statistics & bulk CSV price upload

Frontend (React + Tailwind + Chart.js)

📱 Responsive Dashboard with dark mode

📈 Interactive Price Charts with filters

☁️ Live Weather Data

🧠 AI Farming Recommendations

👥 Forum & Community Board

🛠️ Admin Panel for item & price management

🧩 Tech Stack
Layer	Technologies
Frontend	React 18, Vite, Tailwind CSS, Chart.js, Axios
Backend	Node.js, Express.js, MongoDB (Mongoose)
Auth	JWT, bcryptjs
Integrations	OpenWeatherMap API, OpenAI API (optional)
⚙️ Setup Instructions
1. Clone Repository
git clone https://github.com/chumarhassan/agri-store.git
cd agri-store

2. Setup Backend
cd backend
npm install
cp .env.example .env   # Configure your environment
npm run seed           # Optional: seed sample data
npm run dev


Server runs on → http://localhost:5000

3. Setup Frontend
cd ../frontend
npm install
npm run dev


App runs on → http://localhost:3000

🔑 Default Credentials
Role	Email	Password
Admin	admin@example.com
	admin123
Farmer 1	farmer1@example.com
	farmer123
Farmer 2	farmer2@example.com
	farmer123
Farmer 3	farmer3@example.com
	farmer123
🧠 API Overview

Base URL:

http://localhost:5000/api

Endpoint	Method	Description
/auth/login	POST	User login
/auth/register	POST	Register new user
/items	GET	Get all items
/items/:id/prices	GET	Get item price history
/admin/items	POST	Create new item (Admin only)
/weather?city=Lahore	GET	Get weather data
/advice	GET	Get AI/rule-based advice
/posts	GET	Get forum posts
🧱 Project Structure
agri-store/
├── backend/      # Express + MongoDB API
└── frontend/     # React + Tailwind + Chart.js UI

🌍 Deployment Options

Vercel – Frontend

Render / Railway / Heroku – Backend

MongoDB Atlas – Database

Add environment variables for API URLs, JWT secret, and optional API keys.

📜 License

This project is licensed under the MIT License.

👨‍💻 Author

Umar Hassan

🌐 GitHub: chumarhassan
