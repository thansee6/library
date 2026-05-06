const { sequelize } = require('../config/db');
const User = require('./User');
const Author = require('./Author');
const Category = require('./Category');
const Book = require('./Book');
const Borrowing = require('./Borrowing');

Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Borrowing, { foreignKey: 'userId', as: 'borrowings' });
Borrowing.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Book.hasMany(Borrowing, { foreignKey: 'bookId', as: 'borrowings' });
Borrowing.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = {
  sequelize,
  User,
  Author,
  Category,
  Book,
  Borrowing
};
