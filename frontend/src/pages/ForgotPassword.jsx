import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fc] text-[#2c3e50] overflow-hidden relative font-sans">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-white/50 shadow-sm relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0d3b66] to-[#009688] bg-clip-text text-transparent mb-2 tracking-tight">
            Reset Password
          </h1>
          <p className="text-[#607d8b] text-sm">Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <span className="text-4xl block mb-3">✅</span>
              <h3 className="text-lg font-bold text-emerald-800 mb-1">Request Received</h3>
              <p className="text-sm text-emerald-700">
                If an account exists for <span className="font-bold">{email}</span>, you will receive a password reset link shortly. 
              </p>
              <p className="text-xs text-emerald-600 mt-3">
                If you don't receive an email, please contact the library administrator or use the in-app support chat for assistance.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-[#2c3e50] mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
                  <span style={{ fontSize: '1.2em' }}>✉</span>
                </span>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]/30 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-[#1a237e] text-white font-medium hover:bg-[#0d155e] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-[#1a237e]/15 mt-4 cursor-pointer"
            >
              Send Reset Link <span className="ml-2">→</span>
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-[#607d8b]">
          <p>Remember your password? <Link to="/login" className="text-[#009688] hover:text-[#00796b] font-medium transition-colors">Back to Login</Link></p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link to="/" className="text-sm text-[#2c3e50]/60 hover:text-[#1a237e] transition-colors flex items-center justify-center gap-1">
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
