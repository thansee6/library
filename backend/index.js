const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { connectDB, sequelize } = require('./config/db');
const { Borrowing, User, Book, Payment } = require('./models');
const { Op } = require('sequelize');
const path = require('path');
const nodemailer = require('nodemailer');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

// ─── Socket.IO Setup ────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (message) => {
    // message structure: { room, senderId, senderName, text, timestamp }
    io.to(message.room).emit('receive_message', message);
    // Also relay to the 'admin_support' channel so admins are notified and can register active chat sessions in real-time!
    io.to('admin_support').emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ─── Security & Performance Middleware ──────────────────────────────────────

// Helmet: sets various HTTP headers for security (XSS, CSP, clickjacking, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }  // Allow cross-origin image loading for uploads
}));

// Gzip/Brotli compression for all responses — reduces payload size by 60-80%
app.use(compression());

// CORS configuration — allow both local dev and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all in dev; tighten for production
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Static file serving for uploaded book covers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',          // Cache static assets for 7 days
  etag: true,            // Enable ETag for conditional requests
  lastModified: true
}));

// ─── API Rate Limiting ──────────────────────────────────────────────────────

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 minutes
  max: 200,                      // Max 200 requests per window
  standardHeaders: true,         // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict limiter for auth endpoints: prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 minutes
  max: 20,                       // Only 20 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Payment endpoints: prevent abuse
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute
  max: 10,                       // 10 payment requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many payment requests. Please wait a moment before trying again.'
  }
});

// Apply global rate limiter to all API routes
app.use('/api', globalLimiter);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/authors', require('./routes/authorRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/borrowings', require('./routes/borrowingRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/settings', require('./routes/systemSettingRoutes'));
app.use('/api/subscription', paymentLimiter, require('./routes/subscriptionRoutes'));

// Health check endpoint (useful for AWS ALB / deployment monitoring)
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Library Management API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// ─── Email Transporter (reusable) ───────────────────────────────────────────
const createMailTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

