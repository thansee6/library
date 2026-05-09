import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import API from '../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', role: 'member' });

  // Administrative user billing history states
  const [selectedUserForBilling, setSelectedUserForBilling] = useState(null);
  const [userBillingHistory, setUserBillingHistory] = useState([]);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [fetchingBilling, setFetchingBilling] = useState(false);

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

  const handleCancelSubscription = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this user's subscription?")) return;
    try {
      await API.post(`/subscription/admin/cancel/${id}`);
      alert('Subscription cancelled successfully');
      fetchUsers();
    } catch (err) {
      alert('Failed to cancel subscription: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGiveFreeSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to grant a free 30-day subscription to this user?')) return;
    try {
      await API.post(`/subscription/admin/free/${id}`);
      alert('Free 30-day subscription granted successfully');
      fetchUsers();
    } catch (err) {
      alert('Failed to grant free subscription: ' + (err.response?.data?.message || err.message));
    }
  };

  const openBillingModal = async (user) => {
    setSelectedUserForBilling(user);
    setIsBillingModalOpen(true);
    setFetchingBilling(true);
    try {
      const { data } = await API.get(`/subscription/history?userId=${user.id}`);
      setUserBillingHistory(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load billing history');
    } finally {
      setFetchingBilling(false);
    }
  };

  const deleteUserPaymentRecord = async (paymentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this transaction log?')) return;
    try {
      await API.delete(`/subscription/admin/payment/${paymentId}`);
      alert('Transaction log deleted successfully.');
      // Refresh list
      const { data } = await API.get(`/subscription/history?userId=${selectedUserForBilling.id}`);
      setUserBillingHistory(data);
      // Refresh main table
      fetchUsers();
    } catch (err) {
      alert('Failed to delete transaction log');
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
          <>
            {/* Desktop View */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">User</th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Role</th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Status</th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Subscription</th>
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
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        user.subscriptionStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : user.subscriptionStatus === 'overdue'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {user.subscriptionStatus || 'inactive'}
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
                              onClick={() => openBillingModal(user)}
                              className="text-sm font-medium text-teal-600 hover:text-teal-800"
                            >
                              Billing History
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                              className={`text-sm font-medium ${user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <span className="text-gray-300">|</span>
                            {user.subscriptionStatus === 'active' ? (
                              <button 
                                onClick={() => handleCancelSubscription(user.id)}
                                className="text-sm font-medium text-rose-600 hover:text-rose-800"
                              >
                                Cancel Sub
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleGiveFreeSubscription(user.id)}
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-800"
                              >
                                Grant Sub
                              </button>
                            )}
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
                    <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden grid grid-cols-1 gap-4 p-4">
              {users.map(user => (
                <div key={user.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-base text-[#1a237e]">{user.username}</div>
                      <div className="text-xs text-gray-500 break-all">{user.email}</div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    {user.role !== 'admin' && (
                      <>
                        <button 
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            user.isActive 
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center p-8 text-gray-500">No users found.</div>
              )}
            </div>
          </>
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
      {/* Billing History Modal */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-slide-up">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-extrabold text-[#1a237e]">💳 Subscription Billing Ledger</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Managing payment history for <span className="font-bold text-gray-700">{selectedUserForBilling?.username}</span> ({selectedUserForBilling?.email})
                </p>
              </div>
              <button 
                onClick={() => setIsBillingModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {fetchingBilling ? (
                <div className="text-center py-12 text-gray-500 text-sm font-semibold">
                  <span className="inline-block animate-spin mr-2">⏳</span> Loading subscription records...
                </div>
              ) : userBillingHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-4xl block mb-2">📭</span>
                  <p className="text-gray-400 text-sm font-medium">No previous subscriptions or payment records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                        <th className="p-4">Invoice No</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userBillingHistory.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#1a237e]">{payment.invoiceNumber}</td>
                          <td className="p-4 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 font-extrabold text-slate-800">₹{payment.amount}.00</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => deleteUserPaymentRecord(payment.id)}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              🗑️ Delete Record
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsBillingModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement;
