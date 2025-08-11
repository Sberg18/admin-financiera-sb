const { validationResult } = require('express-validator');
const { Income } = require('../models');
const { Op } = require('sequelize');

const createIncome = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const income = await Income.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Ingreso creado exitosamente',
      income
    });
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getIncomes = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = { userId: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      whereClause.incomeDate = {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      };
    }

    const { count, rows: incomes } = await Income.findAndCountAll({
      where: whereClause,
      order: [['incomeDate', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      incomes,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get incomes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    
    const income = await Income.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Ingreso no encontrado'
      });
    }

    await income.destroy();

    res.json({
      success: true,
      message: 'Ingreso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createIncome,
  getIncomes,
  deleteIncome
};