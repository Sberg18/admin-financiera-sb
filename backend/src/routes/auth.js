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

module.exports = router;