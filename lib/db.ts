import { Pool } from 'pg';

let pool: Pool;

// ตรวจสอบและโหลด DATABASE_URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('กรุณาตั้งค่า DATABASE_URL ในไฟล์ env ของคุณ');
}

// ในโหมด Development ของ Next.js, ให้ใช้ global variable เพื่อป้องกันการสร้าง Pool ใหม่ทุกครั้งที่บันทึกโค้ด (Hot Reload)
const globalForPg = global as unknown as { pgPool?: Pool };

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
  });
} else {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString,
    });
  }
  pool = globalForPg.pgPool;
}

export default pool;
export { pool };
