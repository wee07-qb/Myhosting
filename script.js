
document.addEventListener("DOMContentLoaded", () => {
  // ===== ELEMENTS =====
  const startBtn      = document.getElementById("button");        // ปุ่มเริ่มนับถอยหลัง
  const countdownText = document.getElementById("countdownText"); // "กรุณารอ X วินาที..."
  const countSpan     = document.getElementById("count");         // X
  const goBtn         = document.getElementById("goBtn");         // ปุ่ม "ไปยังเว็บไซต์"

  // ถ้า element ไหนหาย ให้หยุดเลย
  if (!startBtn || !countdownText || !countSpan || !goBtn) {
    console.warn("[redirect] missing element(s)", { startBtn, countdownText, countSpan, goBtn });
    return;
  }

  // ===== CONFIG =====
  const COOLDOWN_SEC  = 5;                 // เวลานับถอยหลังก่อนโชว์ปุ่ม go
  const THRESHOLD_MS  = 5 * 60 * 1000;     // 5 นาที
  const KEY_COOLDOWN  = "cooldownTime";    // เก็บเวลาคลิกเริ่มนับ
  const KEY_LAST_L1   = "last_link1_time"; // เก็บเวลาที่เคยเด้งไปลิงก์ 1 ล่าสุด

  // อ่านลิงก์จาก data-* (รองรับทั้งอยู่บน startBtn หรือ goBtn)
  const link1 =
    (startBtn.dataset.link1 || goBtn.dataset.link1 || "").trim();
  const link2 =
    (startBtn.dataset.link2 || goBtn.dataset.link2 || "").trim();

  if (!link1) console.warn("[redirect] data-link1 is empty");
  if (!link2) console.warn("[redirect] data-link2 is empty");

  // กัน Bootstrap toggle ที่ทำ state แปลก
  startBtn.removeAttribute("data-bs-toggle");
  startBtn.classList.remove("active");

  // init UI
  goBtn.style.display = "none";
  countdownText.style.display = "none";
  startBtn.disabled = false;

  // ===== HELPERS =====
  const targetLoc = (window.top === window.self) ? window.location : window.top.location;

  function navigate(url) {
    if (!url) return;
    targetLoc.assign(url);
  }

  // ===== COUNTDOWN =====
  let timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function startCooldown(sec) {
    stopTimer();
    startBtn.disabled = true;
    countdownText.style.display = "block";
    goBtn.style.display = "none";
    countSpan.textContent = sec;

    timer = setInterval(() => {
      sec -= 1;
      countSpan.textContent = sec;
      if (sec <= 0) {
        stopTimer();
        countdownText.style.display = "none";
        goBtn.style.display = "inline-block";
        localStorage.removeItem(KEY_COOLDOWN);
        startBtn.style.display = "none";
      }
    }, 1000);
  }

  // เริ่มนับถอยหลังเมื่อกดปุ่มเริ่ม
  startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem(KEY_COOLDOWN, String(Date.now()));
    startCooldown(COOLDOWN_SEC);
  });

  // กรณีรีเฟรชระหว่างคูลดาวน์ ให้คำนวณเวลาที่เหลือ
  (() => {
    const last = Number(localStorage.getItem(KEY_COOLDOWN) || 0);
    if (!last) return;
    const elapsed = Math.floor((Date.now() - last) / 1000);
    const remain  = COOLDOWN_SEC - elapsed;
    if (remain > 0) startCooldown(remain);
    else localStorage.removeItem(KEY_COOLDOWN);
  })();

  // ===== GO BUTTON LOGIC (ตามเงื่อนไขที่คุณกำหนด) =====
  // ถ้า "เคยเด้งไปลิงก์1มาแล้ว" และ "กลับมาภายใน 5 นาที" -> ไปลิงก์2
  // มิฉะนั้น -> ไปลิงก์1 และบันทึกเวลาใหม่
  goBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const lastLink1 = Number(localStorage.getItem(KEY_LAST_L1) || 0);
    const now = Date.now();
    const within5min = lastLink1 && (now - lastLink1) <= THRESHOLD_MS;

    if (within5min && link2) {
      // ภายใน 5 นาที → ไป link2
      navigate(link2);
    } else {
      // ยังไม่เคยไป หรือ เกิน 5 นาที → ไป link1 และบันทึกเวลา
      localStorage.setItem(KEY_LAST_L1, String(now));
      navigate(link1 || link2); // เผื่อไม่มี link1 จะลองใช้ link2 แทน
    }
  });

  // ===== (ไม่บังคับ) SweetAlert2 รองรับได้ถ้าต้องการ =====
  // ถ้าอยากให้ขึ้นยืนยันก่อน ให้ครอบ navigate ด้วย Swal.fire ได้ตามต้องการ
});
