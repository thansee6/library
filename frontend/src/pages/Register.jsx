import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/register', { username, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fc] text-[#2c3e50] overflow-hidden relative font-sans">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-white/50 shadow-sm relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold bg-linear-to-r from-[#0d3b66] to-[#009688] bg-clip-text text-transparent mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-[#607d8b] text-sm">Join the E-Library to start borrowing</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
                <span style={{ fontSize: '1.2em' }}>👤</span>
              </span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]/30 focus:border-transparent transition-all"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
                <span style={{ fontSize: '1.2em' }}>✉</span>
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]/30 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
                <span style={{ fontSize: '1.2em' }}>🔒</span>
              </span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength="8"
                className="w-full pl-11 pr-11 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]/30 focus:border-transparent transition-all"
                placeholder="Create a password"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aab2bd] hover:text-[#78909c]">
                <span style={{ fontSize: '1.2em' }}>👁</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-[#aab2bd]">Must be at least 8 characters long</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-[#1a237e] text-white font-medium hover:bg-[#0d155e] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-[#1a237e]/15 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'} <span className="ml-2">→</span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#607d8b]">
          Already have an account? <Link to="/login" className="text-[#009688] hover:text-[#00796b] font-medium transition-colors">Login here</Link>
        </p>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link to="/" className="text-sm text-[#2c3e50]/60 hover:text-[#1a237e] transition-colors flex items-center justify-center gap-1">
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

