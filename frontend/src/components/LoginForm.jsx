import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ showRegisterLink = true, showForgotPassword = true, isCompact = false, showTitle = true }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.type === 'email' ? 'email' : 'password']: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/catalog'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${!isCompact ? 'max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-white/50 shadow-lg' : ''}`}>
      {!isCompact && showTitle && (
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1a237e] to-[#009688] bg-clip-text text-transparent mb-2 tracking-tight">
            E-Library
          </h1>
          <p className="text-[#607d8b] text-sm">Sign in to access your dashboard</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="loginform-email" className="block text-sm font-medium text-[#2c3e50] mb-2">Email Address</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
              <span style={{ fontSize: '1.2em' }}>✉</span>
            </span>
            <input
              id="loginform-email"
              name="email"
              type="email"
              value={email}
              onChange={onChange}
              required
              autoComplete="email"
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="loginform-password" className="block text-sm font-medium text-[#2c3e50]">Password</label>
            {showForgotPassword && (
              <Link to="/forgot-password" size="sm" className="text-xs text-[#009688] hover:text-[#00796b] transition-colors">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
              <span style={{ fontSize: '1.2em' }}>🔒</span>
            </span>
            <input
              id="loginform-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={onChange}
              required
              autoComplete="current-password"
              className="w-full pl-11 pr-11 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aab2bd] hover:text-[#78909c]"
            >
              <span style={{ fontSize: '1.2em' }}>{showPassword ? '🙈' : '👁'}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-[#1a237e] text-white font-medium hover:bg-[#0d155e] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-[#1a237e]/15 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'} <span className="ml-2">→</span>
        </button>
      </form>

      {showRegisterLink && (
        <p className="mt-8 text-center text-sm text-[#607d8b]">
          Don't have an account? <Link to="/register" className="text-[#009688] hover:text-[#00796b] font-medium transition-colors">Register here</Link>
        </p>
      )}
    </div>
  );
};

export default LoginForm;
