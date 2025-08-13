const sequelize = require('../config/database');
const { safeAddColumn } = require('./safeSequelize');

const autoMigrateUserFields = async () => {
  try {
    console.log('🔍 Verificando schema de usuarios...');
    
    // Agregar campos de forma segura
    const fieldsToAdd = [
      { name: 'address', type: 'TEXT' },
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'profile_image', type: 'TEXT' }
    ];
    
    let fieldsAdded = 0;
    
    for (const field of fieldsToAdd) {
      const success = await safeAddColumn(sequelize, 'users', field.name, field.type);
      if (success) fieldsAdded++;
    }
    
    if (fieldsAdded > 0) {
      console.log('🎉 Migración automática de campos de usuario completada');
    } else {
      console.log('✅ Todos los campos de usuario ya están presentes');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en migración automática:', error.message);
    // No lanzar error para no romper el inicio del servidor
    return false;
  }
};

module.exports = { autoMigrateUserFields };