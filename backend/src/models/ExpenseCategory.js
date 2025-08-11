const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // NULL para categorías globales
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#F44336'
  }
}, {
  tableName: 'expense_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ExpenseCategory;