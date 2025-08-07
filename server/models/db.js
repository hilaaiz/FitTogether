const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let db;

async function initDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log(" Connected to MySQL");
  } catch (err) {
    console.error(" DB connection error:", err);
  }
}

initDB();

module.exports = {
  query: (...args) => db.query(...args)
};