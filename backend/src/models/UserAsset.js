const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAsset = sequelize.define('UserAsset', {
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
  assetTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'asset_type_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 0
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'purchase_price'
  },
  currentPrice: {
    type: DataTypes.DECIMAL(12, 2),
    field: 'current_price'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ARS'
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    field: 'purchase_date'
  }
}, {
  tableName: 'user_assets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserAsset;