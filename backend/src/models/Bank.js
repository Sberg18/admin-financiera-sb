const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bank = sequelize.define('Bank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(50),
    defaultValue: 'Argentina'
  }
}, {
  tableName: 'banks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Bank;