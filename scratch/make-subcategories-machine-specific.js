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

    console.log('กำลังทำตาราง subcategories ให้เป็นแบบเฉพาะของแต่ละเครื่องจักร...');
    
    await client.query(`
      -- 1. ลบคอลัมน์และ FK เก่า
      ALTER TABLE plc_files DROP COLUMN IF EXISTS subcategory_id CASCADE;
      DROP TABLE IF EXISTS subcategories CASCADE;

      -- 2. สร้างตาราง subcategories ใหม่ที่มี machine_id และรหัสย่อย (code)
      CREATE TABLE subcategories (
        id SERIAL PRIMARY KEY,
        machine_id VARCHAR(50) NOT NULL,
        category_id VARCHAR(50) NOT NULL,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (machine_id, category_id, code),
        CONSTRAINT fk_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      -- 3. เพิ่มคอลัมน์ subcategory_id ประเภท INTEGER ใน plc_files กลับมา
      ALTER TABLE plc_files ADD COLUMN subcategory_id INTEGER;

      -- 4. ตั้งค่า FK constraint
      ALTER TABLE plc_files DROP CONSTRAINT IF EXISTS fk_subcategory;
      ALTER TABLE plc_files ADD CONSTRAINT fk_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log('✓ สร้างตารางและตั้งค่าความสัมพันธ์ของหมวดหมู่ย่อยแบบ Machine-Specific สำเร็จ!');
  } catch (err) {
    console.error('✗ เกิดข้อผิดพลาดในการรัน SQL:', err.message);
  } finally {
    await client.end();
  }
}

main();
