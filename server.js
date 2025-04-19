// server.js - ไฟล์หลักสำหรับ Backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


// กำหนดค่าเริ่มต้น
const app = express();
const PORT = process.env.PORT || 4700; // ใช้ค่าจาก .env หรือค่าเริ่มต้น
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// กำหนดค่าการเชื่อมต่อกับฐานข้อมูล
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    req.user = user;
    next();
  });
};

// กำหนดพื้นที่จัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // จำกัดขนาดไฟล์ไม่เกิน 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์ .jpg, .png และ .pdf เท่านั้น'), false);
    }
  }
});

// กำหนดค่าสำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


// ส่งคำขอเอกสาร
app.post('/api/documents/request', authenticateToken, upload.single('idCard'), async (req, res) => {
  try {
    const { documentType, copies, purpose, otherPurpose, deliveryMethod, address, district, province, postalCode } = req.body;
    const studentId = req.user.studentId;
    const idCardFile = req.file ? req.file.filename : null;
    
    // สร้างเลขที่คำขอ
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countResult = await pool.query('SELECT COUNT(*) FROM document_requests WHERE request_date::date = CURRENT_DATE');
    const count = parseInt(countResult.rows[0].count) + 1;
    const requestId = `DOC${dateStr}-${count.toString().padStart(3, '0')}`;
    
    // บันทึกคำขอลงในฐานข้อมูล
    const finalPurpose = purpose === 'other' ? otherPurpose : purpose;
    
    const result = await pool.query(
      `INSERT INTO document_requests 
      (request_id, student_id, document_type_id, copies, purpose, delivery_method, 
      address, district, province, postal_code, id_card_file, status, request_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW())
      RETURNING *`,
      [requestId, studentId, documentType, copies, finalPurpose, deliveryMethod, 
      address, district, province, postalCode, idCardFile]
    );
    
    // ดึงข้อมูลนักศึกษา
    const studentResult = await pool.query('SELECT * FROM students WHERE student_id = $1', [studentId]);
    const student = studentResult.rows[0];
    
    // ส่งอีเมลยืนยันการขอเอกสาร
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: student.email,
      subject: 'ยืนยันการขอเอกสารทางการศึกษา',
      html: `
        <h2>เรียน ${student.first_name} ${student.last_name}</h2>
        <p>ระบบได้รับคำขอเอกสารของท่านเรียบร้อยแล้ว</p>
        <p>เลขที่คำขอ: <strong>${requestId}</strong></p>
        <p>ประเภทเอกสาร: ${documentType}</p>
        <p>วันที่ยื่นคำขอ: ${new Date().toLocaleDateString('th-TH')}</p>
        <p>ท่านสามารถติดตามสถานะคำขอได้ผ่านระบบขอเอกสารทางการศึกษาออนไลน์</p>
      `
    };
    
    transporter.sendMail(mailOptions);
    
    res.status(201).json({
      message: 'ส่งคำขอเอกสารสำเร็จ',
      requestId,
      status: 'pending'
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่งคำขอเอกสาร:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งคำขอเอกสาร' });
  }
});

// ดึงข้อมูลคำขอเอกสารทั้งหมดของนักศึกษา
app.get('/api/documents/requests', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.studentId;
    
    const result = await pool.query(`
      SELECT dr.*, dt.name as document_name 
      FROM document_requests dr
      JOIN document_types dt ON dr.document_type_id = dt.id
      WHERE dr.student_id = $1
      ORDER BY dr.request_date DESC
    `, [studentId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเอกสาร:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเอกสาร' });
  }
});

// ดึงข้อมูลรายละเอียดคำขอเอกสาร
app.get('/api/documents/requests/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const studentId = req.user.studentId;
    
    const result = await pool.query(`
      SELECT dr.*, dt.name as document_name 
      FROM document_requests dr
      JOIN document_types dt ON dr.document_type_id = dt.id
      WHERE dr.request_id = $1 AND dr.student_id = $2
    `, [requestId, studentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลคำขอ' });
    }
    
    // ดึงข้อมูลประวัติการดำเนินการ
    const historyResult = await pool.query(`
      SELECT * FROM request_history
      WHERE request_id = $1
      ORDER BY created_at ASC
    `, [requestId]);
    
    const requestData = result.rows[0];
    requestData.history = historyResult.rows;
    
    res.json(requestData);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดคำขอ:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดคำขอ' });
  }
});

// API สำหรับผู้ดูแลระบบ

