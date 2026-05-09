const { Book, Borrowing, User, SystemSetting } = require('../models');
const { Op } = require('sequelize');

const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Subscription status validation
    if (req.user.role !== 'admin') {
      const trialDaysLimit = 15;
      const createdAtTime = new Date(req.user.createdAt).getTime();
      const currentTime = new Date().getTime();
      const daysSinceRegistration = (currentTime - createdAtTime) / (1000 * 60 * 60 * 24);
      
      const isTrialActive = daysSinceRegistration < trialDaysLimit;
      const isSubscribed = req.user.subscriptionExpiresAt && new Date(req.user.subscriptionExpiresAt) > new Date();

      if (!isTrialActive && !isSubscribed) {
        return res.status(403).json({
          message: 'Access Denied: Your 15-day free trial has expired and you have no active subscription. Please subscribe to access library services.'
        });
      }
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableStock <= 0) {
      return res.status(400).json({ message: 'Book is currently out of stock' });
    }

    const activeBorrowings = await Borrowing.count({
      where: {
        userId,
        status: {
          [Op.in]: ['borrowed', 'overdue']
        }
      }
    });

    const limitSetting = await SystemSetting.findOne({ where: { key: 'borrowLimit' } });
    const maxLimit = limitSetting ? parseInt(limitSetting.value) : 3;

    if (activeBorrowings >= maxLimit) {
      return res.status(400).json({ message: `Borrowing limit reached (maximum ${maxLimit} books)` });
    }

    const alreadyBorrowed = await Borrowing.findOne({
      where: {
        userId,
        bookId,
        status: {
          [Op.in]: ['borrowed', 'overdue']
        }
      }
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ message: 'You have already borrowed this book and not returned it yet' });
    }

    const durationSetting = await SystemSetting.findOne({ where: { key: 'borrowDuration' } });
    const durationDays = durationSetting ? parseInt(durationSetting.value) : 14;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    const borrowing = await Borrowing.create({
      userId,
      bookId,
      dueDate
    });

    book.availableStock -= 1;
    await book.save();

    const borrowingWithDetails = await Borrowing.findByPk(borrowing.id, {
      include: [
        { model: Book, as: 'book' },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('book_borrowed', borrowingWithDetails);
    }

    res.status(201).json(borrowingWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const returnBook = async (req, res) => {
  try {
    const borrowingId = req.params.id;
    const userId = req.user.id;

    const borrowing = await Borrowing.findOne({
      where: { id: borrowingId, userId }
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned' });
    }

    borrowing.status = 'returned';
    borrowing.returnDate = new Date();
    await borrowing.save();

    const book = await Book.findByPk(borrowing.bookId);
    if (book) {
      book.availableStock += 1;
      await book.save();
    }

    const borrowingWithDetails = await Borrowing.findByPk(borrowing.id, {
      include: [
        { model: Book, as: 'book' },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('book_returned', borrowingWithDetails);
    }

    res.json(borrowingWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getBorrowingHistory = async (req, res) => {
  try {
    const borrowings = await Borrowing.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Book, as: 'book' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(borrowings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getAllBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrowing.findAll({
      include: [
        { model: Book, as: 'book' },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(borrowings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const clearBorrowing = async (req, res) => {
  try {
    const borrowingId = req.params.id;

    const borrowing = await Borrowing.findByPk(borrowingId);

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned' });
    }

    borrowing.status = 'returned';
    borrowing.returnDate = new Date();
    await borrowing.save();

    const book = await Book.findByPk(borrowing.bookId);
    if (book) {
      book.availableStock += 1;
      await book.save();
    }

    const borrowingWithDetails = await Borrowing.findByPk(borrowing.id, {
      include: [
        { model: Book, as: 'book' },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('book_returned', borrowingWithDetails);
    }

    res.json(borrowingWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteBorrowing = async (req, res) => {
  try {
    const borrowingId = req.params.id;

    const borrowing = await Borrowing.findByPk(borrowingId);

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    // If deleting an active (unreturned) borrowing, restore the book's available stock
    if (borrowing.status !== 'returned') {
      const book = await Book.findByPk(borrowing.bookId);
      if (book) {
        book.availableStock += 1;
        await book.save();
      }
    }

    await borrowing.destroy();

    res.json({ message: 'Borrowing record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getBorrowingHistory,
  getAllBorrowings,
  clearBorrowing,
  deleteBorrowing
};
