const { sequelize } = require('../config/db');
const User = require('./User');
const Author = require('./Author');
const Category = require('./Category');
const Book = require('./Book');

Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = {
  sequelize,
  User,
  Author,
  Category,
  Book
};
