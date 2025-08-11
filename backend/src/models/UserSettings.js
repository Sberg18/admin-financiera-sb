const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSettings = sequelize.define('UserSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id'
  },
  onboardingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'onboarding_completed'
  },
  preferredCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ARS',
    field: 'preferred_currency'
  },
  showTutorial: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'show_tutorial'
  }
}, {
  tableName: 'user_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserSettings;