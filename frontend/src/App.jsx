import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import SimpleLogin from './pages/SimpleLogin';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import SimpleFarmerDashboard from './pages/SimpleFarmerDashboard';
import SimpleItemDetail from './pages/SimpleItemDetail';
import SimpleForum from './pages/SimpleForum';
import SimplePostDetail from './pages/SimplePostDetail';
import SimpleCreatePost from './pages/SimpleCreatePost';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><SimpleFarmerDashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><SimpleFarmerDashboard /></PrivateRoute>} />
            <Route path="/items/:id" element={<PrivateRoute><SimpleItemDetail /></PrivateRoute>} />
            <Route path="/forum" element={<PrivateRoute><SimpleForum /></PrivateRoute>} />
            <Route path="/forum/:id" element={<PrivateRoute><SimplePostDetail /></PrivateRoute>} />
            <Route path="/forum/create" element={<PrivateRoute><SimpleCreatePost /></PrivateRoute>} />
            
            {/* Admin Only Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
