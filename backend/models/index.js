const { sequelize } = require('../config/db');
const User = require('./User');
const Author = require('./Author');
const Category = require('./Category');
const Book = require('./Book');
const Borrowing = require('./Borrowing');
const SystemSetting = require('./SystemSetting');
const Payment = require('./Payment');

Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Borrowing, { foreignKey: 'userId', as: 'borrowings' });
Borrowing.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Book.hasMany(Borrowing, { foreignKey: 'bookId', as: 'borrowings' });
Borrowing.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Author,
  Category,
  Book,
  Borrowing,
  SystemSetting,
  Payment
};
