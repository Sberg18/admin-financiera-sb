const User = require('./User');
const Bank = require('./Bank');
const CardType = require('./CardType');
const CreditCard = require('./CreditCard');
const Expense = require('./Expense');
const Income = require('./Income');
const ExpenseCategory = require('./ExpenseCategory');
const IncomeCategory = require('./IncomeCategory');
const UserAsset = require('./UserAsset');
const AssetType = require('./AssetType');
const UserSettings = require('./UserSettings');

User.hasMany(CreditCard, { foreignKey: 'userId', as: 'creditCards' });
CreditCard.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Bank.hasMany(CreditCard, { foreignKey: 'bankId', as: 'creditCards' });
CreditCard.belongsTo(Bank, { foreignKey: 'bankId', as: 'bank' });

CardType.hasMany(CreditCard, { foreignKey: 'cardTypeId', as: 'creditCards' });
CreditCard.belongsTo(CardType, { foreignKey: 'cardTypeId', as: 'cardType' });

User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Income, { foreignKey: 'userId', as: 'incomes' });
Income.belongsTo(User, { foreignKey: 'userId', as: 'user' });

CreditCard.hasMany(Expense, { foreignKey: 'creditCardId', as: 'expenses' });
Expense.belongsTo(CreditCard, { foreignKey: 'creditCardId', as: 'creditCard' });

User.hasMany(UserAsset, { foreignKey: 'userId', as: 'assets' });
UserAsset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

AssetType.hasMany(UserAsset, { foreignKey: 'assetTypeId', as: 'userAssets' });
UserAsset.belongsTo(AssetType, { foreignKey: 'assetTypeId', as: 'assetType' });

User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ExpenseCategory.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Expense.belongsTo(ExpenseCategory, { foreignKey: 'categoryId', as: 'category' });

IncomeCategory.hasMany(Income, { foreignKey: 'categoryId', as: 'incomes' });
Income.belongsTo(IncomeCategory, { foreignKey: 'categoryId', as: 'category' });

module.exports = {
  User,
  Bank,
  CardType,
  CreditCard,
  Expense,
  Income,
  ExpenseCategory,
  IncomeCategory,
  UserAsset,
  AssetType,
  UserSettings
};