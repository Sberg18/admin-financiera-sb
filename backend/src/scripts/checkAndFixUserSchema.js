require('dotenv').config();
const sequelize = require('../config/database');

const checkAndFixUserSchema = async () => {
  try {
    console.log('🔍 Verificando schema de la tabla users...');
    
    // Obtener información de la tabla
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas actuales en users:');
    results.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Verificar si faltan campos
    const existingColumns = results.map(col => col.column_name);
    const requiredColumns = ['address', 'phone', 'profile_image'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`❌ Faltan campos: ${missingColumns.join(', ')}`);
      console.log('🔧 Agregando campos faltantes...');
      
      // Agregar campos faltantes
      if (missingColumns.includes('address')) {
        await sequelize.query('ALTER TABLE users ADD COLUMN address TEXT');
        console.log('✅ Campo address agregado');
      }
      
      if (missingColumns.includes('phone')) {
        await sequelize.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
        console.log('✅ Campo phone agregado');
      }
      
      if (missingColumns.includes('profile_image')) {
        await sequelize.query('ALTER TABLE users ADD COLUMN profile_image TEXT');
        console.log('✅ Campo profile_image agregado');
      }
    } else {
      console.log('✅ Todos los campos necesarios están presentes');
    }
    
    // Verificar que la tabla funciona correctamente
    console.log('🧪 Probando consulta de usuarios...');
    const [users] = await sequelize.query('SELECT id, email, first_name, last_name FROM users LIMIT 3');
    console.log(`✅ Encontrados ${users.length} usuarios en la base de datos`);
    
    // Verificar que las rutas de auth existen
    console.log('🔄 Verificando conectividad...');
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos exitosa');
    
    console.log('🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    // Si hay errores específicos de columnas, intentar solucionarlos
    if (error.message.includes('column') || error.message.includes('does not exist')) {
      console.log('🔧 Intentando reparar schema...');
      try {
        await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT');
        await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
        await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT');
        console.log('✅ Schema reparado');
      } catch (repairError) {
        console.error('❌ No se pudo reparar:', repairError.message);
      }
    }
    
    throw error;
  }
};

// Función para verificar el estado general del sistema
const checkSystemHealth = async () => {
  try {
    console.log('\n🏥 Verificación de salud del sistema...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Base de datos conectada');
    
    // Verificar tablas principales
    const tables = await sequelize.showAllSchemas();
    console.log('📊 Esquemas disponibles:', tables.length);
    
    // Verificar usuarios
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total de usuarios: ${userCount[0].count}`);
    
    // Verificar gastos
    const [expenseCount] = await sequelize.query('SELECT COUNT(*) as count FROM expenses');
    console.log(`💸 Total de gastos: ${expenseCount[0].count}`);
    
    // Verificar ingresos
    const [incomeCount] = await sequelize.query('SELECT COUNT(*) as count FROM incomes');
    console.log(`💰 Total de ingresos: ${incomeCount[0].count}`);
    
    console.log('🎯 Sistema funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Problema en verificación de salud:', error.message);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  const runCheck = async () => {
    try {
      await checkAndFixUserSchema();
      await checkSystemHealth();
      console.log('\n✅ ¡Todo listo! El sistema debería funcionar correctamente.');
    } catch (error) {
      console.error('\n❌ Error crítico:', error.message);
      console.log('\n💡 Pasos para solucionar manualmente:');
      console.log('1. Verificar variables de entorno DATABASE_URL');
      console.log('2. Verificar que la base de datos esté accesible');
      console.log('3. Ejecutar: ALTER TABLE users ADD COLUMN address TEXT;');
      console.log('4. Ejecutar: ALTER TABLE users ADD COLUMN phone VARCHAR(20);');
      console.log('5. Ejecutar: ALTER TABLE users ADD COLUMN profile_image TEXT;');
    } finally {
      process.exit(0);
    }
  };
  
  runCheck();
}

module.exports = { checkAndFixUserSchema, checkSystemHealth };