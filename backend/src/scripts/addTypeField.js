require('dotenv').config();
const sequelize = require('../config/database');

const addTypeField = async () => {
  try {
    console.log('🔧 Iniciando migración para agregar campo tipo (fijo/variable)...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Verificar si ya existe la columna en expenses
    const [expenseColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' 
      AND column_name = 'type'
    `);

    if (expenseColumns.length === 0) {
      console.log('🔄 Agregando campo tipo a tabla expenses...');
      
      // Crear enum si no existe
      await sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE expense_type_enum AS ENUM ('fixed', 'variable');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Agregar columna a expenses
      await sequelize.query(`
        ALTER TABLE expenses 
        ADD COLUMN type expense_type_enum DEFAULT 'variable'
      `);

      // Actualizar gastos existentes como variables por defecto
      await sequelize.query(`
        UPDATE expenses 
        SET type = 'variable' 
        WHERE type IS NULL
      `);

      console.log('✅ Campo tipo agregado exitosamente a expenses');
    } else {
      console.log('ℹ️ La columna tipo ya existe en expenses');
    }

    // Verificar si ya existe la columna en incomes
    const [incomeColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'incomes' 
      AND column_name = 'type'
    `);

    if (incomeColumns.length === 0) {
      console.log('🔄 Agregando campo tipo a tabla incomes...');
      
      // Crear enum si no existe
      await sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE income_type_enum AS ENUM ('fixed', 'variable');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Agregar columna a incomes
      await sequelize.query(`
        ALTER TABLE incomes 
        ADD COLUMN type income_type_enum DEFAULT 'variable'
      `);

      // Actualizar ingresos existentes como variables por defecto
      await sequelize.query(`
        UPDATE incomes 
        SET type = 'variable' 
        WHERE type IS NULL
      `);

      console.log('✅ Campo tipo agregado exitosamente a incomes');
    } else {
      console.log('ℹ️ La columna tipo ya existe en incomes');
    }

    console.log('✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  addTypeField()
    .then(() => {
      console.log('\n🎉 Migración completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = addTypeField;