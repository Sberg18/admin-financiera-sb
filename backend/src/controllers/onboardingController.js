const { validationResult } = require('express-validator');
const { Bank, AssetType, UserSettings, CreditCard, UserAsset } = require('../models');

const getBanks = async (req, res) => {
  try {
    const banks = await Bank.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      banks
    });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getAssetTypes = async (req, res) => {
  try {
    const assetTypes = await AssetType.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    const groupedAssetTypes = assetTypes.reduce((groups, assetType) => {
      const category = assetType.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(assetType);
      return groups;
    }, {});

    res.json({
      success: true,
      assetTypes: groupedAssetTypes
    });
  } catch (error) {
    console.error('Get asset types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const addCreditCard = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const creditCard = await CreditCard.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Tarjeta de crédito agregada exitosamente',
      creditCard
    });
  } catch (error) {
    console.error('Add credit card error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getCreditCards = async (req, res) => {
  try {
    const creditCards = await CreditCard.findAll({
      where: { userId: req.user.id },
      include: [{ model: Bank, as: 'bank' }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      creditCards
    });
  } catch (error) {
    console.error('Get credit cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const addAsset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const asset = await UserAsset.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Activo agregado exitosamente',
      asset
    });
  } catch (error) {
    console.error('Add asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getUserAssets = async (req, res) => {
  try {
    const assets = await UserAsset.findAll({
      where: { userId: req.user.id },
      include: [{ model: AssetType, as: 'assetType' }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      assets
    });
  } catch (error) {
    console.error('Get user assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    const [userSettings] = await UserSettings.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        onboardingCompleted: true,
        showTutorial: false
      }
    });

    if (!userSettings.onboardingCompleted) {
      await userSettings.update({
        onboardingCompleted: true,
        showTutorial: false
      });
    }

    res.json({
      success: true,
      message: 'Onboarding completado exitosamente'
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getOnboardingStatus = async (req, res) => {
  try {
    const userSettings = await UserSettings.findOne({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      onboardingCompleted: userSettings?.onboardingCompleted || false,
      showTutorial: userSettings?.showTutorial !== false
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getBanks,
  getAssetTypes,
  addCreditCard,
  getCreditCards,
  addAsset,
  getUserAssets,
  completeOnboarding,
  getOnboardingStatus
};