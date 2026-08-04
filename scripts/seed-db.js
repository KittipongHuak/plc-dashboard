const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// อ่านไฟล์ .env.local จากโฟลเดอร์หลัก (Root)
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

    console.log('กำลังเคลียร์ข้อมูลเก่า...');
    await client.query('TRUNCATE plc_files, machines, categories CASCADE;');

    console.log('กำลังใส่ข้อมูลตาราง machines...');
    await client.query(`
      INSERT INTO machines (id, name, description) VALUES
      ('M001', 'CNC Milling Machine A', 'เครื่องกัด CNC บริเวณ Line 1'),
      ('M002', 'Injection Molding B', 'เครื่องฉีดพลาสติกบริเวณ Line 2'),
      ('M003', 'Assembly Robot C', 'หุ่นยนต์ประกอบชิ้นส่วนอัตโนมัติ'),
      ('M004', 'Packaging Line D', 'ระบบจัดแพ็กและสายพานลำเลียงปลายสาย'),
      ('M005', 'Boiler System E', 'ระบบหม้อต้มความดันอุตสาหกรรม');
    `);

    console.log('กำลังใส่ข้อมูลตาราง categories...');
    await client.query(`
      INSERT INTO categories (id, name, description) VALUES
      ('CAT001', 'PLC Program', 'โปรแกรม PLC'),
      ('CAT002', 'HMI Project', 'โปรแกรม HMI'),
      ('CAT003', 'Safety Parameter', 'Safety PLC, Safety Controller, Safety Relay, Safety Configuration'),
      ('CAT004', 'Servo Parameter', 'Parameter ของ Servo Drive'),
      ('CAT005', 'Inverter Parameter', 'Parameter ของ Inverter (VFD)'),
      ('CAT006', 'Robot Program', 'โปรแกรม Robot');
    `);

    console.log('กำลังใส่ข้อมูลตาราง plc_files (ทดสอบ Auto Version Trigger)...');
    
    const files = [
      {
        machine_id: 'M001',
        category_id: 'CAT001',
        file_name: 'cnc_core_logic',
        file_extension: '.hex',
        file_size: 1248000,
        file_data: Buffer.from('PLC CNC Core Logic Data Version 1'),
        remark: 'รุ่นปรับปรุงช่วงต้นสัปดาห์ แก้ไขบั๊กท่อลม',
        upload_by: 'สมชาย รักดี',
        upload_date: '2026-07-28T09:00:00Z'
      },
      {
        machine_id: 'M001',
        category_id: 'CAT001',
        file_name: 'cnc_core_logic',
        file_extension: '.hex',
        file_size: 1255000,
        file_data: Buffer.from('PLC CNC Core Logic Data Version 2'),
        remark: 'ปรับแก้ความเร็วสปีดรอบมอเตอร์ในโหมดออโต้',
        upload_by: 'สมชาย รักดี',
        upload_date: '2026-07-29T14:30:00Z'
      },
      {
        machine_id: 'M002',
        category_id: 'CAT002',
        file_name: 'hmi_main_screen',
        file_extension: '.bin',
        file_size: 5480000,
        file_data: Buffer.from('HMI Main Screen Graphic Data'),
        remark: 'แก้ไขปุ่มกดและสีสเตตัสแจ้งเตือนฉุกเฉิน',
        upload_by: 'กิตติ ใจดี',
        upload_date: '2026-07-30T10:15:00Z'
      },
      {
        machine_id: 'M003',
        category_id: 'CAT003',
        file_name: 'safety_arm_stop',
        file_extension: '.sys',
        file_size: 102400,
        file_data: Buffer.from('Safety Robot Arm Configuration'),
        remark: 'ตั้งค่าระยะหยุดฉุกเฉินเซ็นเซอร์รอบตัวหุ่นยนต์',
        upload_by: 'วิชัย มั่นคง',
        upload_date: '2026-07-31T02:00:00Z'
      },
      {
        machine_id: 'M001',
        category_id: 'CAT001',
        file_name: 'cnc_core_logic',
        file_extension: '.hex',
        file_size: 1260000,
        file_data: Buffer.from('PLC CNC Core Logic Data Version 3'),
        remark: 'แก้ไขฟังก์ชันอินเตอร์ล็อกของเซ็นเซอร์ประตู',
        upload_by: 'สมชาย รักดี',
        upload_date: '2026-07-31T04:10:00Z'
      }
    ];

    for (const f of files) {
      await client.query(`
        INSERT INTO plc_files (
          machine_id, category_id, file_name, file_extension, 
          file_size, file_data, remark, upload_by, upload_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `, [
        f.machine_id, f.category_id, f.file_name, f.file_extension, 
        f.file_size, f.file_data, f.remark, f.upload_by, f.upload_date
      ]);
    }

    console.log('✓ ใส่ข้อมูลตัวอย่าง (Seed Data) เรียบร้อย!');

    const res = await client.query(`
      SELECT f.file_name, m.name as machine, f.version, f.upload_by, f.upload_date
      FROM plc_files f
      JOIN machines m ON f.machine_id = m.id
      ORDER BY f.upload_date ASC;
    `);

    console.log('\nตรวจสอบผลการรันเวอร์ชันอัตโนมัติ (Trigger):');
    res.rows.forEach(r => {
      console.log(`- ${r.file_name} | เครื่อง: ${r.machine} | เวอร์ชั่น: v${r.version} | โดย: ${r.upload_by} (${r.upload_date.toISOString()})`);
    });

  } catch (err) {
    console.error('✗ เกิดข้อผิดพลาดในการใส่ข้อมูล:', err.message);
  } finally {
    await client.end();
  }
}

main();
