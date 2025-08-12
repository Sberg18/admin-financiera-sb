const { validationResult } = require('express-validator');
const { Expense, CreditCard, Bank, CardType } = require('../models');
const { Op } = require('sequelize');

const calculatePaymentDate = (expenseDate, paymentMethod, creditCard) => {
  if (paymentMethod === 'cash' || (paymentMethod === 'debit_card' && (!creditCard || creditCard.cardMode === 'debit'))) {
    // Para efectivo y débito, la fecha de pago es la misma que la fecha de gasto
    return expenseDate;
  }
  
  if (paymentMethod !== 'credit_card' || !creditCard) {
    return expenseDate;
  }

  const expenseDateObj = new Date(expenseDate);
  const closingDay = creditCard.closingDay || 31;
  const paymentDay = creditCard.paymentDay || 10;
  
  // Si el gasto es después del cierre del mes, se va al siguiente ciclo
  if (expenseDateObj.getDate() > closingDay) {
    // Siguiente mes para el cierre
    const nextMonth = new Date(expenseDateObj.getFullYear(), expenseDateObj.getMonth() + 2, paymentDay);
    return nextMonth.toISOString().split('T')[0];
  } else {
    // Mes siguiente al del gasto
    const nextMonth = new Date(expenseDateObj.getFullYear(), expenseDateObj.getMonth() + 1, paymentDay);
    return nextMonth.toISOString().split('T')[0];
  }
};

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

    let creditCard = null;
    if ((req.body.paymentMethod === 'credit_card' || req.body.paymentMethod === 'debit_card') && req.body.creditCardId) {
      creditCard = await CreditCard.findByPk(req.body.creditCardId, {
        include: [
          { model: Bank, as: 'bank' },
          { model: CardType, as: 'cardType' }
        ]
      });
    }

    const expenseData = {
      ...req.body,
      userId: req.user.id,
      paymentDate: calculatePaymentDate(req.body.expenseDate, req.body.paymentMethod, creditCard)
    };

    if (expenseData.paymentMethod === 'credit_card' && expenseData.installments > 1) {
      const expenses = [];
      const installmentAmount = (expenseData.amount / expenseData.installments).toFixed(2);
      
      for (let i = 1; i <= expenseData.installments; i++) {
        // La fecha de compra siempre es la misma (expenseDate original)
        // Solo calculamos diferentes fechas de vencimiento
        const basePaymentDate = calculatePaymentDate(expenseData.expenseDate, expenseData.paymentMethod, creditCard);
        const installmentPaymentDate = new Date(basePaymentDate);
        installmentPaymentDate.setMonth(installmentPaymentDate.getMonth() + (i - 1));
        
        expenses.push(await Expense.create({
          ...expenseData,
          amount: installmentAmount, // Usar el monto de la cuota, no el total
          currentInstallment: i,
          expenseDate: expenseData.expenseDate, // Fecha de compra original
          paymentDate: installmentPaymentDate.toISOString().split('T')[0], // Fecha de vencimiento calculada
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
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      sql: error.sql || 'No SQL',
      original: error.original || 'No original error'
    });
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { month, year, startDate, endDate, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = { userId: req.user.id };
    
    // Filtro por mes y año específico
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      
      // Para tarjetas de crédito, filtramos por paymentDate
      // Para efectivo/débito, por expenseDate
      whereClause[Op.or] = [
        {
          paymentMethod: 'credit_card',
          paymentDate: {
            [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
          }
        },
        {
          paymentMethod: { [Op.in]: ['cash', 'debit_card'] },
          expenseDate: {
            [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
          }
        }
      ];
    }
    // Filtro por rango de fechas
    else if (startDate && endDate) {
      whereClause[Op.or] = [
        {
          paymentMethod: 'credit_card',
          paymentDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        {
          paymentMethod: { [Op.in]: ['cash', 'debit_card'] },
          expenseDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      ];
    }
    // Si no hay filtros, mostrar los últimos 3 meses por defecto
    else if (!month && !year && !startDate && !endDate) {
      const today = new Date();
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      whereClause[Op.or] = [
        {
          paymentMethod: 'credit_card',
          paymentDate: {
            [Op.gte]: threeMonthsAgo.toISOString().split('T')[0]
          }
        },
        {
          paymentMethod: { [Op.in]: ['cash', 'debit_card'] },
          expenseDate: {
            [Op.gte]: threeMonthsAgo.toISOString().split('T')[0]
          }
        }
      ];
    }

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CreditCard,
          as: 'creditCard',
          include: [
            { model: Bank, as: 'bank' },
            { model: CardType, as: 'cardType' }
          ]
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

const updateExpense = async (req, res) => {
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

    let creditCard = null;
    if ((req.body.paymentMethod === 'credit_card' || req.body.paymentMethod === 'debit_card') && req.body.creditCardId) {
      creditCard = await CreditCard.findByPk(req.body.creditCardId, {
        include: [
          { model: Bank, as: 'bank' },
          { model: CardType, as: 'cardType' }
        ]
      });
    }

    const updateData = {
      ...req.body,
      paymentDate: calculatePaymentDate(
        req.body.expenseDate || expense.expenseDate, 
        req.body.paymentMethod || expense.paymentMethod, 
        creditCard
      )
    };

    await expense.update(updateData);

    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};