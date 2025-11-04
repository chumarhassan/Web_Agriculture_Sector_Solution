# Smart Agriculture Market Tracker - Frontend

Modern, responsive React frontend for the Smart Agriculture Market Tracker application. Built with Vite, React, Tailwind CSS, and Chart.js.

## Features

- **Authentication**: Login and registration with JWT
- **Dashboard**: Real-time price tracking with search and filters
- **Item Details**: Interactive price charts with 7-day history
- **Weather Integration**: Live weather data for farming decisions
- **AI Advice**: Intelligent farming recommendations
- **Forum System**: Community discussion board with posts and comments
- **Admin Panel**: Item management and CSV price uploads
- **Dark Mode**: Beautiful dark theme optimized for readability
- **Responsive**: Mobile-first design that works on all devices

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form
- **Charts**: Chart.js + react-chartjs-2
- **HTTP Client**: Axios
- **CSV Parsing**: PapaParse
- **Icons**: Lucide React

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (Optional)
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   The frontend uses proxy in `vite.config.js` by default. If deploying separately:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will run on `http://localhost:3000`

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── TopBar.jsx
│   │   ├── LeftNav.jsx
│   │   ├── Layout.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── contexts/        # React context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── FarmerDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ItemDetail.jsx
│   │   ├── Forum.jsx
│   │   ├── PostDetail.jsx
│   │   └── CreatePost.jsx
│   ├── utils/          # Utility functions
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint

## Features Guide

### Authentication

**Login Page** (`/login`)
- Email and password authentication
- Demo credentials displayed for quick access
- Responsive form with validation

**Register Page** (`/register`)
- Create new farmer or admin accounts
- Form validation with react-hook-form
- Password confirmation
- Region selection

### Farmer Dashboard

**Main Dashboard** (`/dashboard`)
- Search items by name
- Filter by region and category
- View current prices for all items
- Click items to view detailed history
- Responsive card and table layouts

### Item Detail Page

**Item Details** (`/items/:id`)
- Interactive 7-day price chart with Chart.js
- Price statistics (min, max, average, latest)
- Real-time weather data for selected city
- AI-powered farming advice
- Adjustable time period (7, 14, 30 days)
- Region selection

### Admin Panel

**Admin Dashboard** (`/admin`)
- View system statistics
- CRUD operations for items
- Bulk CSV price upload
- Item management table
- Real-time data updates

**CSV Upload Format:**
```csv
itemName,region,date,price
Tomato,Lahore,2025-11-04,45.50
Potato,Karachi,2025-11-04,38.00
```

### Forum System

**Forum List** (`/forum`)
- Browse community posts
- Search and filter by category
- View post metadata (views, date, author)
- Pagination support

**Post Detail** (`/forum/:id`)
- Full post content
- Comment section
- Author verification
- Delete own posts/comments

**Create Post** (`/forum/create`)
- Rich text input
- Category selection
- Tag management
- Region specification

## Design System

### Color Palette

```css
background: #0F172A  /* Main background */
surface: #0B1220     /* Card/panel background */
primary: #60A5FA     /* Primary actions */
success: #34D399     /* Success states */
text: #E6EEF8       /* Primary text */
muted: #9CA3AF      /* Secondary text */
danger: #EF4444     /* Error states */
warning: #F59E0B    /* Warning states */
```

### Components

**Button Variants:**
- `primary` - Main actions (blue)
- `secondary` - Secondary actions (gray)
- `success` - Positive actions (green)
- `danger` - Destructive actions (red)

**Card Component:**
- Consistent padding and shadows
- Border styling
- Optional hover effects

**Table Component:**
- Responsive overflow
- Zebra striping
- Hover states

**Modal Component:**
- Overlay backdrop
- Click-outside to close
- Multiple size options (sm, md, lg, xl)

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

## Dark Mode

The app uses Tailwind's dark mode with the `class` strategy. Toggle is implemented in TopBar component and persists to localStorage.

## API Integration

All API calls use axios with interceptors for:
- Automatic JWT token injection
- Global error handling
- Response formatting
- 401 redirect to login

See `src/utils/api.js` for API methods.

## Charts

Price charts use Chart.js with custom styling:
- Line charts for price trends
- Tooltips with formatted data
- Responsive sizing
- Dark theme colors
- Smooth animations

## Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel dashboard for automatic deployments.

**Environment Variables on Vercel:**
- Set `VITE_API_URL` to your backend API URL

### Option 2: Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

Configure `_redirects` file for SPA routing:
```
/*  /index.html  200
```

### Option 3: Static Hosting

```bash
# Build production bundle
npm run build

# Upload dist/ folder to any static host
```

**Supported Hosts:**
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

## Performance Optimizations

- Vite for fast hot module replacement
- Code splitting with React.lazy
- Image optimization
- Minimal bundle size with tree shaking
- Efficient re-renders with React hooks

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Troubleshooting

**API Connection Issues:**
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify proxy settings in vite.config.js

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

**Chart Not Displaying:**
- Verify Chart.js registration in ItemDetail.jsx
- Check console for errors
- Ensure data format matches Chart.js requirements

## Contributing

1. Create feature branch
2. Make changes with clear commit messages
3. Test on multiple screen sizes
4. Submit pull request

## License

MIT

## Demo Credentials

After running the backend seed script:

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**Farmer Accounts:**
- Email: farmer1@example.com, Password: farmer123
- Email: farmer2@example.com, Password: farmer123
- Email: farmer3@example.com, Password: farmer123
