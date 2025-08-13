require('dotenv').config();
const sequelize = require('../config/database');

const fixProductionDB = async () => {
  try {
    console.log('🚀 Iniciando reparación de base de datos de producción...');
    console.log(`📍 Conectando a: ${process.env.DATABASE_URL ? 'DATABASE_URL configurado' : 'Variables locales'}`);
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Obtener información actual de la tabla users
    console.log('🔍 Analizando tabla users...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas encontradas:');
    const existingColumns = [];
    columns.forEach(col => {
      console.log(`  ✓ ${col.column_name} (${col.data_type})`);
      existingColumns.push(col.column_name);
    });
    
    // Verificar y agregar campos faltantes
    const requiredFields = [
      { name: 'address', type: 'TEXT', description: 'Domicilio del usuario' },
      { name: 'phone', type: 'VARCHAR(20)', description: 'Teléfono del usuario' },
      { name: 'profile_image', type: 'TEXT', description: 'Imagen de perfil en base64' }
    ];
    
    let fieldsAdded = 0;
    
    for (const field of requiredFields) {
      if (!existingColumns.includes(field.name)) {
        console.log(`➕ Agregando campo: ${field.name} (${field.description})`);
        try {
          await sequelize.query(`ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`);
          console.log(`✅ Campo ${field.name} agregado correctamente`);
          fieldsAdded++;
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`ℹ️  Campo ${field.name} ya existe`);
          } else {
            console.error(`❌ Error agregando ${field.name}:`, error.message);
          }
        }
      } else {
        console.log(`✅ Campo ${field.name} ya existe`);
      }
    }
    
    // Verificar que los usuarios pueden cargarse correctamente
    console.log('🧪 Probando carga de usuarios...');
    const [users] = await sequelize.query(`
      SELECT id, email, first_name, last_name, address, phone, 
             CASE WHEN profile_image IS NOT NULL THEN 'SI' ELSE 'NO' END as has_profile_image
      FROM users 
      LIMIT 5
    `);
    
    console.log(`👥 Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}) - Imagen: ${user.has_profile_image}`);
    });
    
    // Verificar tablas relacionadas
    console.log('🔗 Verificando tablas relacionadas...');
    const tables = ['expenses', 'incomes', 'expense_categories', 'income_categories', 'credit_cards'];
    
    for (const table of tables) {
      try {
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ✅ ${table}: ${count[0].count} registros`);
      } catch (error) {
        console.log(`  ❌ ${table}: Error - ${error.message}`);
      }
    }
    
    if (fieldsAdded > 0) {
      console.log(`\n🎉 ¡Reparación completada! Se agregaron ${fieldsAdded} campos nuevos.`);
      console.log('🔄 Reinicia el servicio de Render para que tome los cambios.');
    } else {
      console.log('\n✅ La base de datos ya estaba actualizada correctamente.');
    }
    
    console.log('\n🚀 La aplicación debería funcionar correctamente ahora.');
    
  } catch (error) {
    console.error('❌ Error crítico durante la reparación:', error.message);
    console.error('Stack:', error.stack);
    
    // Sugerencias de solución
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que DATABASE_URL esté configurado en Render');
    console.log('2. Verificar que la base de datos PostgreSQL esté activa');
    console.log('3. Verificar permisos de la base de datos');
    console.log('4. Ejecutar manualmente en la consola de PostgreSQL:');
    console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
    console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);');
    console.log('   ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;');
    
    throw error;
  }
};

// También crear función para rollback si es necesario
const rollbackUserFields = async () => {
  try {
    console.log('🔄 Haciendo rollback de campos de usuario...');
    
    const fieldsToRemove = ['address', 'phone', 'profile_image'];
    
    for (const field of fieldsToRemove) {
      try {
        await sequelize.query(`ALTER TABLE users DROP COLUMN IF EXISTS ${field}`);
        console.log(`✅ Campo ${field} eliminado`);
      } catch (error) {
        console.log(`ℹ️  No se pudo eliminar ${field}: ${error.message}`);
      }
    }
    
    console.log('✅ Rollback completado');
  } catch (error) {
    console.error('❌ Error en rollback:', error.message);
  }
};

// Ejecutar según el comando
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rollback') {
    rollbackUserFields()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    fixProductionDB()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { fixProductionDB, rollbackUserFields };