const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Income = sequelize.define('Income', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.STRING(255)
  },
  incomeDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'income_date'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_recurring'
  },
  recurringFrequency: {
    type: DataTypes.ENUM('monthly', 'weekly', 'biweekly', 'quarterly', 'yearly'),
    field: 'recurring_frequency'
  }
}, {
  tableName: 'incomes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Income;