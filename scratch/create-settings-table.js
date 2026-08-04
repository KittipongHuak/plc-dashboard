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

    console.log('กำลังสร้างตาราง settings และเพิ่มค่าตั้งต้นสำหรับการอัปโหลด...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT INTO settings (key, value) VALUES
      ('allowed_extensions', '.hex,.bin,.sys,.txt,.zip,.rar,.config,.param'),
      ('max_file_size_mb', '50')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('✓ สร้างตาราง settings และกรอกข้อมูลตั้งต้นเสร็จเรียบร้อย!');
  } catch (err) {
    console.error('✗ เกิดข้อผิดพลาดในการติดตั้งตาราง settings:', err.message);
  } finally {
    await client.end();
  }
}

main();
