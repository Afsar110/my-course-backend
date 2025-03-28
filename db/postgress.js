const { Sequelize } = require('sequelize');

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

function loadModels() {
  const models = {};
  const modelsDir = path.join(__dirname, '../models');
  fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.model.js'))
    .forEach(file => {
      const modelFactory = require(path.join(modelsDir, file));
      const model = modelFactory(sequelize);
      models[model.name] = model;
    });

  Object.keys(models).forEach(modelName => {
    if (typeof models[modelName].associate === 'function') {
      models[modelName].associate(models);
    }
  });

  return models;
}


async function connectToPostgres() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Postgres has been established successfully.');

    // Load all models and attach them to the sequelize instance
    const models = loadModels();
    sequelize.models = models;
    
    // Optionally, if you need to sync your models:
    await sequelize.sync( process.env.NODE_ENV=== 'development' ? {force: true} :  {alter:false}  ); // or { force: true } in development

  } catch (error) {
    console.error('Unable to connect to the Postgres database:', error);
  }
}

connectToPostgres();

module.exports = sequelize;
