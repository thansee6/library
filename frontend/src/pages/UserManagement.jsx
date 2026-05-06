import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import API from '../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', role: 'member' });

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await API.put(`/users/${id}/status`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/users/${editingUser.id}`, formData);
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">User</th>
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Role</th>
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Status</th>
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-bold text-[#1a237e]">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      {user.role !== 'admin' && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                            className={`text-sm font-medium ${user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1a237e] mb-6">Edit User</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#0d155e] transition-colors font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement;
