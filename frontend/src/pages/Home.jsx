import { Link, Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-8">
        
        <div className="flex-1 text-center lg:text-left mt-0 lg:mt-20">
          <h1 className="text-5xl sm:text-6xl font-bold text-[#1a237e] mb-4 tracking-tight">
            E-Library
          </h1>
          <p className="text-xl sm:text-2xl text-[#1c1e21] leading-relaxed max-w-lg mx-auto lg:mx-0">
            Connect with a world of knowledge. Borrow, manage, and explore thousands of books from anywhere, anytime.
          </p>
          <div className="mt-8 flex justify-center lg:justify-start">
            <Link to="/catalog" className="text-[#1a237e] font-bold hover:underline flex items-center gap-2">
              Browse our Collection <span>→</span>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/catalog" replace />
            )
          ) : (
            <LoginForm showTitle={false} />
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
