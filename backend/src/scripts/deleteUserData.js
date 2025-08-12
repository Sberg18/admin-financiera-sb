const sequelize = require('../config/database');
const { User } = require('../models');

const deleteUserData = async (userEmail, confirmDelete = false) => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    if (!userEmail) {
      console.log('❌ Error: Debes proporcionar un email de usuario');
      console.log('📖 Uso: node deleteUserData.js usuario@email.com [confirm]');
      return;
    }
    
    // Buscar el usuario
    const user = await User.findOne({ where: { email: userEmail } });
    
    if (!user) {
      console.log(`❌ Usuario con email "${userEmail}" no encontrado`);
      return;
    }
    
    console.log(`\n👤 Usuario encontrado:`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🆔 ID: ${user.id}`);
    console.log(`   📅 Registrado: ${user.createdAt.toISOString().split('T')[0]}`);
    
    // Contar datos antes de borrar
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
    
    const [categoryCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM expense_categories WHERE user_id = ?',
      { replacements: [user.id] }
    );
    
    const [incomeCategoryCount] = await sequelize.query(
      'SELECT COUNT(*) as count FROM income_categories WHERE user_id = ?',
      { replacements: [user.id] }
    );
    
    console.log(`\n📋 Datos a eliminar:`);
    console.log(`   💸 Gastos: ${expenseCount[0].count}`);
    console.log(`   💰 Ingresos: ${incomeCount[0].count}`);
    console.log(`   💳 Tarjetas: ${cardCount[0].count}`);
    console.log(`   📈 Activos: ${assetCount[0].count}`);
    console.log(`   🏷️  Categorías de gastos: ${categoryCount[0].count}`);
    console.log(`   🏷️  Categorías de ingresos: ${incomeCategoryCount[0].count}`);
    
    if (!confirmDelete) {
      console.log(`\n⚠️  MODO PREVIEW - No se eliminará nada`);
      console.log(`📖 Para confirmar la eliminación, ejecuta:`);
      console.log(`   node deleteUserData.js ${userEmail} confirm`);
      return;
    }
    
    console.log(`\n🚨 ELIMINANDO DATOS DE ${userEmail}...`);
    
    // Iniciar transacción
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar en orden (por dependencias de foreign keys)
      console.log('🔄 Eliminando gastos...');
      await sequelize.query('DELETE FROM expenses WHERE user_id = ?', {
        replacements: [user.id],
        transaction
      });
      
      console.log('🔄 Eliminando ingresos...');
      await sequelize.query('DELETE FROM incomes WHERE user_id = ?', {
        replacements: [user.id],
        transaction
      });
      
      console.log('🔄 Eliminando tarjetas...');
      await sequelize.query('DELETE FROM credit_cards WHERE user_id = ?', {
        replacements: [user.id],
        transaction
      });
      
      console.log('🔄 Eliminando activos...');
      await sequelize.query('DELETE FROM user_assets WHERE user_id = ?', {
        replacements: [user.id],
        transaction
      });
      
      console.log('🔄 Eliminando categorías personalizadas...');
      await sequelize.query('DELETE FROM expense_categories WHERE user_id = ?', {
        replacements: [user.id],
        transaction
      });
      
      await sequelize.query('DELETE FROM income_categories WHERE user_id = ?', {
        replacements: [user.id],
        transaction
      });
      
      console.log('🔄 Eliminando configuración de usuario...');
      await sequelize.query('DELETE FROM user_settings WHERE user_id = ?', {
        replacements: [user.id],
        transaction
      });
      
      console.log('🔄 Eliminando usuario...');
      await sequelize.query('DELETE FROM users WHERE id = ?', {
        replacements: [user.id],
        transaction
      });
      
      await transaction.commit();
      
      console.log(`\n✅ Usuario ${userEmail} y todos sus datos han sido eliminados exitosamente`);
      
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
  const confirmDelete = args[1] === 'confirm';
  
  deleteUserData(userEmail, confirmDelete)
    .then(() => {
      console.log('\n🎉 Operación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en operación:', error);
      process.exit(1);
    });
}

module.exports = deleteUserData;