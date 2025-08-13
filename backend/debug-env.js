require('dotenv').config();

console.log('=== DEBUG VARIABLES DE ENTORNO ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);

console.log('\n=== TESTING SEQUELIZE CONNECTION ===');
const sequelize = require('./src/config/database');

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Usuarios en la base:', results[0].count);
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
};

testConnection();