// ดึงข้อมูลคำขอเอกสารทั้งหมดสำหรับผู้ดูแลระบบ
app.get('/api/admin/requests', authenticateToken, async (req, res) => {
  try {
    // ตรวจสอบสิทธิ์ผู้ดูแลระบบ
    const userResult = await pool.query('SELECT is_admin FROM students WHERE student_id = $1', [req.user.studentId]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    
    const result = await pool.query(`
      SELECT dr.*, dt.name as document_name, 
      s.first_name, s.last_name, s.email, s.phone
      FROM document_requests dr
      JOIN document_types dt ON dr.document_type_id = dt.id
      JOIN students s ON dr.student_id = s.student_id
      ORDER BY dr.request_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเอกสาร:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเอกสาร' });
  }
});

// อัปเดตสถานะคำขอเอกสาร
app.put('/api/admin/requests/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comment } = req.body;
    
    // ตรวจสอบสิทธิ์ผู้ดูแลระบบ
    const userResult = await pool.query('SELECT is_admin FROM students WHERE student_id = $1', [req.user.studentId]);
    if (!userResult.rows[0].is_admin) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    
    // อัปเดตสถานะคำขอ
    await pool.query(
      'UPDATE document_requests SET status = $1, updated_at = NOW() WHERE request_id = $2',
      [status, requestId]
    );
    
    // บันทึกประวัติการดำเนินการ
    await pool.query(
      'INSERT INTO request_history (request_id, status, comment, created_by, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [requestId, status, comment, req.user.studentId]
    );
    
    // ดึงข้อมูลคำขอและข้อมูลนักศึกษา
    const requestResult = await pool.query(`
      SELECT dr.*, dt.name as document_name, s.email, s.first_name, s.last_name 
      FROM document_requests dr
      JOIN document_types dt ON dr.document_type_id = dt.id
      JOIN students s ON dr.student_id = s.student_id
      WHERE dr.request_id = $1
    `, [requestId]);
    
    const requestData = requestResult.rows[0];
    
    // ส่งอีเมลแจ้งเตือนการอัปเดตสถานะ
    const statusText = {
      'pending': 'รอดำเนินการ',
      'processing': 'กำลังดำเนินการ',
      'completed': 'เสร็จสิ้น',
      'rejected': 'ถูกปฏิเสธ'
    };
    
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: requestData.email,
      subject: `อัปเดตสถานะคำขอเอกสาร ${requestId}`,
      html: `
        <h2>เรียน ${requestData.first_name} ${requestData.last_name}</h2>
        <p>คำขอเอกสารของท่านได้รับการอัปเดตสถานะ</p>
        <p>เลขที่คำขอ: <strong>${requestId}</strong></p>
        <p>ประเภทเอกสาร: ${requestData.document_name}</p>
        <p>สถานะใหม่: <strong>${statusText[status]}</strong></p>
        ${comment ? `<p>หมายเหตุ: ${comment}</p>` : ''}
        <p>ท่านสามารถติดตามสถานะคำขอได้ผ่านระบบขอเอกสารทางการศึกษาออนไลน์</p>
      `
    };
    
    transporter.sendMail(mailOptions);
    
    res.json({
      message: 'อัปเดตสถานะคำขอสำเร็จ',
      requestId,
      status
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะคำขอ:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะคำขอ' });
  }
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// กำหนดค่า middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// เส้นทาง API

// หน้าแรก
app.get('/', (req, res) => {
  res.json({ message: 'ยินดีต้อนรับสู่ API ระบบขอเอกสารทางการศึกษาออนไลน์' });
});

// ลงทะเบียนผู้ใช้ใหม่
app.post('/api/register', async (req, res) => {
  try {
    const { studentId, password, firstName, lastName, email, phone, faculty } = req.body;
    
    // ตรวจสอบว่ามีรหัสนักศึกษานี้ในระบบแล้วหรือไม่
    const checkUser = await pool.query('SELECT * FROM students WHERE student_id = $1', [studentId]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'รหัสนักศึกษานี้มีในระบบแล้ว' });
    }
    
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // บันทึกข้อมูลลงในฐานข้อมูล
    const result = await pool.query(
      'INSERT INTO students (student_id, password, first_name, last_name, email, phone, faculty, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [studentId, hashedPassword, firstName, lastName, email, phone, faculty]
    );
    
    // ส่งอีเมลยืนยันการลงทะเบียน
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'ยืนยันการลงทะเบียนระบบขอเอกสารทางการศึกษา',
      html: `
        <h2>ยินดีต้อนรับ ${firstName} ${lastName}</h2>
        <p>คุณได้ลงทะเบียนเข้าใช้ระบบขอเอกสารทางการศึกษาเรียบร้อยแล้ว</p>
        <p>รหัสนักศึกษา: ${studentId}</p>
        <p>หากมีข้อสงสัยประการใด โปรดติดต่อแผนกทะเบียนและประมวลผล</p>
      `
    };
    
    transporter.sendMail(mailOptions);
    
    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ',
      user: {
        studentId: result.rows[0].student_id,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        email: result.rows[0].email
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

// เข้าสู่ระบบ
app.post('/api/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    
    // ค้นหาผู้ใช้จากรหัสนักศึกษา
    const result = await pool.query('SELECT * FROM students WHERE student_id = $1', [studentId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' });
    }
    
    const user = result.rows[0];
    
    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' });
    }
    
    // สร้าง token
    const token = jwt.sign(
      { id: user.id, studentId: user.student_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        studentId: user.student_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// ดึงข้อมูลประเภทเอกสาร
app.get('/api/document-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM document_types');
    res.json(result.rows);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลประเภทเอกสาร:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทเอกสาร' });
  }
});
