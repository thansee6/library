import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'edit' | 'password'

  // Edit Profile fields
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  // Change Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await API.put('/auth/profile', { username, email });
      updateUser({ username: data.username, email: data.email });
      setSuccess('Profile updated successfully!');
      setActiveTab('view');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await API.put('/auth/password', { oldPassword, newPassword });
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('view');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fc] p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-sm">
          <span className="text-5xl mb-4 block">🔒</span>
          <h2 className="text-2xl font-bold text-[#1a237e] mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">Please log in to view and manage your profile details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-[#1a237e] mb-2">Account Settings</h1>
          <p className="text-gray-500">Manage your profile details and security preferences.</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm mb-6 flex items-center gap-3 animate-fade-in">
            <span className="text-xl">⚠️</span>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-xl shadow-sm mb-6 flex items-center gap-3 animate-fade-in">
            <span className="text-xl">✅</span>
            <p className="font-medium text-sm">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => { setActiveTab('view'); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 px-6 font-semibold text-sm transition-all focus:outline-none border-b-2 ${
                activeTab === 'view'
                  ? 'border-[#1a237e] text-[#1a237e] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              👤 Profile Details
            </button>
            <button
              onClick={() => { setActiveTab('edit'); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 px-6 font-semibold text-sm transition-all focus:outline-none border-b-2 ${
                activeTab === 'edit'
                  ? 'border-[#1a237e] text-[#1a237e] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 px-6 font-semibold text-sm transition-all focus:outline-none border-b-2 ${
                activeTab === 'password'
                  ? 'border-[#1a237e] text-[#1a237e] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              🔒 Change Password
            </button>
          </div>

          <div className="p-8">
            {/* View Profile details tab */}
            {activeTab === 'view' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="w-24 h-24 bg-gradient-to-tr from-[#1a237e] to-[#009688] text-white font-bold text-3xl rounded-full flex items-center justify-center shadow-lg uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-[#1a237e]">{user.username}</h2>
                    <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-bold bg-[#e8eaf6] text-[#1a237e] rounded-full uppercase tracking-wider">
                      {user.role} Role
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">Username</span>
                    <span className="text-base font-bold text-gray-700">{user.username}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">Email Address</span>
                    <span className="text-base font-bold text-gray-700">{user.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Profile tab */}
            {activeTab === 'edit' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-[#1a237e] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-[#1a237e] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#009688] text-white font-bold hover:bg-[#00796b] transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? 'Saving changes...' : 'Save Profile Changes'}
                </button>
              </form>
            )}

            {/* Change Password tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-[#1a237e] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-[#1a237e] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 focus:border-[#1a237e] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#1a237e] text-white font-bold hover:bg-[#0d155e] transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? 'Updating password...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
