-- Create database schema for PLC Software Management

-- 1. Create Machines Table (Optional reference table)
CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Categories Table (Optional reference table)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create PLC Files Table
CREATE TABLE IF NOT EXISTS plc_files (
    id SERIAL PRIMARY KEY,                      -- รหัสไฟล์ (File ID)
    machine_id VARCHAR(50) NOT NULL,            -- อ้างอิงเครื่องจักร (Machine Reference ID)
    category_id VARCHAR(50) NOT NULL,           -- ประเภทไฟล์ (File Category ID)
    version INTEGER NOT NULL DEFAULT 1,         -- เวอร์ชั่น (Auto)
    file_name VARCHAR(255) NOT NULL,            -- ชื่อไฟล์ (File Name)
    file_extension VARCHAR(10) NOT NULL,        -- นามสกุลไฟล์ (File Extension)
    file_size BIGINT NOT NULL,                  -- ขนาดไฟล์ (File Size in Bytes)
    file_data BYTEA NOT NULL,                   -- BYTEA (ไฟล์จริง) (Binary File Data)
    remark TEXT,                                -- หมายเหตุ (Remark)
    upload_by VARCHAR(100) NOT NULL,            -- ผู้อัปโหลด (Uploaded by)
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- วันที่อัปโหลด (Upload Date)
    
    -- Constraints (Optional but recommended if tables machines and categories exist)
    CONSTRAINT fk_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_plc_files_machine ON plc_files(machine_id);
CREATE INDEX IF NOT EXISTS idx_plc_files_category ON plc_files(category_id);

-- 4. Trigger for Auto-incrementing Version per Machine and Category
-- เมื่อมีการเพิ่มไฟล์ใหม่สำหรับเครื่องจักรเดิมและประเภทเดิม เวอร์ชั่นจะบวก 1 อัตโนมัติ
CREATE OR REPLACE FUNCTION auto_increment_plc_file_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version := COALESCE(
        (SELECT MAX(version) 
         FROM plc_files 
         WHERE machine_id = NEW.machine_id 
           AND category_id = NEW.category_id), 
        0
    ) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_auto_increment_plc_file_version
BEFORE INSERT ON plc_files
FOR EACH ROW
EXECUTE FUNCTION auto_increment_plc_file_version();

-- 5. Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL
);

-- Seed default allowed settings if not present
INSERT INTO settings (key, value) VALUES
('allowed_extensions', '.hex,.bin,.sys,.txt,.zip,.rar,.config,.param'),
('max_file_size_mb', '50')
ON CONFLICT (key) DO NOTHING;

-- 6. Create Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (machine_id, category_id, code),
    CONSTRAINT fk_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Alter plc_files to add subcategory_id FK relation
ALTER TABLE plc_files ADD COLUMN IF NOT EXISTS subcategory_id INTEGER;
ALTER TABLE plc_files DROP CONSTRAINT IF EXISTS fk_subcategory;
ALTER TABLE plc_files ADD CONSTRAINT fk_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE ON UPDATE CASCADE;



