const { ExpenseCategory, IncomeCategory } = require('../models');

const getExpenseCategories = async (req, res) => {
  try {
    // Crear categoría "Sin Categoría" si no existe
    const [sinCategoriaExpense, created] = await ExpenseCategory.findOrCreate({
      where: { name: 'Sin Categoría', userId: null },
      defaults: { name: 'Sin Categoría', color: '#757575', userId: null }
    });

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
    // Crear categoría "Sin Categoría" si no existe
    const [sinCategoriaIncome, created] = await IncomeCategory.findOrCreate({
      where: { name: 'Sin Categoría', userId: null },
      defaults: { name: 'Sin Categoría', color: '#757575', userId: null }
    });

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

const updateExpenseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Buscar la categoría
    const category = await ExpenseCategory.findOne({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que no sea una categoría global (userId: null) o que sea del usuario
    if (category.userId !== null && category.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar esta categoría'
      });
    }

    // No permitir editar categorías globales como "Sin Categoría"
    if (category.userId === null) {
      return res.status(403).json({
        success: false,
        message: 'No se pueden editar las categorías del sistema'
      });
    }

    await category.update({ name, color });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      category
    });
  } catch (error) {
    console.error('Update expense category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const updateIncomeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Buscar la categoría
    const category = await IncomeCategory.findOne({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que no sea una categoría global (userId: null) o que sea del usuario
    if (category.userId !== null && category.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar esta categoría'
      });
    }

    // No permitir editar categorías globales como "Sin Categoría"
    if (category.userId === null) {
      return res.status(403).json({
        success: false,
        message: 'No se pueden editar las categorías del sistema'
      });
    }

    await category.update({ name, color });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      category
    });
  } catch (error) {
    console.error('Update income category error:', error);
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
  createIncomeCategory,
  updateExpenseCategory,
  updateIncomeCategory
};