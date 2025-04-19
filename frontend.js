// frontend.js - โค้ด JavaScript สำหรับฝั่ง Frontend

document.addEventListener('DOMContentLoaded', function() {
    // ตัวแปรเก็บสถานะการล็อกอิน
    let isLoggedIn = false;
    let currentUser = null;

    // องค์ประกอบหน้าต่างๆ
    const homePage = document.getElementById('homePage');
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    const requestPage = document.getElementById('requestPage');
    const statusPage = document.getElementById('statusPage');

    // ปุ่มและลิงก์ต่างๆ
    const loginBtn = document.getElementById('loginBtn');
    const homeLink = document.getElementById('homeLink');
    const requestLink = document.getElementById('requestLink');
    const statusLink = document.getElementById('statusLink');
    const registerLink = document.getElementById('registerLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const startRequestBtn = document.getElementById('startRequestBtn');
    const cancelRequest = document.getElementById('cancelRequest');

    // ฟอร์มต่างๆ
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const documentRequestForm = document.getElementById('documentRequestForm');

    // องค์ประกอบในฟอร์ม
    const purposeSelect = document.getElementById('purpose');
    const otherPurposeDiv = document.getElementById('otherPurposeDiv');
    const deliveryMethodSelect = document.getElementById('deliveryMethod');
    const addressDiv = document.getElementById('addressDiv');

    // Modal
    const requestDetailModal = new bootstrap.Modal(document.getElementById('requestDetailModal'));

    // แสดงหน้าหลัก ซ่อนหน้าอื่นๆ
    function showHome() {
        homePage.style.display = 'block';
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        requestPage.style.display = 'none';
        statusPage.style.display = 'none';
    }

    // แสดงหน้าล็อกอิน ซ่อนหน้าอื่นๆ
    function showLogin() {
        homePage.style.display = 'none';
        loginPage.style.display = 'block';
        registerPage.style.display = 'none';
        requestPage.style.display = 'none';
        statusPage.style.display = 'none';
    }

    // แสดงหน้าลงทะเบียน ซ่อนหน้าอื่นๆ
    function showRegister() {
        homePage.style.display = 'none';
        loginPage.style.display = 'none';
        registerPage.style.display = 'block';
        requestPage.style.display = 'none';
        statusPage.style.display = 'none';
    }

    // แสดงหน้าขอเอกสาร ซ่อนหน้าอื่นๆ
    function showRequest() {
        if (!isLoggedIn) {
            showLogin();
            return;
        }
        homePage.style.display = 'none';
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        requestPage.style.display = 'block';
        statusPage.style.display = 'none';
    }

    // แสดงหน้าติดตามสถานะ ซ่อนหน้าอื่นๆ
    function showStatus() {
        if (!isLoggedIn) {
            showLogin();
            return;
        }
        homePage.style.display = 'none';
        loginPage.style.display = 'none';
        registerPage.style.display = 'none';
        requestPage.style.display = 'none';
        statusPage.style.display = 'block';
    }

    // เปลี่ยนปุ่มล็อกอินเป็นล็อกเอาท์ หลังจากล็อกอินสำเร็จ
    function updateLoginButton() {
        if (isLoggedIn) {
            loginBtn.textContent = 'ออกจากระบบ';
            loginBtn.classList.remove('btn-light');
            loginBtn.classList.add('btn-outline-light');
        } else {
            loginBtn.textContent = 'เข้าสู่ระบบ';
            loginBtn.classList.remove('btn-outline-light');
            loginBtn.classList.add('btn-light');
        }
    }

    // จำลองการล็อกอิน
    function simulateLogin(studentId, password) {
        // ในโปรเจคจริง ควรส่งคำขอไปยัง API เพื่อตรวจสอบการล็อกอิน
        return new Promise((resolve, reject) => {
            // จำลองการส่งคำขอไปยังเซิร์ฟเวอร์
            setTimeout(() => {
                if (studentId === '1234567890' && password === 'password123') {
                    resolve({
                        studentId: '1234567890',
                        firstName: 'นายตัวอย่าง',
                        lastName: 'นามสกุลตัวอย่าง',
                        email: 'example@email.com'
                    });
                } else {
                    reject('รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง');
                }
            }, 1000);
        });
    }

    // จำลองการลงทะเบียน
    function simulateRegister(userData) {
        // ในโปรเจคจริง ควรส่งคำขอไปยัง API เพื่อลงทะเบียน
        return new Promise((resolve, reject) => {
            // จำลองการส่งคำขอไปยังเซิร์ฟเวอร์
            setTimeout(() => {
                if (userData.studentId && userData.password) {
                    resolve({
                        studentId: userData.studentId,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email
                    });
                } else {
                    reject('กรุณากรอกข้อมูลให้ครบถ้วน');
                }
            }, 1000);
        });
    }

    // จำลองการส่งคำขอเอกสาร
    function simulateRequestDocument(documentData) {
        // ในโปรเจคจริง ควรส่งคำขอไปยัง API เพื่อขอเอกสาร
        return new Promise((resolve, reject) => {
            // จำลองการส่งคำขอไปยังเซิร์ฟเวอร์
            setTimeout(() => {
                const requestId = 'DOC' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                resolve({
                    requestId: requestId,
                    documentType: documentData.documentType,
                    status: 'pending',
                    requestDate: new Date().toLocaleDateString('th-TH')
                });
            }, 1000);
        });
    }

    // จำลองการดึงข้อมูลคำขอเอกสาร
    function simulateGetRequests() {
        // ในโปรเจคจริง ควรส่งคำขอไปยัง API เพื่อดึงข้อมูลคำขอ
        return new Promise((resolve) => {
            // จำลองการส่งคำขอไปยังเซิร์ฟเวอร์
            setTimeout(() => {
                resolve([
                    {
                        requestId: 'DOC20250419-001',
                        documentType: 'studentCertificate',
                        documentTypeThai: 'ใบรับรองการเป็นนักศึกษา',
                        requestDate: '19/04/2025',
                        status: 'processing',
                        statusThai: 'กำลังดำเนินการ'
                    },
                    {
                        requestId: 'DOC20250410-042',
                        documentType: 'transcript',
                        documentTypeThai: 'ใบแสดงผลการเรียน',
                        requestDate: '10/04/2025',
                        status: 'completed',
                        statusThai: 'เสร็จสิ้น'
                    }
                ]);
            }, 1000);
        });
    }

    // แสดงข้อความแจ้งเตือน
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // ตั้งเวลาลบข้อความแจ้งเตือน
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // อัปเดตตารางข้อมูลคำขอเอกสาร
    function updateRequestsTable(requests) {
        const tableBody = document.getElementById('requestsTableBody');
        tableBody.innerHTML = '';
        
        if (requests.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" class="text-center">ไม่มีคำขอเอกสาร</td>`;
            tableBody.appendChild(row);
            return;
        }
        
        requests.forEach(request => {
            const row = document.createElement('tr');
            
            // กำหนดสีของ badge ตามสถานะ
            let badgeClass = 'bg-secondary';
            if (request.status === 'processing') {
                badgeClass = 'bg-warning';
            } else if (request.status === 'completed') {
                badgeClass = 'bg-success';
            } else if (request.status === 'rejected') {
                badgeClass = 'bg-danger';
            }
            
            row.innerHTML = `
                <td>${request.requestId}</td>
                <td>${request.documentTypeThai}</td>
                <td>${request.requestDate}</td>
                <td><span class="badge ${badgeClass} status-badge">${request.statusThai}</span></td>
                <td>
                    <button class="btn btn-sm btn-info view-details" data-id="${request.requestId}">ดูรายละเอียด</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // เพิ่ม event listener สำหรับปุ่มดูรายละเอียด
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const requestId = this.getAttribute('data-id');
                showRequestDetails(requestId);
            });
        });
    }

    // แสดงรายละเอียดคำขอเอกสาร
    function showRequestDetails(requestId) {
        // ในโปรเจคจริง ควรดึงข้อมูลรายละเอียดจาก API
        document.getElementById('modalRequestId').textContent = requestId;
        
        // จำลองข้อมูลรายละเอียดคำขอ
        if (requestId === 'DOC20250419-001') {
            document.getElementById('modalRequestDate').textContent = '19/04/2025';
            document.getElementById('modalDocumentType').textContent = 'ใบรับรองการเป็นนักศึกษา';
            document.getElementById('modalCopies').textContent = '1';
            document.getElementById('modalPurpose').textContent = 'สมัครงาน';
            document.getElementById('modalDeliveryMethod').textContent = 'รับด้วยตนเองที่มหาวิทยาลัย';
            document.getElementById('modalAddressDiv').style.display = 'none';
        } else {
            document.getElementById('modalRequestDate').textContent = '10/04/2025';
            document.getElementById('modalDocumentType').textContent = 'ใบแสดงผลการเรียน';
            document.getElementById('modalCopies').textContent = '2';
            document.getElementById('modalPurpose').textContent = 'สมัครเรียนต่อ';
            document.getElementById('modalDeliveryMethod').textContent = 'จัดส่งทางไปรษณีย์';
            document.getElementById('modalAddressDiv').style.display = 'block';
            document.getElementById('modalAddress').textContent = '123 ถนนตัวอย่าง ตำบลตัวอย่าง อำเภอเมือง จังหวัดตัวอย่าง 10000';
        }
        
        requestDetailModal.show();
    }

    // Event Listeners

    // ลิงก์นำทางไปหน้าต่างๆ
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHome();
    });

    requestLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRequest();
    });

    statusLink.addEventListener('click', (e) => {
        e.preventDefault();
        showStatus();
        
        // โหลดข้อมูลคำขอเอกสาร
        if (isLoggedIn) {
            simulateGetRequests().then(requests => {
                updateRequestsTable(requests);
            });
        }
    });

    // ปุ่มล็อกอิน/ล็อกเอาท์
    loginBtn.addEventListener('click', function() {
        if (isLoggedIn) {
            // ล็อกเอาท์
            isLoggedIn = false;
            currentUser = null;
            updateLoginButton();
            showHome();
            showAlert('ออกจากระบบเรียบร้อยแล้ว', 'info');
        } else {
            // แสดงหน้าล็อกอิน
            showLogin();
        }
    });

    // ลิงก์ลงทะเบียน
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });

    // ลิงก์กลับไปหน้าล็อกอิน
    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });

    // ปุ่มเริ่มขอเอกสาร
    startRequestBtn.addEventListener('click', () => {
        showRequest();
    });

    // ปุ่มยกเลิกคำขอ
    cancelRequest.addEventListener('click', () => {
        document.getElementById('documentRequestForm').reset();
        showHome();
    });

    // ฟอร์มล็อกอิน
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('password').value;
        
        // แสดงการโหลด (ในโปรเจคจริงควรมีการแสดง loading)
        
        simulateLogin(studentId, password)
            .then(user => {
                isLoggedIn = true;
                currentUser = user;
                updateLoginButton();
                showHome();
                showAlert(`ยินดีต้อนรับ ${user.firstName} ${user.lastName}`, 'success');
                loginForm.reset();
            })
            .catch(error => {
                showAlert(error, 'danger');
            });
    });

   // ในไฟล์ frontend.js
// ตรวจสอบข้อมูลก่อนส่งไปยัง API
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const userData = {
    studentId: document.getElementById('regStudentId').value,
    password: document.getElementById('regPassword').value,
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    faculty: document.getElementById('faculty').value
  };
  
  console.log('Sending registration data:', userData); // เพิ่มการล็อกในฝั่ง Frontend
  
  // ส่งข้อมูลไปยัง API
  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Registration response:', data);
    if (data.message === 'ลงทะเบียนสำเร็จ') {
      showAlert('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ', 'success');
      showLogin();
      registerForm.reset();
    } else {
      showAlert(data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', 'danger');
    }
  })
  .catch(error => {
    console.error('Registration error:', error);
    showAlert('เกิดข้อผิดพลาดในการลงทะเบียน', 'danger');
  });
});

    // ฟอร์มขอเอกสาร
    documentRequestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const documentData = {
            documentType: document.getElementById('documentType').value,
            copies: document.getElementById('copies').value,
            purpose: document.getElementById('purpose').value,
            otherPurpose: document.getElementById('otherPurpose').value,
            deliveryMethod: document.getElementById('deliveryMethod').value,
            address: document.getElementById('address').value,
            district: document.getElementById('district').value,
            province: document.getElementById('province').value,
            postalCode: document.getElementById('postalCode').value,
            idCardFile: document.getElementById('idCardFile').files[0]
        };
        
        // แสดงการโหลด (ในโปรเจคจริงควรมีการแสดง loading)
        
        simulateRequestDocument(documentData)
            .then(result => {
                showHome();
                showAlert(`ส่งคำขอเอกสารสำเร็จ เลขที่คำขอ: ${result.requestId}`, 'success');
                documentRequestForm.reset();
            })
            .catch(error => {
                showAlert(error, 'danger');
            });
    });

    // เมื่อเลือกวัตถุประสงค์ "อื่นๆ"
    purposeSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            otherPurposeDiv.style.display = 'block';
            document.getElementById('otherPurpose').setAttribute('required', '');
        } else {
            otherPurposeDiv.style.display = 'none';
            document.getElementById('otherPurpose').removeAttribute('required');
        }
    });

    // เมื่อเลือกวิธีการรับเอกสาร "จัดส่งทางไปรษณีย์"
    deliveryMethodSelect.addEventListener('change', function() {
        if (this.value === 'mail') {
            addressDiv.style.display = 'block';
            document.getElementById('address').setAttribute('required', '');
            document.getElementById('district').setAttribute('required', '');
            document.getElementById('province').setAttribute('required', '');
            document.getElementById('postalCode').setAttribute('required', '');
        } else {
            addressDiv.style.display = 'none';
            document.getElementById('address').removeAttribute('required');
            document.getElementById('district').removeAttribute('required');
            document.getElementById('province').removeAttribute('required');
            document.getElementById('postalCode').removeAttribute('required');
        }
    });

    // แสดงหน้าหลักเมื่อโหลดเว็บเสร็จ
    showHome();
});
