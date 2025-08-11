const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetType = sequelize.define('AssetType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('stocks', 'bonds', 'crypto', 'currency', 'savings'),
    allowNull: false
  }
}, {
  tableName: 'asset_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AssetType;