import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  ShoppingCart, 
  MessageSquare, 
  BarChart3, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const LeftNav = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['farmer', 'admin'] },
    { path: '/admin', label: 'Admin Panel', icon: BarChart3, roles: ['admin'] },
    { path: '/forum', label: 'Forum', icon: MessageSquare, roles: ['farmer', 'admin'] }
  ];

  const filteredItems = navItems.filter(item => 
    isAdmin() ? true : !item.roles.includes('admin')
  );

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary text-white' 
            : 'text-muted hover:bg-background hover:text-text'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-surface rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-surface border-r border-gray-700 p-6
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="space-y-2">
          {filteredItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </>
  );
};

export default LeftNav;
