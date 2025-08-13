require('dotenv').config();
const sequelize = require('../config/database');

const checkDbStatus = async () => {
  try {
    console.log('🔄 Verificando estado de la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // Verificar tablas principales
    const tables = [
      'users', 'banks', 'card_types', 'credit_cards', 
      'expense_categories', 'income_categories', 'expenses', 'incomes'
    ];
    
    for (const table of tables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Tabla ${table}: ${results[0].count} registros`);
      } catch (error) {
        console.log(`❌ Error en tabla ${table}: ${error.message}`);
      }
    }
    
    // Verificar estructura de credit_cards específicamente
    console.log('\n🔄 Verificando estructura de credit_cards...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'credit_cards'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas en credit_cards:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar si hay tarjetas existentes
    const [cards] = await sequelize.query('SELECT id, card_mode, card_name FROM credit_cards');
    console.log(`\n📋 Tarjetas existentes: ${cards.length}`);
    cards.forEach(card => {
      console.log(`  - ID: ${card.id}, Modo: ${card.card_mode || 'NULL'}, Nombre: ${card.card_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  checkDbStatus()
    .then(() => {
      console.log('\n🎉 Verificación completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en verificación:', error);
      process.exit(1);
    });
}

module.exports = checkDbStatus;