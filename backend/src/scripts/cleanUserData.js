const sequelize = require('../config/database');
const { User } = require('../models');

const cleanUserData = async (userEmail, dataType, confirmClean = false) => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    if (!userEmail || !dataType) {
      console.log('❌ Error: Faltan parámetros');
      console.log('📖 Uso: node cleanUserData.js usuario@email.com [expenses|incomes|cards|assets|all] [confirm]');
      console.log('📖 Tipos disponibles:');
      console.log('   - expenses: Solo gastos');
      console.log('   - incomes: Solo ingresos'); 
      console.log('   - cards: Solo tarjetas');
      console.log('   - assets: Solo activos');
      console.log('   - all: Todos los datos (mantiene usuario)');
      return;
    }
    
    // Buscar el usuario
    const user = await User.findOne({ where: { email: userEmail } });
    
    if (!user) {
      console.log(`❌ Usuario con email "${userEmail}" no encontrado`);
      return;
    }
    
    console.log(`\n👤 Usuario: ${user.email} (ID: ${user.id})`);
    
    const validTypes = ['expenses', 'incomes', 'cards', 'assets', 'all'];
    if (!validTypes.includes(dataType)) {
      console.log(`❌ Tipo de datos inválido: ${dataType}`);
      console.log(`✅ Tipos válidos: ${validTypes.join(', ')}`);
      return;
    }
    
    // Contar datos actuales
    const counts = {};
    
    if (dataType === 'expenses' || dataType === 'all') {
      const [expenseCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM expenses WHERE user_id = ?',
        { replacements: [user.id] }
      );
      counts.expenses = expenseCount[0].count;
    }
    
    if (dataType === 'incomes' || dataType === 'all') {
      const [incomeCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM incomes WHERE user_id = ?',
        { replacements: [user.id] }
      );
      counts.incomes = incomeCount[0].count;
    }
    
    if (dataType === 'cards' || dataType === 'all') {
      const [cardCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM credit_cards WHERE user_id = ?',
        { replacements: [user.id] }
      );
      counts.cards = cardCount[0].count;
    }
    
    if (dataType === 'assets' || dataType === 'all') {
      const [assetCount] = await sequelize.query(
        'SELECT COUNT(*) as count FROM user_assets WHERE user_id = ?',
        { replacements: [user.id] }
      );
      counts.assets = assetCount[0].count;
    }
    
    console.log(`\n📋 Datos a limpiar:`);
    Object.entries(counts).forEach(([type, count]) => {
      const emoji = {
        expenses: '💸',
        incomes: '💰', 
        cards: '💳',
        assets: '📈'
      }[type] || '📄';
      console.log(`   ${emoji} ${type}: ${count} registros`);
    });
    
    if (!confirmClean) {
      console.log(`\n⚠️  MODO PREVIEW - No se eliminará nada`);
      console.log(`📖 Para confirmar la limpieza, ejecuta:`);
      console.log(`   node cleanUserData.js ${userEmail} ${dataType} confirm`);
      return;
    }
    
    console.log(`\n🧹 LIMPIANDO DATOS DE ${userEmail}...`);
    
    // Iniciar transacción
    const transaction = await sequelize.transaction();
    
    try {
      if (dataType === 'expenses' || dataType === 'all') {
        console.log('🔄 Eliminando gastos...');
        await sequelize.query('DELETE FROM expenses WHERE user_id = ?', {
          replacements: [user.id],
          transaction
        });
      }
      
      if (dataType === 'incomes' || dataType === 'all') {
        console.log('🔄 Eliminando ingresos...');
        await sequelize.query('DELETE FROM incomes WHERE user_id = ?', {
          replacements: [user.id],
          transaction
        });
      }
      
      if (dataType === 'cards' || dataType === 'all') {
        console.log('🔄 Eliminando tarjetas...');
        await sequelize.query('DELETE FROM credit_cards WHERE user_id = ?', {
          replacements: [user.id],
          transaction
        });
      }
      
      if (dataType === 'assets' || dataType === 'all') {
        console.log('🔄 Eliminando activos...');
        await sequelize.query('DELETE FROM user_assets WHERE user_id = ?', {
          replacements: [user.id],
          transaction
        });
      }
      
      if (dataType === 'all') {
        console.log('🔄 Eliminando categorías personalizadas...');
        await sequelize.query('DELETE FROM expense_categories WHERE user_id = ?', {
          replacements: [user.id],
          transaction
        });
        
        await sequelize.query('DELETE FROM income_categories WHERE user_id = ?', {
          replacements: [user.id],
          transaction
        });
      }
      
      await transaction.commit();
      
      console.log(`\n✅ Datos limpiados exitosamente para ${userEmail}`);
      console.log(`👤 El usuario se mantiene activo`);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Obtener argumentos de línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  const userEmail = args[0];
  const dataType = args[1];
  const confirmClean = args[2] === 'confirm';
  
  cleanUserData(userEmail, dataType, confirmClean)
    .then(() => {
      console.log('\n🎉 Operación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en operación:', error);
      process.exit(1);
    });
}

module.exports = cleanUserData;