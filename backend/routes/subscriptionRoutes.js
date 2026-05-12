const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
  getPaymentHistory,
  getInvoice,
  adminDeletePayment,
  adminCancelSubscription,
  adminGiveFreeSubscription,
  handleWebhook
} = require('../controllers/subscriptionController');

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/status', protect, getSubscriptionStatus);
router.get('/history', protect, getPaymentHistory);
router.get('/invoice/:paymentId', protect, getInvoice);


router.delete('/admin/payment/:paymentId', protect, authorize('admin'), adminDeletePayment);
router.post('/admin/cancel/:userId', protect, authorize('admin'), adminCancelSubscription);
router.post('/admin/free/:userId', protect, authorize('admin'), adminGiveFreeSubscription);

module.exports = router;
