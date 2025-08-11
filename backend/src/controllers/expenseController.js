const { validationResult } = require('express-validator');
const { Expense, CreditCard, Bank } = require('../models');
const { Op } = require('sequelize');

const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const expenseData = {
      ...req.body,
      userId: req.user.id
    };

    if (expenseData.paymentMethod === 'credit_card' && expenseData.installments > 1) {
      const expenses = [];
      const installmentAmount = (expenseData.amount / expenseData.installments).toFixed(2);
      
      for (let i = 1; i <= expenseData.installments; i++) {
        const installmentDate = new Date(expenseData.expenseDate);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
        
        expenses.push(await Expense.create({
          ...expenseData,
          currentInstallment: i,
          installmentAmount: installmentAmount,
          expenseDate: installmentDate.toISOString().split('T')[0],
          description: `${expenseData.description} (Cuota ${i}/${expenseData.installments})`
        }));
      }
      
      return res.status(201).json({
        success: true,
        message: `Gasto en ${expenseData.installments} cuotas creado exitosamente`,
        expenses
      });
    } else {
      const expense = await Expense.create(expenseData);
      
      res.status(201).json({
        success: true,
        message: 'Gasto creado exitosamente',
        expense
      });
    }
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = { userId: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      whereClause.expenseDate = {
        [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      };
    }

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CreditCard,
          as: 'creditCard',
          include: [{ model: Bank, as: 'bank' }]
        }
      ],
      order: [['expenseDate', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      expenses,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }

    await expense.destroy();

    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  deleteExpense
};