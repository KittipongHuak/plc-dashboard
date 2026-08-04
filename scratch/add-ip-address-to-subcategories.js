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

    console.log('กำลังเพิ่มคอลัมน์ ip_address ในตาราง subcategories...');
    
    await client.query(`
      ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
    `);

    console.log('✓ เพิ่มคอลัมน์ ip_address สำเร็จ!');
  } catch (err) {
    console.error('✗ เกิดข้อผิดพลาดในการรัน SQL:', err.message);
  } finally {
    await client.end();
  }
}

main();
