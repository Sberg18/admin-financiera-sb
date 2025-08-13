const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('firstName')
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('lastName')
    .notEmpty()
    .withMessage('El apellido es requerido')
], authController.register);

router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
], authController.login);

router.get('/profile', authMiddleware, authController.getProfile);

router.put('/profile', authMiddleware, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('El nombre no puede estar vacío'),
  body('address')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\s\d\-\(\)]*$/)
    .withMessage('Formato de teléfono inválido'),
  body('profileImage')
    .optional()
    .custom((value) => {
      if (value && !value.startsWith('data:image/')) {
        throw new Error('Formato de imagen inválido');
      }
      return true;
    })
], authController.updateProfile);

router.put('/change-password', authMiddleware, [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], authController.changePassword);

module.exports = router;