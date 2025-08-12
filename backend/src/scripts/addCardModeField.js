const sequelize = require('../config/database');

const addCardModeField = async () => {
  try {
    console.log('🔄 Agregando campo cardMode a tabla credit_cards...');
    
    // Agregar la columna si no existe
    await sequelize.query(`
      ALTER TABLE credit_cards 
      ADD COLUMN IF NOT EXISTS card_mode VARCHAR(10) DEFAULT 'credit'
      CHECK (card_mode IN ('credit', 'debit'))
    `);
    
    // Actualizar tarjetas existentes para que tengan cardMode = 'credit'
    await sequelize.query(`
      UPDATE credit_cards 
      SET card_mode = 'credit' 
      WHERE card_mode IS NULL
    `);

    console.log('✅ Campo card_mode agregado exitosamente');
    console.log('✅ Tarjetas existentes configuradas como crédito');
    
  } catch (error) {
    console.error('❌ Error agregando campo card_mode:', error);
    throw error;
  }
};

// Solo ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('🔗 Conectado a la base de datos');
      return addCardModeField();
    })
    .then(() => {
      console.log('🎉 Migración completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = addCardModeField;