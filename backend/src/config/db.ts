import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Create a connection pool (allows multiple people to connect at once)
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Connected Successfully!");
    client.release();
  } catch (err) {
    console.error("❌ Database Connection Failed:", err);
    process.exit(1);
  }
};

export default pool;
