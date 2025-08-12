const sequelize = require('../config/database');
const { User, Expense, Income, CreditCard, UserAsset } = require('../models');

const adminUsers = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // Obtener todos los usuarios con estadísticas
    console.log('\n📋 === USUARIOS REGISTRADOS ===');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`Total de usuarios: ${users.length}\n`);
    
    for (const user of users) {
      console.log(`👤 Usuario #${user.id}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📅 Registrado: ${user.createdAt.toISOString().split('T')[0]}`);
      
      // Contar datos de cada usuario
      const [expenseCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM expenses WHERE user_id = ?',
        { replacements: [user.id] }
      );
      
      const [incomeCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM incomes WHERE user_id = ?',
        { replacements: [user.id] }
      );
      
      const [cardCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM credit_cards WHERE user_id = ?',
        { replacements: [user.id] }
      );
      
      const [assetCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM user_assets WHERE user_id = ?',
        { replacements: [user.id] }
      );
      
      // Obtener totales de gastos e ingresos
      const [expenseTotal] = await sequelize.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?',
        { replacements: [user.id] }
      );
      
      const [incomeTotal] = await sequelize.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE user_id = ?',
        { replacements: [user.id] }
      );
      
      console.log(`   💸 Gastos: ${expenseCount[0].count} registros ($${parseFloat(expenseTotal[0].total).toLocaleString()})`);
      console.log(`   💰 Ingresos: ${incomeCount[0].count} registros ($${parseFloat(incomeTotal[0].total).toLocaleString()})`);
      console.log(`   💳 Tarjetas: ${cardCount[0].count}`);
      console.log(`   📈 Activos: ${assetCount[0].count}`);
      console.log('   ' + '─'.repeat(50));
    }
    
    // Estadísticas globales
    console.log('\n📊 === ESTADÍSTICAS GLOBALES ===');
    
    const [totalExpenses] = await sequelize.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM expenses');
    const [totalIncomes] = await sequelize.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM incomes');
    const [totalCards] = await sequelize.query('SELECT COUNT(*) as count FROM credit_cards');
    const [totalAssets] = await sequelize.query('SELECT COUNT(*) as count FROM user_assets');
    
    console.log(`Total gastos: ${totalExpenses[0].count} ($${parseFloat(totalExpenses[0].total).toLocaleString()})`);
    console.log(`Total ingresos: ${totalIncomes[0].count} ($${parseFloat(totalIncomes[0].total).toLocaleString()})`);
    console.log(`Total tarjetas: ${totalCards[0].count}`);
    console.log(`Total activos: ${totalAssets[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  adminUsers()
    .then(() => {
      console.log('\n🎉 Consulta completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en consulta:', error);
      process.exit(1);
    });
}

module.exports = adminUsers;