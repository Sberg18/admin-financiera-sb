const { ExpenseCategory, IncomeCategory } = require('../models');

const getExpenseCategories = async (req, res) => {
  try {
    // Obtener categorías globales y del usuario
    const categories = await ExpenseCategory.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { userId: null }, // Categorías globales
          { userId: req.user.id } // Categorías del usuario
        ]
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getIncomeCategories = async (req, res) => {
  try {
    // Obtener categorías globales y del usuario
    const categories = await IncomeCategory.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { userId: null }, // Categorías globales
          { userId: req.user.id } // Categorías del usuario
        ]
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get income categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const createExpenseCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    const category = await ExpenseCategory.create({
      name,
      color,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Categoría de gasto creada exitosamente',
      category
    });
  } catch (error) {
    console.error('Create expense category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const createIncomeCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    const category = await IncomeCategory.create({
      name,
      color,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Categoría de ingreso creada exitosamente',
      category
    });
  } catch (error) {
    console.error('Create income category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getExpenseCategories,
  getIncomeCategories,
  createExpenseCategory,
  createIncomeCategory
};