require('dotenv').config();
const sequelize = require('../config/database');

const addUserProfileFields = async () => {
  try {
    console.log('Agregando campos de perfil a la tabla users...');
    
    // Agregar columna address
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address TEXT
    `);
    console.log('✅ Campo address agregado');

    // Agregar columna phone
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);
    console.log('✅ Campo phone agregado');

    // Agregar columna profileImage (para almacenar base64 o URL)
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image TEXT
    `);
    console.log('✅ Campo profile_image agregado');

    console.log('🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  addUserProfileFields()
    .then(() => {
      console.log('Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = addUserProfileFields;