let link1 = "https://s.shopee.co.th/2B1jiJVvRR";  // ลิงก์แรก (เปิดแท็บใหม่)

const files = [
    // Golem
    { name: 'อนิเมชั่น1.4', url: 'download.mcaddon' },
  ];


let allSelected = false;

// สร้างรายการไฟล์
function renderFiles(filter = '') {
  const list = document.getElementById('fileList');
  list.innerHTML = '';
  files
    .filter(file => file.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'list-group-item';
      item.innerHTML = `
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="file-${index}" value="${file.url}" data-name="${file.name}" onchange="updateSelectedCount()">
          <label class="form-check-label" for="file-${index}">
            <i class="fas fa-file-alt me-2 text-primary"></i>${file.name}
          </label>
        </div>
      `;
      list.appendChild(item);
    });
  updateSelectedCount();
}

// นับจำนวนไฟล์ที่เลือก
function updateSelectedCount() {
  const selected = document.querySelectorAll('#fileList input[type="checkbox"]:checked').length;
  document.getElementById('selectedCount').innerText = `เลือก ${selected} ไฟล์`;
}

// เลือก/ไม่เลือกทั้งหมด
function toggleSelectAll() {
  const checkboxes = document.querySelectorAll('#fileList input[type="checkbox"]');
  allSelected = !allSelected;
  checkboxes.forEach(checkbox => {
    checkbox.checked = allSelected;
  });
  updateSelectedCount();
}

// ดาวน์โหลดไฟล์ที่เลือก
async function downloadSelected() {
  const selected = document.querySelectorAll('#fileList input[type="checkbox"]:checked');

  if (selected.length === 0) {
    return Swal.fire({
      icon: 'warning',
      title: 'ยังไม่ได้เลือกไฟล์',
      text: 'กรุณาเลือกไฟล์อย่างน้อย 1 รายการ',
      confirmButtonText: 'ตกลง'
    });
  }

  const zip = new JSZip();

  // แสดง SweetAlert แจ้งเตือนว่ากำลังโหลดไฟล์
  Swal.fire({
    title: 'กำลังสร้างไฟล์...',
    text: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  for (const checkbox of selected) {
    const url = checkbox.value;
    const filename = checkbox.getAttribute('data-name');

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // สร้างชื่อไฟล์ ZIP ที่สุ่ม
  const randomName = 'download-' + Date.now() + '.zip'; // ใช้เวลาปัจจุบัน (milliseconds) เป็นตัวสุ่ม

  // ดาวน์โหลดไฟล์ ZIP ที่มีชื่อสุ่ม
  saveAs(zipBlob, randomName);

  // ปิด SweetAlert หลังจากดาวน์โหลดเสร็จ
  Swal.fire({
    icon: 'success',
    title: 'ดาวน์โหลดเสร็จสิ้น',
    text: 'ไฟล์ที่คุณเลือกจะถูกดาวน์โหลด',
    confirmButtonText: 'ตกลง'
  });

  if (link1) {
    setTimeout(() => {
      window.open(link1, "_blank");
    }, 500); // เปิดลิงก์หลังจากโหลดเสร็จ
  }
}



// ✅ ไม่ล้างตัวเลือก เพื่อให้ดาวน์โหลดซ้ำได้

// รีเฟรชหน้าเว็บ พร้อม Popup โหลดสวย ๆ (แยกออกมา)
function refreshPage() {
  Swal.fire({
    title: 'กำลังโหลดใหม่...',
    text: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  setTimeout(() => {
    location.reload();
  }, 1500); // รอ 1.5 วิ ก่อนรีเฟรชจริง
}

// โหมดกลางวัน/กลางคืน
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('modeIcon');
  if (document.body.classList.contains('dark-mode')) {
    icon.classList.replace('fa-moon', 'fa-sun');
    localStorage.setItem('theme', 'dark');
  } else {
    icon.classList.replace('fa-sun', 'fa-moon');
    localStorage.setItem('theme', 'light');
  }
}

// กู้สถานะธีม
function restoreDarkMode() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('modeIcon');
    if (icon) {
      icon.classList.replace('fa-moon', 'fa-sun');
    }
  }
}

// เริ่มต้นเมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', () => {
  restoreDarkMode();
  renderFiles();
});
