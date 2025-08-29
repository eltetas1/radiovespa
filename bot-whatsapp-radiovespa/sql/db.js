// sql/db.js (ESM)
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from 'pg'
const { Pool } = pkg

// Carga .env por ruta absoluta (funciona aunque PM2 arranque en otro cwd)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// Usa SIEMPRE los PG_* (hemos quitado DATABASE_URL para evitar ambigüedades)
const config = {
  host: String(process.env.PG_HOST || 'localhost'),
  port: Number(process.env.PG_PORT || 5432),
  user: String(process.env.PG_USER || 'postgres'),
  password: String(process.env.PG_PASSWORD ?? ''),  // forzado a string
  database: String(process.env.PG_DATABASE || 'radiovespa'),
}

// Si estuvieras en un hosting que exige SSL, descomenta:
// config.ssl = { rejectUnauthorized: false }

const pool = new Pool(config)
pool.on('error', (err) => console.error('PG pool error:', err))

export default pool
export const q = (text, params) => pool.query(text, params)