const sendNotificationEmail = async (to, subject, htmlBody) => {
  const transporter = createMailTransporter();
  if (!transporter) {
    console.log(`[EMAIL SKIPPED] No SMTP configured. Would send to: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Library Services" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlBody
    });
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, err.message);
  }
};

// ─── Cron Job 1: Overdue Borrowings Check (every hour) ──────────────────────
cron.schedule('0 * * * *', async () => {
  try {
    const overdues = await Borrowing.findAll({
      where: {
        status: 'borrowed',
        dueDate: { [Op.lt]: new Date() }
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Book, as: 'book', attributes: ['id', 'title'] }
      ]
    });

    for (const borrowing of overdues) {
      borrowing.status = 'overdue';
      await borrowing.save();
      io.emit('book_overdue', borrowing);
      console.log(`[CRON] Marked borrowing ${borrowing.id} as overdue`);

      // Send overdue notification email
      if (borrowing.user?.email) {
        await sendNotificationEmail(
          borrowing.user.email,
          '⚠️ Overdue Book Notice — Library Services',
          `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:#dc2626;margin-bottom:8px">⚠️ Book Overdue</h2>
            <p>Hi <strong>${borrowing.user.username}</strong>,</p>
            <p>Your borrowed book <strong>"${borrowing.book?.title}"</strong> was due on <strong>${new Date(borrowing.dueDate).toLocaleDateString()}</strong> and is now overdue.</p>
            <p>Please return it as soon as possible to avoid any penalties.</p>
            <p style="color:#6b7280;font-size:12px;margin-top:16px">— Library Management System</p>
          </div>`
        );
      }
    }
  } catch (err) {
    console.error('[CRON] Overdue check error:', err);
  }
});

// ─── Cron Job 2: Subscription Expiry Alerts (daily at 9:00 AM) ──────────────
cron.schedule('0 9 * * *', async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find users whose subscription expires within the next 3 days
    const expiringUsers = await User.findAll({
      where: {
        role: { [Op.ne]: 'admin' },
        subscriptionStatus: 'active',
        subscriptionExpiresAt: {
          [Op.between]: [now, threeDaysFromNow]
        }
      },
      attributes: ['id', 'username', 'email', 'subscriptionExpiresAt']
    });

    for (const user of expiringUsers) {
      const daysLeft = Math.ceil((new Date(user.subscriptionExpiresAt) - now) / (1000 * 60 * 60 * 24));

      // Send dashboard notification via socket
      io.emit('subscription_expiring', {
        userId: user.id,
        username: user.username,
        daysLeft,
        expiresAt: user.subscriptionExpiresAt
      });

      // Send email notification
      await sendNotificationEmail(
        user.email,
        `🔔 Subscription Expiring in ${daysLeft} day${daysLeft > 1 ? 's' : ''} — Library Services`,
        `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#d97706;margin-bottom:8px">🔔 Subscription Expiring Soon</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Your premium library subscription expires on <strong>${new Date(user.subscriptionExpiresAt).toLocaleDateString()}</strong> (in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>).</p>
          <p>Renew now to continue enjoying unlimited access to library services, borrowing, and support.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="display:inline-block;margin-top:12px;padding:10px 24px;background:#1a237e;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Renew Subscription →</a>
          <p style="color:#6b7280;font-size:12px;margin-top:16px">— Library Management System</p>
        </div>`
      );

      console.log(`[CRON] Subscription expiry alert sent to ${user.username} (${daysLeft} days left)`);
    }

    // Mark expired subscriptions as overdue
    const expired = await User.findAll({
      where: {
        role: { [Op.ne]: 'admin' },
        subscriptionStatus: 'active',
        subscriptionExpiresAt: { [Op.lt]: now }
      },
      attributes: ['id', 'username', 'email', 'subscriptionExpiresAt']
    });

    for (const user of expired) {
      user.subscriptionStatus = 'overdue';
      await user.save();

      io.emit('subscription_expired', { userId: user.id, username: user.username });

      await sendNotificationEmail(
        user.email,
        '❌ Subscription Expired — Library Services',
        `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#dc2626;margin-bottom:8px">❌ Subscription Expired</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Your premium library subscription expired on <strong>${new Date(user.subscriptionExpiresAt).toLocaleDateString()}</strong>.</p>
          <p>Your access to borrowing services has been restricted. Renew to restore full access.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="display:inline-block;margin-top:12px;padding:10px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Renew Now →</a>
          <p style="color:#6b7280;font-size:12px;margin-top:16px">— Library Management System</p>
        </div>`
      );

      console.log(`[CRON] Subscription expired for ${user.username}, status set to overdue`);
    }
  } catch (err) {
    console.error('[CRON] Subscription expiry check error:', err);
  }
});

// ─── Cron Job 3: Auto-generate Payment Due Receipts (daily at 8:00 AM) ──────
cron.schedule('0 8 * * *', async () => {
  try {
    // Find completed payments from the last 24 hours that haven't been emailed
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPayments = await Payment.findAll({
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: yesterday }
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ]
    });

    for (const payment of recentPayments) {
      if (payment.user?.email && payment.amount > 0) {
        await sendNotificationEmail(
          payment.user.email,
          `🧾 Payment Receipt — ${payment.invoiceNumber}`,
          `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:#059669;margin-bottom:8px">🧾 Payment Receipt</h2>
            <p>Hi <strong>${payment.user.username}</strong>,</p>
            <p>Thank you for your payment. Here are the details:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px;color:#6b7280">Invoice No</td><td style="padding:8px;font-weight:bold">${payment.invoiceNumber}</td></tr>
              <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px;color:#6b7280">Amount</td><td style="padding:8px;font-weight:bold">₹${payment.amount}.00</td></tr>
              <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px;color:#6b7280">Status</td><td style="padding:8px;font-weight:bold;color:#059669">Completed</td></tr>
              <tr><td style="padding:8px;color:#6b7280">Date</td><td style="padding:8px;font-weight:bold">${new Date(payment.createdAt).toLocaleDateString()}</td></tr>
            </table>
            <p style="color:#6b7280;font-size:12px;margin-top:16px">— Library Management System</p>
          </div>`
        );
        console.log(`[CRON] Payment receipt sent to ${payment.user.username} for ${payment.invoiceNumber}`);
      }
    }
  } catch (err) {
    console.error('[CRON] Payment receipt email error:', err);
  }
});

// ─── Server Startup ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`Rate limiting: 200 req/15min (global), 20 req/15min (auth), 10 req/min (payment)`);
      console.log(`Cron jobs: Overdue check (hourly), Subscription alerts (daily 9AM), Receipts (daily 8AM)`);
    });
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

startServer();
