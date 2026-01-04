const { Sequelize } = require("sequelize");
require("dotenv").config();

// Support both POSTGRES_* and DB_* env var naming conventions and provide sensible defaults
const DB_NAME = process.env.DB_NAME || process.env.POSTGRES_DB || 'studyhour';
const DB_USER = process.env.DB_USER || process.env.POSTGRES_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || process.env.POSTGRES_PORT || 5432;

console.log(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT);

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
  // Only enable ssl when explicitly configured (useful for production)
  dialectOptions: process.env.POSTGRES_SSL === 'true' || process.env.DB_SSL === 'true' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  } : {},
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Postgres connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the Postgres database:", error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
