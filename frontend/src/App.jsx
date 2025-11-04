import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import ItemDetail from './pages/ItemDetail';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><FarmerDashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><FarmerDashboard /></PrivateRoute>} />
            <Route path="/items/:id" element={<PrivateRoute><ItemDetail /></PrivateRoute>} />
            <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
            <Route path="/forum/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
            <Route path="/forum/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
            
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
