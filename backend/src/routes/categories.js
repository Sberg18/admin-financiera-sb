const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Rutas para categorías de gastos
router.get('/expenses', categoryController.getExpenseCategories);
router.post('/expenses', [
  body('name')
    .notEmpty()
    .withMessage('El nombre de la categoría es requerido'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('El color debe ser un código hexadecimal válido')
], categoryController.createExpenseCategory);

// Rutas para categorías de ingresos
router.get('/incomes', categoryController.getIncomeCategories);
router.post('/incomes', [
  body('name')
    .notEmpty()
    .withMessage('El nombre de la categoría es requerido'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('El color debe ser un código hexadecimal válido')
], categoryController.createIncomeCategory);

module.exports = router;