const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const { Payment, User } = require('../models');


const rzpKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345';
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET || 'mockSecret12345';

const razorpay = new Razorpay({
  key_id: rzpKeyId,
  key_secret: rzpKeySecret
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null
  }
});

const sendInvoiceEmail = async (user, payment, invoiceText) => {
  if (!user.email) return;
  try {
    const mailOptions = {
      from: '"Library Subscription" <no-reply@library.com>',
      to: user.email,
      subject: `Invoice for Library Subscription - ${payment.invoiceNumber}`,
      text: invoiceText,
      html: `<pre style="font-family: monospace; padding: 20px; background: #f4f6f9; border-radius: 8px;">${invoiceText}</pre>`
    };

    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`Invoice email sent to ${user.email}`);
    } else {
      console.log('--- Mock Invoice Email ---');
      console.log(`To: ${user.email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(invoiceText);
      console.log('--------------------------');
    }
  } catch (error) {
    console.error('Failed to send invoice email:', error);
  }
};

const generateInvoiceText = (user, payment) => {
  return `
=========================================
          LIBRARY SERVICES INVOICE       
=========================================
Invoice No: ${payment.invoiceNumber}
Date      : ${new Date(payment.createdAt).toLocaleDateString()}
Status    : ${payment.status.toUpperCase()}

BILL TO:
Name      : ${user.username}
Email     : ${user.email}

-----------------------------------------
DESCRIPTION                 AMOUNT (INR)
-----------------------------------------
Monthly Subscription Fee     ₹${payment.amount}.00

-----------------------------------------
TOTAL                       ₹${payment.amount}.00
-----------------------------------------
Payment Method: Razorpay
Payment ID    : ${payment.razorpayPaymentId || 'N/A'}
Order ID      : ${payment.razorpayOrderId || 'N/A'}

Thank you for your subscription!
Your library access has been renewed.
=========================================
`;
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const amountInRupees = 500; // Fixed monthly subscription fee: ₹500
    const amountInPaise = amountInRupees * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_sub_${Date.now()}`
    };

    let order;
    let isMock = false;

    if (rzpKeyId.startsWith('rzp_test_mockKeyId')) {
      isMock = true;
      order = {
        id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: options.receipt
      };
    } else {
      try {
        order = await razorpay.orders.create(options);
      } catch (rzpErr) {
        console.warn('Razorpay live order failed, falling back to mock mode:', rzpErr);
        isMock = true;
        order = {
          id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
          amount: amountInPaise,
          currency: 'INR',
          receipt: options.receipt
        };
      }
    }

    const payment = await Payment.create({
      userId,
      amount: amountInRupees,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: order.id,
      invoiceNumber: `INV-${Date.now()}`
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: isMock ? 'mock_key_id' : rzpKeyId,
      isMock,
      paymentId: payment.id
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, isMock } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    let isValid = false;

    if (isMock || razorpay_order_id.startsWith('order_mock_')) {
      isValid = true;
    } else {
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto
        .createHmac('sha256', rzpKeySecret)
        .update(text)
        .digest('hex');

      isValid = generated_signature === razorpay_signature;
    }

    if (!isValid) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    await payment.save();

    const user = await User.findByPk(userId);
    if (user) {
      let expiryDate = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : new Date();
      if (expiryDate < new Date()) {
        expiryDate = new Date();
      }
      expiryDate.setDate(expiryDate.getDate() + 30);

      user.subscriptionStatus = 'active';
      user.subscriptionExpiresAt = expiryDate;
      await user.save();

      const invoiceText = generateInvoiceText(user, payment);
      sendInvoiceEmail(user, payment, invoiceText);
    }

    res.json({
      message: 'Payment verified and subscription activated successfully!',
      payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error during payment verification', error: error.message });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trialDaysLimit = 15;
    const createdAtTime = new Date(user.createdAt).getTime();
    const currentTime = new Date().getTime();
    const daysSinceRegistration = (currentTime - createdAtTime) / (1000 * 60 * 60 * 24);
    const trialRemainingDays = Math.max(0, Math.ceil(trialDaysLimit - daysSinceRegistration));
    const isTrialActive = daysSinceRegistration < trialDaysLimit;

    let displayStatus = user.subscriptionStatus;
    const isSubscribed = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();

    if (isTrialActive && !isSubscribed) {
      displayStatus = 'trial';
    } else if (!isTrialActive && !isSubscribed) {
      displayStatus = 'overdue';
      if (user.subscriptionStatus !== 'overdue') {
        user.subscriptionStatus = 'overdue';
        await user.save();
      }
    }

    res.json({
      subscriptionStatus: displayStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      isTrialActive,
      trialRemainingDays,
      createdAt: user.createdAt,
      isSubscribed,
      isActiveAccess: isTrialActive || isSubscribed || user.role === 'admin'
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    let targetUserId = req.user.id;

    if (req.user.role === 'admin' && req.query.userId) {
      targetUserId = req.query.userId;
    }

    const payments = await Payment.findAll({
      where: { userId: targetUserId },
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByPk(payment.userId);
    const invoiceText = generateInvoiceText(user, payment);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${payment.invoiceNumber}.txt"`);
    res.send(invoiceText);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.adminDeletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await payment.destroy();
    res.json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    console.error('Admin delete payment error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.adminCancelSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscriptionStatus = 'inactive';
    user.subscriptionExpiresAt = null;
    await user.save();

    res.json({ message: `Successfully cancelled subscription for user ${user.username}`, user });
  } catch (error) {
    console.error('Admin cancel subscription error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.adminGiveFreeSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days free access

    user.subscriptionStatus = 'active';
    user.subscriptionExpiresAt = expiryDate;
    await user.save();

    await Payment.create({
      userId: user.id,
      amount: 0,
      currency: 'INR',
      status: 'completed',
      razorpayOrderId: `grant_order_${Date.now()}`,
      razorpayPaymentId: `free_grant_${Date.now()}`,
      invoiceNumber: `GRANT-${Date.now()}`
    });

    res.json({ message: `Successfully granted free 30-day subscription to ${user.username}`, user });
  } catch (error) {
    console.error('Admin give free subscription error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
