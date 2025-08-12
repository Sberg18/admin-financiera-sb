const sequelize = require('./src/config/database');

async function addPaymentDateColumn() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Agregar columna payment_date
    await sequelize.query(`
      ALTER TABLE expenses 
      ADD COLUMN payment_date DATE NULL AFTER expense_date;
    `);
    
    console.log('payment_date column added successfully');

    // Actualizar registros existentes
    await sequelize.query(`
      UPDATE expenses 
      SET payment_date = expense_date 
      WHERE payment_method IN ('cash', 'debit_card');
    `);

    console.log('Updated cash and debit card records');

    // Para tarjetas de crédito, calculamos las fechas de pago
    const creditCardExpenses = await sequelize.query(`
      SELECT e.id, e.expense_date, e.payment_method, cc.closing_day, cc.payment_day
      FROM expenses e
      LEFT JOIN credit_cards cc ON e.credit_card_id = cc.id
      WHERE e.payment_method = 'credit_card'
    `, { type: sequelize.QueryTypes.SELECT });

    for (const expense of creditCardExpenses) {
      const expenseDate = new Date(expense.expense_date);
      const closingDay = expense.closing_day || 31;
      const paymentDay = expense.payment_day || 10;

      let paymentDate;
      if (expenseDate.getDate() > closingDay) {
        // Siguiente mes para el cierre
        paymentDate = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 2, paymentDay);
      } else {
        // Mes siguiente al del gasto
        paymentDate = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, paymentDay);
      }

      await sequelize.query(`
        UPDATE expenses 
        SET payment_date = ? 
        WHERE id = ?
      `, { replacements: [paymentDate.toISOString().split('T')[0], expense.id] });
    }

    console.log('Updated credit card records with calculated payment dates');
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

addPaymentDateColumn();