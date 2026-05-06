const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const { connectDB, sequelize } = require('./config/db');
const { Borrowing, User, Book } = require('./models');
const { Op } = require('sequelize');
const path = require('path');

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

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/authors', require('./routes/authorRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/borrowings', require('./routes/borrowingRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.send('Library API is running...');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

cron.schedule('0 * * * *', async () => {
  try {
    const overdues = await Borrowing.findAll({
      where: {
        status: 'borrowed',
        dueDate: { [Op.lt]: new Date() }
      },
      include: [
        { model: User, as: 'user' },
        { model: Book, as: 'book' }
      ]
    });

    for (const borrowing of overdues) {
      borrowing.status = 'overdue';
      await borrowing.save();
      io.emit('book_overdue', borrowing);
      console.log(`Marked borrowing ${borrowing.id} as overdue`);
    }
  } catch (err) {
    console.error('Overdue cron job error:', err);
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

startServer();

