const { Sequelize } = require('sequelize');

// Crear conexión usando DATABASE_URL para producción
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    })
  : new Sequelize({
      database: process.env.DB_NAME || 'admin_financiera',
      username: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'admin123',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433,
      dialect: 'postgres',
      logging: console.log
    });

async function addCardModeColumn() {
  try {
    console.log('🔧 Iniciando migración para agregar columna card_mode...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Verificar si la columna ya existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'credit_cards' 
      AND column_name = 'card_mode'
    `);

    if (results.length > 0) {
      console.log('ℹ️ La columna card_mode ya existe');
      return;
    }

    // Crear el tipo ENUM si no existe
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_credit_cards_card_mode AS ENUM ('credit', 'debit');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Tipo ENUM creado o ya existía');

    // Agregar la columna con valor por defecto
    await sequelize.query(`
      ALTER TABLE credit_cards 
      ADD COLUMN card_mode enum_credit_cards_card_mode DEFAULT 'credit'
    `);
    console.log('✅ Columna card_mode agregada exitosamente');

    // Actualizar registros existentes para que tengan el valor 'credit'
    await sequelize.query(`
      UPDATE credit_cards 
      SET card_mode = 'credit' 
      WHERE card_mode IS NULL
    `);
    console.log('✅ Registros existentes actualizados');

    console.log('🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addCardModeColumn()
    .then(() => {
      console.log('✅ Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

module.exports = addCardModeColumn;