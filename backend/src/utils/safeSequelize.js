// Utilidad para manejar operaciones de base de datos de forma segura durante migraciones

const safeQuery = async (sequelize, query, errorMessage = 'Error en consulta') => {
  try {
    return await sequelize.query(query);
  } catch (error) {
    console.log(`⚠️ ${errorMessage}:`, error.message);
    return null;
  }
};

const checkColumnExists = async (sequelize, tableName, columnName) => {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' AND column_name = '${columnName}';
    `);
    return results.length > 0;
  } catch (error) {
    console.log(`⚠️ Error verificando columna ${columnName}:`, error.message);
    return false;
  }
};

const safeAddColumn = async (sequelize, tableName, columnName, columnType) => {
  try {
    const exists = await checkColumnExists(sequelize, tableName, columnName);
    if (!exists) {
      await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      console.log(`✅ Columna ${columnName} agregada a ${tableName}`);
      return true;
    } else {
      console.log(`ℹ️ Columna ${columnName} ya existe en ${tableName}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error agregando columna ${columnName}:`, error.message);
    return false;
  }
};

module.exports = {
  safeQuery,
  checkColumnExists,
  safeAddColumn
};