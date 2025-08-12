const sequelize = require('../config/database');

const runMigration = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    console.log('🔄 Verificando si existe el campo card_mode...');
    
    // Verificar si la columna existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'credit_cards' 
      AND column_name = 'card_mode'
    `);
    
    if (results.length === 0) {
      console.log('🔄 Campo card_mode no existe, agregándolo...');
      
      // Agregar la columna
      await sequelize.query(`
        ALTER TABLE credit_cards 
        ADD COLUMN card_mode VARCHAR(10) DEFAULT 'credit'
        CHECK (card_mode IN ('credit', 'debit'))
      `);
      
      // Actualizar tarjetas existentes
      await sequelize.query(`
        UPDATE credit_cards 
        SET card_mode = 'credit' 
        WHERE card_mode IS NULL
      `);
      
      console.log('✅ Campo card_mode agregado exitosamente');
    } else {
      console.log('✅ Campo card_mode ya existe');
    }
    
    console.log('🔄 Verificando estructura de la tabla...');
    const [tableInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'credit_cards'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de credit_cards:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    console.log('✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Solo ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error en script:', error);
      process.exit(1);
    });
}

module.exports = runMigration;