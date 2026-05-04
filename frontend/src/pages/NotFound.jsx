import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fc] text-[#2c3e50] overflow-hidden relative font-sans p-4">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-white/50 shadow-sm relative z-10 text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-linear-to-r from-[#0d3b66] to-[#009688] bg-clip-text text-transparent tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl font-bold text-[#0d3b66] mt-4">Page Not Found</h2>
          <p className="text-[#607d8b] mt-2">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="inline-block w-full py-3 px-4 rounded-lg bg-[#1a237e] text-white font-medium hover:bg-[#0d155e] transition-all duration-200 shadow-md"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
