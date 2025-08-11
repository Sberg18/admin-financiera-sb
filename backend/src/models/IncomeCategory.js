const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IncomeCategory = sequelize.define('IncomeCategory', {
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
    defaultValue: '#4CAF50'
  }
}, {
  tableName: 'income_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = IncomeCategory;