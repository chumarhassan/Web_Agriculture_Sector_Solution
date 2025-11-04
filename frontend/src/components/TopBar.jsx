import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

const TopBar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 border-b-4 border-green-700 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 hover:text-green-100 transition-colors">
          🌾 SmartAgri
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-green-700 transition-colors text-white"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Info */}
          {user && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg">
                <User size={18} className="text-white" />
                <span className="text-sm text-white font-semibold">
                  {user.name}
                  {user.role === 'admin' && (
                    <span className="ml-2 px-3 py-1 bg-yellow-400 text-green-900 text-xs rounded-full font-bold">
                      ADMIN
                    </span>
                  )}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-600 transition-colors text-white bg-red-500 shadow-md"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
