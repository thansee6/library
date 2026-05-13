const { Book, User, Borrowing } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.count();
    const activeUsers = await User.count(); 
    const totalBorrows = await Borrowing.count();
    const activeBorrows = await Borrowing.count({
      where: {
        status: { [Op.in]: ['borrowed', 'overdue'] }
      }
    });
    const overdueBooks = await Borrowing.count({
      where: {
        status: { [Op.in]: ['borrowed', 'overdue'] },
        dueDate: { [Op.lt]: new Date() }
      }
    });

    res.json({
      totalBooks,
      activeUsers,
      totalBorrows,
      activeBorrows,
      overdueBooks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDashboardStats };
