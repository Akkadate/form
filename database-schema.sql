-- database-schema.sql
-- โครงสร้างฐานข้อมูลสำหรับระบบขอเอกสารทางการศึกษาออนไลน์

-- สร้างฐานข้อมูล (ถ้ายังไม่มี)
-- CREATE DATABASE student_document_system;

-- สร้างตาราง students (ข้อมูลนักศึกษา)
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  faculty VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- สร้างตาราง document_types (ประเภทเอกสาร)
CREATE TABLE document_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  fee DECIMAL(10, 2) DEFAULT 0,
  processing_days INT DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- สร้างตาราง document_requests (คำขอเอกสาร)
CREATE TABLE document_requests (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  student_id VARCHAR(20) NOT NULL,
  document_type_id INT NOT NULL,
  copies INT DEFAULT 1,
  purpose VARCHAR(255),
  delivery_method VARCHAR(50) NOT NULL,
  address TEXT,
  district VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  id_card_file VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  request_date TIMESTAMP DEFAULT NOW(),
  completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (document_type_id) REFERENCES document_types(id)
);

-- สร้างตาราง request_history (ประวัติการดำเนินการ)
CREATE TABLE request_history (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  created_by VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (request_id) REFERENCES document_requests(request_id),
  FOREIGN KEY (created_by) REFERENCES students(student_id)
);

-- เพิ่มข้อมูลตัวอย่างประเภทเอกสาร
INSERT INTO document_types (name, description, fee, processing_days) VALUES
('studentCertificate', 'ใบรับรองการเป็นนักศึกษา', 50.00, 1),
('transcript', 'ใบแสดงผลการเรียน (Transcript)', 100.00, 3),
('graduationCertificate', 'หนังสือรับรองการสำเร็จการศึกษา', 100.00, 5);

-- เพิ่มบัญชีผู้ดูแลระบบตัวอย่าง (รหัสผ่าน: admin123)
INSERT INTO students (student_id, password, first_name, last_name, email, is_admin) VALUES
('admin', '$2b$10$x5BZLe7TJx5T6zvYZgVSbOxhzSbYQ5JCZ9RbTFPY7IedWFpMQY3M6', 'ผู้ดูแล', 'ระบบ', 'admin@university.ac.th', TRUE);
