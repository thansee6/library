import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('view');

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [subStatus, setSubStatus] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [fetchingSub, setFetchingSub] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);
  const [selMethod, setSelMethod] = useState('success');

  const fetchSubscriptionDetails = async () => {
    setFetchingSub(true);
    try {
      const [statusRes, historyRes] = await Promise.all([
        API.get('/subscription/status'),
        API.get('/subscription/history')
      ]);
      setSubStatus(statusRes.data);
      setPaymentHistory(historyRes.data);
    } catch (err) {
      console.error('Failed to fetch subscription details', err);
    } finally {
      setFetchingSub(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'subscription') {
      fetchSubscriptionDetails();
    }
  }, [activeTab]);

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

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setError('');
    setSuccess('');
    setPaymentProcessing(true);

    try {
      const { data } = await API.post('/subscription/create-order');
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway SDK. Please check your internet connection.');
        setPaymentProcessing(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Library Subscription',
        description: 'Monthly Premium Membership',
        order_id: data.orderId,
        handler: async (response) => {
          setPaymentProcessing(true);
          try {
            const verifyRes = await API.post('/subscription/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: data.paymentId,
              isMock: false
            });
            setSuccess('Subscription payment successful! Enjoy Premium Library access.');
            fetchSubscriptionDetails();
          } catch (err) {
            setError('Payment verification failed. Please try again.');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: user.username,
          email: user.email
        },
        theme: {
          color: '#1a237e'
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setPaymentProcessing(false);
    }
  };

  const handleSimulatedPayment = async (status) => {
    setShowMockModal(false);
    if (status === 'fail') {
      setError('Payment simulation: Transaction failed by user.');
      return;
    }

    setPaymentProcessing(true);
    try {
      const verifyRes = await API.post('/subscription/verify-payment', {
        razorpay_order_id: mockPaymentData.orderId,
        razorpay_payment_id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: mockPaymentData.paymentId,
        isMock: true
      });
      setSuccess('Subscription Activated! Your premium library access is now active.');
      fetchSubscriptionDetails();
    } catch (err) {
      setError('Failed to verify simulated payment.');
    } finally {
      setPaymentProcessing(false);
      setMockPaymentData(null);
    }
  };

  const handleDownloadInvoice = async (paymentId, invoiceNumber) => {
    try {
      const response = await API.get(`/subscription/invoice/${paymentId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleDeletePaymentRecord = async (paymentId) => {
    if (!window.confirm('Are you sure you want to permanently delete this billing transaction log?')) return;
    try {
      await API.delete(`/subscription/admin/payment/${paymentId}`);
      alert('Transaction record deleted successfully.');
      const fetchHistory = async () => {
        try {
          const { data } = await API.get('/subscription/history');
          setPaymentHistory(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchHistory();
    } catch (err) {
      alert('Failed to delete transaction record: ' + (err.response?.data?.message || err.message));
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
          <p className="text-gray-500">Manage your profile details, subscription billing, and security preferences.</p>
        </div>

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

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('view'); setError(''); setSuccess(''); }}
              className={`flex-1 min-w-[120px] py-4 px-4 font-semibold text-sm transition-all focus:outline-none border-b-2 whitespace-nowrap ${
                activeTab === 'view'
                  ? 'border-[#1a237e] text-[#1a237e] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              👤 Profile Details
            </button>
            <button
              onClick={() => { setActiveTab('edit'); setError(''); setSuccess(''); }}
              className={`flex-1 min-w-[120px] py-4 px-4 font-semibold text-sm transition-all focus:outline-none border-b-2 whitespace-nowrap ${
                activeTab === 'edit'
                  ? 'border-[#1a237e] text-[#1a237e] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
              className={`flex-1 min-w-[120px] py-4 px-4 font-semibold text-sm transition-all focus:outline-none border-b-2 whitespace-nowrap ${
                activeTab === 'password'
                  ? 'border-[#1a237e] text-[#1a237e] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              🔒 Change Password
            </button>
            <button
              onClick={() => { setActiveTab('subscription'); setError(''); setSuccess(''); }}
              className={`flex-1 min-w-[120px] py-4 px-4 font-semibold text-sm transition-all focus:outline-none border-b-2 whitespace-nowrap ${
                activeTab === 'subscription'
                  ? 'border-[#1a237e] text-[#1a237e] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              💳 Subscription & Billing
            </button>
          </div>

          <div className="p-8">
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

            {activeTab === 'subscription' && (
              <div className="space-y-8 animate-fade-in">
                {fetchingSub ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-sm">Retrieving subscription status & billing history...</p>
                  </div>
                ) : (
                  <>
                    {/* Status Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1a237e] to-[#283593] text-white shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 select-none pointer-events-none">
                        <span className="text-[140px] font-bold">💳</span>
                      </div>
                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
                              Membership Status
                            </span>
                          </div>
                          
                          {subStatus?.subscriptionStatus === 'trial' && (
                            <div>
                              <h3 className="text-3xl font-extrabold flex items-center gap-2">
                                Free Trial Active <span>🌱</span>
                              </h3>
                              <p className="text-white/80 mt-1 text-sm font-medium">
                                Enjoying complimentary library services.
                              </p>
                              <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs shadow-md">
                                ⏳ {subStatus.trialRemainingDays} days remaining on your trial
                              </div>
                            </div>
                          )}

                          {subStatus?.subscriptionStatus === 'active' && (
                            <div>
                              <h3 className="text-3xl font-extrabold flex items-center gap-2">
                                Premium Active <span>🌟</span>
                              </h3>
                              <p className="text-white/85 mt-1 text-sm font-medium">
                                Full library access is enabled on your account.
                              </p>
                              {subStatus.subscriptionExpiresAt && (
                                <p className="text-white/70 mt-2 text-xs">
                                  Renews on: <span className="font-bold">{new Date(subStatus.subscriptionExpiresAt).toLocaleDateString()}</span>
                                </p>
                              )}
                            </div>
                          )}

                          {(subStatus?.subscriptionStatus === 'overdue' || subStatus?.subscriptionStatus === 'inactive' || !subStatus?.subscriptionStatus) && (
                            <div>
                              <h3 className="text-3xl font-extrabold flex items-center gap-2 text-rose-200">
                                Subscription Inactive <span>⚠️</span>
                              </h3>
                              <p className="text-rose-100 mt-1 text-sm font-medium">
                                Your premium subscription is currently inactive or cancelled. Access to borrowing services is restricted.
                              </p>
                            </div>
                          )}
                        </div>

                        {(subStatus?.subscriptionStatus === 'trial' || subStatus?.subscriptionStatus === 'overdue' || !subStatus?.isSubscribed) && (
                          <button
                            onClick={handleInitiatePayment}
                            disabled={paymentProcessing}
                            className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            {paymentProcessing ? (
                              <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <span>🚀</span> Subscribe Now (₹500/mo)
                              </>
                            )}
                          </button>
                        )}

                        {subStatus?.subscriptionStatus === 'active' && subStatus?.isSubscribed && (
                          <button
                            onClick={handleInitiatePayment}
                            disabled={paymentProcessing}
                            className="w-full md:w-auto px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            Renew/Extend (₹500/mo)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                      <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span>🎁</span> Premium Membership Perks
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 text-lg">✓</span> Borrow up to 3 books concurrently
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 text-lg">✓</span> 14-day standard borrow duration
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 text-lg">✓</span> Real-time chat & technical support
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-500 text-lg">✓</span> Unlimited catalogs & favoriting
                        </li>
                      </ul>
                    </div>

                    {/* Transaction History */}
                    <div>
                      <h3 className="text-xl font-bold text-[#1a237e] mb-4 flex items-center gap-2">
                        <span>🧾</span> Billing & Payment History
                      </h3>

                      {(() => {
                        const filteredHistory = paymentHistory.filter(p => p.status !== 'pending');
                        if (filteredHistory.length === 0) {
                          return (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              <span className="text-4xl block mb-2">📭</span>
                              <p className="text-gray-400 text-sm font-medium">No active transactions found on your account.</p>
                            </div>
                          );
                        }
                        return (
                          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                                  <th className="p-4">Invoice No</th>
                                  <th className="p-4">Date</th>
                                  <th className="p-4">Amount</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Invoice</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredHistory.map((payment) => (
                                <tr key={payment.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                  <td className="p-4 font-mono font-semibold text-[#1a237e]">
                                    {payment.invoiceNumber}
                                  </td>
                                  <td className="p-4 text-gray-500">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-4 font-bold text-gray-800">
                                    ₹{payment.amount}.00
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
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
                                    <div className="flex items-center justify-end gap-2">
                                      {payment.status === 'completed' && (
                                        <button
                                          onClick={() => handleDownloadInvoice(payment.id, payment.invoiceNumber)}
                                          className="text-xs font-bold text-[#009688] hover:text-[#00796b] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 hover:bg-teal-100 transition-all inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          ⬇️ Download
                                        </button>
                                      )}
                                      {user.role === 'admin' && (
                                        <button
                                          onClick={() => handleDeletePaymentRecord(payment.id)}
                                          className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-all inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          🗑️ Delete
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Sandbox Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[380px] w-full overflow-hidden border border-slate-100 transform scale-100 transition-all animate-slide-up flex flex-col font-sans">
            
            {/* Top Amber Sandbox Header */}
            <div className="bg-amber-500 text-white text-[10px] font-bold py-1.5 px-4 text-center tracking-wider uppercase select-none">
              ⚠️ Razorpay Sandbox — Test Mode
            </div>

            {/* Merchant Details Panel */}
            <div className="bg-[#1e293b] p-6 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold tracking-wide">Library Services Ltd</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Monthly Premium Subscription</p>
                <p className="text-[9px] font-mono text-slate-500 mt-1.5 uppercase">ID: {mockPaymentData?.orderId}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Amount</span>
                <span className="text-xl font-extrabold text-white">₹500.00</span>
              </div>
            </div>

            {/* Simulation Interface */}
            <div className="p-6 space-y-5 bg-slate-50">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Select Simulation Method
                </span>
                
                <div className="space-y-2.5">
                  {/* Option 1: Simulate Payment Success */}
                  <label 
                    onClick={() => setSelMethod('success')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      selMethod === 'success' 
                        ? 'bg-emerald-50/50 border-emerald-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">✓</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">Simulate Success (Approved)</p>
                        <p className="text-[9px] text-slate-400">Verifies HMAC signature & active status</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="simulation_method"
                      checked={selMethod === 'success'} 
                      onChange={() => setSelMethod('success')}
                      className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500" 
                    />
                  </label>

                  {/* Option 2: Simulate Payment Failure */}
                  <label 
                    onClick={() => setSelMethod('fail')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      selMethod === 'fail' 
                        ? 'bg-rose-50/50 border-rose-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg bg-rose-100 text-rose-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-rose-800 transition-colors">Simulate Failure (Declined)</p>
                        <p className="text-[9px] text-slate-400">Tests failed states & retry flow</p>
                      </div>
                    </div>
                    <input 
                      type="radio" 
                      name="simulation_method"
                      checked={selMethod === 'fail'} 
                      onChange={() => setSelMethod('fail')}
                      className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500" 
                    />
                  </label>
                </div>
              </div>

              {/* Secure Pay Action Button */}
              <button
                onClick={() => handleSimulatedPayment(selMethod)}
                className={`w-full py-3.5 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer ${
                  selMethod === 'success' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10' 
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                }`}
              >
                🔒 Pay ₹500.00 Securely
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => { setShowMockModal(false); setMockPaymentData(null); }}
                className="w-full py-2.5 text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 tracking-wider uppercase transition-colors cursor-pointer"
              >
                Cancel and return to merchant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
