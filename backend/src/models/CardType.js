const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CardType = sequelize.define('CardType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'card_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CardType;