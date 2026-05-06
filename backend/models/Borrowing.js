const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Borrowing = sequelize.define('Borrowing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  bookId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  borrowDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue'),
    defaultValue: 'borrowed'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['bookId'] },
    { fields: ['status'] }
  ]
});

module.exports = Borrowing;
