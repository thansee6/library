import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fc] text-[#2c3e50] overflow-hidden relative font-sans">
      {/* Background gradients removed as the reference image is simple light */}

      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-white/50 shadow-sm relative z-10">
        <div className="mb-10 text-center">
          {/* Main color from image is a deep, professional blue and teal */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0d3b66] to-[#009688] bg-clip-text text-transparent mb-2 tracking-tight">
            E-Library
          </h1>
          <p className="text-[#607d8b] text-sm">Sign in to access your dashboard</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">Email Address</label>
            {/* The input from the image has an icon and uses light blue and grey tones */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
                {/* Simplified placeholder for the envelope icon */}
                <span style={{ fontSize: '1.2em' }}>✉</span>
              </span>
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]/30 focus:border-transparent transition-all"
                placeholder="Enter your email" // Original text is "scholar@university.edu", but keeping structure
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-[#2c3e50]">Password</label>
              {/* Forgot password link is teal like in the image */}
              <a href="#" className="text-xs text-[#009688] hover:text-[#00796b] transition-colors">Forgot password?</a>
            </div>
            {/* Password input from image has both a lock and a visibility toggle icon */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aab2bd]">
                {/* Simplified placeholder for the lock icon */}
                <span style={{ fontSize: '1.2em' }}>🔒</span>
              </span>
              <input
                type="password"
                className="w-full pl-11 pr-11 py-3 rounded-lg bg-[#f0f4f8] border border-[#dce4ec] text-[#2c3e50] placeholder-[#aab2bd] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]/30 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aab2bd] hover:text-[#78909c]">
                {/* Simplified placeholder for the eye icon */}
                <span style={{ fontSize: '1.2em' }}>👁</span>
              </button>
            </div>
          </div>

          {/* Button color changed to solid deep navy with hover, and text from 'Sign In' to 'Login' with an arrow */}
          <button
            type="button"
            className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-[#1a237e] text-white font-medium hover:bg-[#0d155e] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-[#1a237e]/15"
          >
            Login <span className="ml-2">→</span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#607d8b]">
          Don't have an account? <a href="#" className="text-[#009688] hover:text-[#00796b] font-medium transition-colors">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;