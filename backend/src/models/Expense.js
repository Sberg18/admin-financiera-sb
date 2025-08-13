const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
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
  creditCardId: {
    type: DataTypes.INTEGER,
    field: 'credit_card_id',
    comment: 'ID de tarjeta (crédito o débito)'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'expense_date'
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'payment_date'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card'),
    allowNull: false,
    field: 'payment_method'
  },
  installments: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 60
    }
  },
  currentInstallment: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'current_installment'
  },
  installmentAmount: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'installment_amount'
  },
  type: {
    type: DataTypes.ENUM('fixed', 'variable'),
    defaultValue: 'variable',
    allowNull: false,
    comment: 'Tipo de gasto: fijo o variable'
  }
}, {
  tableName: 'expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeCreate: (expense) => {
      // Para cuotas, installmentAmount es igual al amount (ya viene calculado)
      // Para pagos únicos, installmentAmount es igual al amount total
      if (!expense.installmentAmount) {
        expense.installmentAmount = expense.amount;
      }
    }
  }
});

module.exports = Expense;