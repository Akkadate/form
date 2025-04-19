# คู่มือการติดตั้งระบบขอเอกสารทางการศึกษาออนไลน์

## ภาพรวมของระบบ

ระบบขอเอกสารทางการศึกษาออนไลน์ประกอบด้วย 3 ส่วนหลัก:
1. **Frontend**: HTML, CSS, JavaScript พื้นฐาน
2. **Backend**: Node.js + Express API
3. **Database**: PostgreSQL

## ขั้นตอนการติดตั้งแบบรวดเร็ว

### 1. ติดตั้ง Node.js และ NPM

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. ตั้งค่าฐานข้อมูล PostgreSQL

```bash
# เข้าสู่ PostgreSQL
psql -U postgres -h remote.devapp.cc

# สร้างฐานข้อมูล
CREATE DATABASE student_document_system;

# นำเข้าโครงสร้างฐานข้อมูล (จากเครื่องของคุณ)
psql -U postgres -h remote.devapp.cc -d student_document_system -f database-schema.sql
```

### 3. ติดตั้ง Backend

```bash
# สร้างโฟลเดอร์โปรเจค
mkdir -p /var/www/document-system/backend
cd /var/www/document-system/backend

# สร้างไฟล์ package.json
cat > package.json << EOF
{
  "name": "document-system-backend",
  "version": "1.0.0",
  "description": "ระบบขอเอกสารทางการศึกษาออนไลน์",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.7",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# ติดตั้ง dependencies
npm install

# สร้างโฟลเดอร์สำหรับไฟล์ที่อัปโหลด
mkdir uploads
chmod 755 uploads

# สร้างไฟล์ .env
cat > .env << EOF
PORT=4700
DB_HOST=remote.devapp.cc
DB_USER=postgres
DB_PASSWORD=Tct85329$
DB_NAME=student_document_system
DB_PORT=5432
JWT_SECRET=your-secret-key-should-be-very-long-and-random
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-app-password
EOF

# คัดลอกไฟล์ server.js เข้าไปในโฟลเดอร์
# (ใช้การคัดลอกไฟล์ server.js ที่สร้างก่อนหน้านี้)
```

### 4. ติดตั้ง Frontend

```bash
# สร้างโฟลเดอร์สำหรับ Frontend
mkdir -p /var/www/document-system/frontend
cd /var/www/document-system/frontend

# คัดลอกไฟล์ index.html, style.css และ frontend.js ไปยังโฟลเดอร์นี้
# (ใช้การคัดลอกไฟล์ที่สร้างก่อนหน้านี้)
```

### 5. ตั้งค่า Nginx

```bash
# ติดตั้ง Nginx
sudo apt install -y nginx

# สร้างไฟล์คอนฟิก
sudo cat > /etc/nginx/sites-available/document-system << EOF
server {
    listen 80;
    server_name form.devapp.cc;

    # Frontend
    location / {
        root /var/www/document-system/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4700;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploads directory
    location /uploads {
        alias /var/www/document-system/backend/uploads;
    }
}
EOF

# เปิดใช้งานคอนฟิก
sudo ln -s /etc/nginx/sites-available/document-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. เริ่มการทำงานของ Backend

```bash
# ติดตั้ง PM2
sudo npm install -g pm2

# เริ่มการทำงานของ Backend
cd /var/www/document-system/backend
pm2 start server.js --name document-system-api

# ตั้งค่าให้เริ่มทำงานอัตโนมัติเมื่อรีสตาร์ทเซิร์ฟเวอร์
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u $(whoami)
pm2 save
```

### 7. ตรวจสอบการทำงาน

- เปิดเว็บไซต์ที่ http://form.devapp.cc
- ทดสอบ API ที่ http://form.devapp.cc/api

## การแก้ไขปัญหาเบื้องต้น

### ตรวจสอบสถานะ Backend
```bash
pm2 status
pm2 logs document-system-api
```

### ตรวจสอบล็อกของ Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### รีสตาร์ทบริการ
```bash
# รีสตาร์ท Backend
pm2 restart document-system-api

# รีสตาร์ท Nginx
sudo systemctl restart nginx
```

## ข้อมูลติดต่อ
หากพบปัญหาในการติดตั้ง กรุณาติดต่อผู้ดูแลระบบที่ admin@example.com
