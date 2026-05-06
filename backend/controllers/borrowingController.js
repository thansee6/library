const { Book, Borrowing, User } = require('../models');
const { Op } = require('sequelize');

const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

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

    if (activeBorrowings >= 3) {
      return res.status(400).json({ message: 'Borrowing limit reached (maximum 3 books)' });
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

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

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

module.exports = {
  borrowBook,
  returnBook,
  getBorrowingHistory,
  getAllBorrowings
};
