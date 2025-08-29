import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Conexión a PostgreSQL usando variables de entorno (.env)
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "radiovespa",
  password: process.env.DB_PASS || "tu_password",
  port: process.env.DB_PORT || 5432,
});

// Función genérica para hacer queries
async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } catch (err) {
    console.error("❌ Error en query:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default {
  query,
  pool,
};
