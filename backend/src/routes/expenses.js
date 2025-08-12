const express = require('express');
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0'),
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('expenseDate')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  body('paymentMethod')
    .isIn(['cash', 'credit_card', 'debit_card'])
    .withMessage('Método de pago inválido'),
  body('installments')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Las cuotas deben estar entre 1 y 60'),
  body('creditCardId')
    .if(body('paymentMethod').isIn(['credit_card', 'debit_card']))
    .notEmpty()
    .withMessage('La tarjeta es requerida para pagos con tarjeta')
], expenseController.createExpense);

router.get('/', expenseController.getExpenses);

router.put('/:id', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0'),
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('expenseDate')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  body('paymentMethod')
    .isIn(['cash', 'credit_card', 'debit_card'])
    .withMessage('Método de pago inválido'),
  body('installments')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Las cuotas deben estar entre 1 y 60'),
  body('creditCardId')
    .if(body('paymentMethod').isIn(['credit_card', 'debit_card']))
    .notEmpty()
    .withMessage('La tarjeta es requerida para pagos con tarjeta')
], expenseController.updateExpense);

router.delete('/:id', expenseController.deleteExpense);

module.exports = router;