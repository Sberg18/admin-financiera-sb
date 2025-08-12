const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreditCard = sequelize.define('CreditCard', {
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
  bankId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'bank_id'
  },
  cardTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'card_type_id'
  },
  lastFourDigits: {
    type: DataTypes.STRING(4),
    field: 'last_four_digits'
  },
  cardName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'card_name'
  },
  closingDay: {
    type: DataTypes.INTEGER,
    defaultValue: 31,
    field: 'closing_day',
    validate: {
      min: 1,
      max: 31
    }
  },
  paymentDay: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'payment_day',
    validate: {
      min: 1,
      max: 31
    }
  },
  creditLimit: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'credit_limit'
  },
  cardMode: {
    type: DataTypes.ENUM('credit', 'debit'),
    defaultValue: 'credit',
    field: 'card_mode'
  }
}, {
  tableName: 'credit_cards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CreditCard;