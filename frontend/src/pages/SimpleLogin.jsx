import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../utils/translations';
import { LogIn, User, Lock, Shield, Tractor } from 'lucide-react';

const SimpleLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState('farmer'); // 'farmer' or 'admin'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Get fresh user data
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        // Verify login type matches user role
        if ((loginType === 'admin' && storedUser?.role !== 'admin') || 
            (loginType === 'farmer' && storedUser?.role !== 'farmer')) {
          setError(loginType === 'admin' ? 'Invalid admin credentials' : 'غلط کسان کی معلومات');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        
        navigate(storedUser?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(loginType === 'admin' ? 'Invalid email or password' : 'غلط ای میل یا پاس ورڈ');
      }
    } catch (error) {
      setError(loginType === 'admin' ? 'Invalid email or password' : 'غلط ای میل یا پاس ورڈ');
    } finally {
      setLoading(false);
    }
  };

  // Admin Login UI (Dark & Professional)
  if (loginType === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          {/* Toggle Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setLoginType('farmer')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-l-xl transition-all flex items-center gap-2 font-semibold"
            >
              <Tractor size={20} />
              Farmer Login
            </button>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-r-xl font-semibold flex items-center gap-2"
            >
              <Shield size={20} />
              Admin Login
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
              <Shield className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-slate-400">Manage market data & system</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-center text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-900 border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white placeholder-slate-500"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-900 border border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white placeholder-slate-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 text-center">
                Demo: admin@example.com / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Farmer Login UI (Simple & Colorful with Urdu)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="w-full max-w-xl">
        {/* Toggle Button */}
        <div className="flex justify-center mb-6">
          <button
            className="px-6 py-3 md:px-8 md:py-4 bg-green-600 text-white rounded-l-2xl text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3"
          >
            <Tractor size={20} className="md:w-6 md:h-6" />
            کسان لاگ ان
          </button>
          <button
            onClick={() => setLoginType('admin')}
            className="px-6 py-3 md:px-8 md:py-4 bg-green-700 hover:bg-green-600 text-white rounded-r-2xl text-lg md:text-xl font-bold transition-all flex items-center gap-2 md:gap-3"
          >
            <Shield size={20} className="md:w-6 md:h-6" />
            ایڈمن لاگ ان
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-5xl md:text-7xl">🌾</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-4">اپنے اکاؤنٹ میں داخل ہوں</h1>
          <p className="text-green-200 text-lg md:text-xl lg:text-2xl">مارکیٹ کی قیمتیں دیکھیں</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-12">
          {error && (
            <div className="mb-6 md:mb-8 p-4 md:p-6 bg-red-100 border-4 border-red-500 rounded-2xl text-red-700 text-center text-lg md:text-xl lg:text-2xl font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Email */}
            <div>
              <label className="block text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 text-gray-800">ای میل</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-6 md:py-4 lg:py-5 text-lg md:text-xl lg:text-2xl border-4 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-500"
                placeholder="farmer1@example.com"
                required
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 text-gray-800">پاس ورڈ</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-6 md:py-4 lg:py-5 text-lg md:text-xl lg:text-2xl border-4 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-500"
                placeholder="farmer123"
                required
                dir="ltr"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-xl md:text-2xl lg:text-3xl font-bold py-4 md:py-5 lg:py-6 rounded-2xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'براہ کرم انتظار کریں...' : 'لاگ ان کریں'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
