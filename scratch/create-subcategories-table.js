const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let databaseUrl = 'postgresql://postgres:postgres@localhost:5432/postgres'; // Default fallback
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^DATABASE_URL=(.+)$/m);
  if (match && match[1]) {
    databaseUrl = match[1].trim();
  }
}

const client = new Client({
  connectionString: databaseUrl,
});

async function main() {
  try {
    await client.connect();
    console.log('✓ เชื่อมต่อฐานข้อมูลสำเร็จ!');

    console.log('กำลังสร้างตาราง subcategories และแก้ไขตาราง plc_files...');
    
    await client.query(`
      -- 1. สร้างตาราง subcategories
      CREATE TABLE IF NOT EXISTS subcategories (
        id VARCHAR(50) PRIMARY KEY,
        category_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- 2. เพิ่มคอลัมน์ subcategory_id ใน plc_files
      ALTER TABLE plc_files ADD COLUMN IF NOT EXISTS subcategory_id VARCHAR(50);

      -- 3. เพิ่ม FK Constraint ใน plc_files ชี้หา subcategories
      ALTER TABLE plc_files DROP CONSTRAINT IF EXISTS fk_subcategory;
      ALTER TABLE plc_files ADD CONSTRAINT fk_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log('✓ สร้างตาราง subcategories และอัปเดต FK Constraints ใน plc_files เสร็จเรียบร้อย!');
  } catch (err) {
    console.error('✗ เกิดข้อผิดพลาดในขั้นตอนฐานข้อมูล:', err.message);
  } finally {
    await client.end();
  }
}

main();
