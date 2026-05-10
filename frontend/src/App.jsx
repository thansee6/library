import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import BookCatalog from './pages/BookCatalog';
import BookDetails from './pages/BookDetails';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/InventoryManagement';
import UserManagement from './pages/UserManagement';
import ActiveBorrows from './pages/ActiveBorrows';
import SystemSettings from './pages/SystemSettings';
import MyBorrowings from './pages/MyBorrowings';
import UserProfile from './pages/UserProfile';
import Favorites from './pages/Favorites';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import SupportChat from './components/SupportChat';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const GlobalNotifications = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const handleBorrowed = (borrowing) => {
      if (borrowing.userId === user.id) {
        addNotification(`Book "${borrowing.book?.title}" borrowed successfully!`);
      }
    };

    const handleReturned = (borrowing) => {
      if (borrowing.userId === user.id) {
        addNotification(`Book "${borrowing.book?.title}" returned. Thank you!`);
      }
    };

    const handleOverdue = (borrowing) => {
      if (borrowing.userId === user.id) {
        addNotification(`ALERT: Book "${borrowing.book?.title}" is overdue!`);
      }
    };

    const handleSubExpiring = (data) => {
      if (data.userId === (user.id || user._id)) {
        addNotification(`⚠️ Your subscription expires in ${data.daysLeft} day${data.daysLeft > 1 ? 's' : ''}. Renew now!`);
      }
    };

    const handleSubExpired = (data) => {
      if (data.userId === (user.id || user._id)) {
        addNotification(`❌ Your subscription has expired. Renew to continue borrowing.`);
      }
    };

    socket.on('book_borrowed', handleBorrowed);
    socket.on('book_returned', handleReturned);
    socket.on('book_overdue', handleOverdue);
    socket.on('subscription_expiring', handleSubExpiring);
    socket.on('subscription_expired', handleSubExpired);

    return () => {
      socket.off('book_borrowed', handleBorrowed);
      socket.off('book_returned', handleReturned);
      socket.off('book_overdue', handleOverdue);
      socket.off('subscription_expiring', handleSubExpiring);
      socket.off('subscription_expired', handleSubExpired);
    };
  }, [socket, user]);

  const addNotification = useCallback((msg) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <div key={n.id} className="bg-blue-600 text-white px-4 py-3 rounded shadow-lg">
          {n.msg}
        </div>
      ))}
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const showNavbar = (location.pathname !== '/' || (user && user.role !== 'admin')) && !location.pathname.startsWith('/admin');

  return (
    <>
      {showNavbar && <Navbar />}
      <GlobalNotifications />
      <SupportChat />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/catalog" element={<BookCatalog />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route 
            path="/borrowings" 
            element={
              <ProtectedRoute>
                <MyBorrowings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/inventory" 
            element={
              <ProtectedRoute roles={['admin']}>
                <InventoryManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/borrows" 
            element={<ProtectedRoute roles={['admin']}><ActiveBorrows /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/settings" 
            element={<ProtectedRoute roles={['admin']}><SystemSettings /></ProtectedRoute>} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
