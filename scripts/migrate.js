const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. อ่านไฟล์ .env.local จาก Root โฟลเดอร์
let databaseUrl = 'postgresql://postgres:postgres@localhost:5432/postgres'; // Default fallback
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^DATABASE_URL=(.+)$/m);
  if (match && match[1]) {
    databaseUrl = match[1].trim();
  }
}

console.log(`\x1b[36m[Database] กำลังทดลองเชื่อมต่อกับ: ${databaseUrl.replace(/:([^:@]+)@/, ':******@')}\x1b[0m`);

const client = new Client({
  connectionString: databaseUrl,
});

async function main() {
  try {
    // 2. เชื่อมต่อฐานข้อมูล
    await client.connect();
    console.log('\x1b[32m✓ เชื่อมต่อ PostgreSQL สำเร็จ!\x1b[0m');

    // 3. อ่านไฟล์ schema.sql จาก Root โฟลเดอร์
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`ไม่พบไฟล์ schema.sql ที่ ${schemaPath}`);
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('\x1b[36m[Database] กำลังสร้างตารางและ trigger จาก schema.sql...\x1b[0m');

    // 4. รัน SQL
    await client.query(sql);
    console.log('\x1b[32m✓ สร้างตาราง machines, categories, plc_files และ auto-increment version trigger เรียบร้อยแล้ว!\x1b[0m');

    // 5. ทดสอบ Query ดูว่าตารางพร้อมใช้งานไหม
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('machines', 'categories', 'plc_files');
    `);
    
    console.log('\x1b[33m\nตารางที่มีในระบบ:\x1b[0m');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

  } catch (err) {
    console.error('\x1b[31m✗ เกิดข้อผิดพลาด:\x1b[0m', err.message);
  } finally {
    await client.end();
  }
}

main();
