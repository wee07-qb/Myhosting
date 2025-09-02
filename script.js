
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("button");
  const countdownText = document.getElementById("countdownText");
  const countSpan = document.getElementById("count");
  const goBtn = document.getElementById("goBtn");
  const cooldownSeconds = 5;

  if (!startBtn || !countdownText || !countSpan || !goBtn) return;

  // กัน Bootstrap toggle (ถ้าเผลอใส่)
  startBtn.removeAttribute("data-bs-toggle");

  const link1 = (startBtn.dataset.link1 || "").trim();
  const link2 = (startBtn.dataset.link2 || "").trim();

  function setCooldown(seconds) {
    startBtn.disabled = true;
    countdownText.style.display = "block";
    countSpan.textContent = seconds;

    const countdown = setInterval(() => {
      seconds--;
      countSpan.textContent = seconds;

      if (seconds <= 0) {
        clearInterval(countdown);
        countdownText.style.display = "none";
        goBtn.style.display = "inline-block";
        localStorage.removeItem("cooldownTime");
        startBtn.style.display = "none";
      }
    }, 1000);
  }

  startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("cooldownTime", Date.now());
    setCooldown(cooldownSeconds);
  });

  // คืนสถานะเดิมถ้ารีเฟรชระหว่างคูลดาวน์
  const lastClicked = localStorage.getItem("cooldownTime");
  if (lastClicked) {
    const now = Date.now();
    const elapsed = Math.floor((now - Number(lastClicked)) / 1000);
    const remaining = cooldownSeconds - elapsed;

    if (remaining > 0) {
      setCooldown(remaining);
    } else {
      localStorage.removeItem("cooldownTime");
    }
  }

  goBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // เผื่อกรณี SweetAlert2 ยังโหลดไม่ทัน
    if (typeof Swal === "undefined") {
      // ไปต่อทันทีแบบไม่ขึ้นแจ้งเตือน
      const targetLoc = (window.top === window.self) ? window.location : window.top.location;
      if (link1) { targetLoc.assign(link1); return; }
      if (link2) { targetLoc.assign(link2); return; }
      return;
    }

    const result = await Swal.fire({
      title: "พร้อมแล้ว!",
      text: "คลิกเพื่อไปยังเว็บไซต์",
      icon: "success",
      confirmButtonText: "ไปเลย!",
    });

    if (result.isConfirmed) {
      // ไปในแท็บเดิม (ไม่เปิดแท็บใหม่/ไม่โยนไป Chrome)
      const targetLoc = (window.top === window.self) ? window.location : window.top.location;
      if (link1) { targetLoc.assign(link1); return; }
      if (link2) { targetLoc.assign(link2); return; }
    }
  });
});

 // --- เพิ่มฟังก์ชันช่วยตรวจว่าเป็นการย้อนกลับ/ไปข้างหน้าไหม ---
  function isBackForwardNavigation() {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      return nav && nav.type === "back_forward";
    } catch { return false; }
  }

  // --- เมื่อคลิกปุ่มไป Shopee ---
  goBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // ถ้าไม่ใช้ Swal ก็ไปต่อได้เลย (เผื่อโหลดไม่ทัน)
    if (typeof Swal === "undefined") {
      if (link1) {
        // ตั้งธงว่ากลับมาค่อยไป link2
        localStorage.setItem("pending_link2", "1");
        location.assign(link1);
        return;
      }
      if (link2) location.assign(link2);
      return;
    }

    const result = await Swal.fire({
      title: "พร้อมแล้ว!",
      text: "คลิกเพื่อไปยังเว็บไซต์",
      icon: "success",
      confirmButtonText: "ไปเลย!",
    });

    if (result.isConfirmed) {
      if (link1) {
        // ตั้งธงก่อนออกจากหน้านี้
        localStorage.setItem("pending_link2", "1");
        location.assign(link1); // ไป Shopee แท็บเดิม
        return;
      }
      if (link2) location.assign(link2);
    }
  });

  // --- เมื่อผู้ใช้ย้อนกลับมาหน้าเดิม ให้เช็กธงแล้วไป link2 ---
  window.addEventListener("pageshow", (ev) => {
    // ยิงทั้งจากโหลดใหม่และ BFCache; เราเช็กธงเอง
    const shouldGo2 = localStorage.getItem("pending_link2") === "1";

    // กันลูป/กันเด้งซ้ำหลายครั้งใน session เดียว
    const already = sessionStorage.getItem("link2_redirected") === "1";

    // เงื่อนไข: มีธง + ยังไม่เคยเด้ง + มี link2
    if (shouldGo2 && !already && link2) {
      // เคลียร์ธงทันที (กันวน)
      localStorage.removeItem("pending_link2");
      sessionStorage.setItem("link2_redirected", "1");

      // เด้งไป link2 ในแท็บเดิม
      location.assign(link2);
    }
  });
});

