const express = require('express');
const { body } = require('express-validator');
const incomeController = require('../controllers/incomeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0'),
  body('description')
    .optional()
    .isString()
    .withMessage('La descripción debe ser texto'),
  body('incomeDate')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring debe ser verdadero o falso'),
  body('recurringFrequency')
    .if(body('isRecurring').equals(true))
    .isIn(['monthly', 'weekly', 'biweekly', 'quarterly', 'yearly'])
    .withMessage('Frecuencia de recurrencia inválida')
], incomeController.createIncome);

router.get('/', incomeController.getIncomes);

router.delete('/:id', incomeController.deleteIncome);

module.exports = router;