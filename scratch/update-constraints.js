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

    console.log('กำลังรันการเปลี่ยนแปลง Foreign Key Constraints เพื่อเพิ่ม ON UPDATE CASCADE...');
    
    await client.query(`
      ALTER TABLE plc_files DROP CONSTRAINT IF EXISTS fk_machine;
      ALTER TABLE plc_files ADD CONSTRAINT fk_machine 
        FOREIGN KEY (machine_id) REFERENCES machines(id) 
        ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE plc_files DROP CONSTRAINT IF EXISTS fk_category;
      ALTER TABLE plc_files ADD CONSTRAINT fk_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log('✓ อัปเดต Constraints สำเร็จ! การแก้ไขรหัสเครื่องจักรและรหัสประเภทไฟล์จะอัปเดตข้อมูลไฟล์ที่อ้างอิงให้ทันที (Cascade Update)');
  } catch (err) {
    console.error('✗ เกิดข้อผิดพลาดในการอัปเดต Constraints:', err.message);
  } finally {
    await client.end();
  }
}

main();
