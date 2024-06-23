const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chat2',
  password: 'Passw0rd',
  port: 5432, //  Стандартный порт для PostgreSQL
});

module.exports = pool;

