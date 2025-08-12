const express = require('express');
const { body } = require('express-validator');
const onboardingController = require('../controllers/onboardingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Obtener datos para configuración inicial
router.get('/banks', onboardingController.getBanks);
router.get('/asset-types', onboardingController.getAssetTypes);
router.get('/status', onboardingController.getOnboardingStatus);

// Gestión de tarjetas de crédito
router.post('/credit-cards', [
  body('bankId')
    .isInt({ min: 1 })
    .withMessage('Debe seleccionar un banco válido'),
  body('cardTypeId')
    .isInt({ min: 1 })
    .withMessage('Debe seleccionar un tipo de tarjeta válido'),
  body('cardName')
    .notEmpty()
    .withMessage('El nombre de la tarjeta es requerido'),
  body('lastFourDigits')
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('Deben ser 4 dígitos'),
  body('closingDay')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 31 })
    .withMessage('Día de cierre debe estar entre 1 y 31'),
  body('paymentDay')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 31 })
    .withMessage('Día de pago debe estar entre 1 y 31'),
  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El límite de crédito debe ser positivo')
], onboardingController.addCreditCard);

router.get('/credit-cards', onboardingController.getCreditCards);

router.put('/credit-cards/:id', [
  body('closingDay')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 31 })
    .withMessage('Día de cierre debe estar entre 1 y 31'),
  body('paymentDay')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 31 })
    .withMessage('Día de pago debe estar entre 1 y 31')
], onboardingController.updateCreditCard);

router.delete('/credit-cards/:id', onboardingController.deleteCreditCard);

// Gestión de activos
router.post('/assets', [
  body('assetTypeId')
    .isInt({ min: 1 })
    .withMessage('Debe seleccionar un tipo de activo válido'),
  body('name')
    .notEmpty()
    .withMessage('El nombre del activo es requerido'),
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('La cantidad debe ser positiva'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio de compra debe ser positivo'),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio actual debe ser positivo'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La moneda debe ser de 3 caracteres')
], onboardingController.addAsset);

router.get('/assets', onboardingController.getUserAssets);

// Completar onboarding
router.post('/complete', onboardingController.completeOnboarding);

module.exports = router;