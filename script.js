
document.addEventListener("DOMContentLoaded", () => {
  // ===== ELEMENTS =====
  const startBtn      = document.getElementById("button");        // ปุ่มเริ่มนับถอยหลัง
  const countdownText = document.getElementById("countdownText"); // "กรุณารอ X วินาที..."
  const countSpan     = document.getElementById("count");         // X
  const goBtn         = document.getElementById("goBtn");         // ปุ่ม "ไปยังเว็บไซต์"

  if (!startBtn || !countdownText || !countSpan || !goBtn) return;

  // ===== CONFIG =====
  const COOLDOWN_SEC = 5;                   // เวลานับถอยหลังโชว์ปุ่ม go
  const THRESHOLD_MS = 5 * 60 * 1000;       // 5 นาที
  const KEY_COOLDOWN = "cooldownTime";      // เวลาเริ่มคูลดาวน์
  const KEY_LAST_L1  = "last_link1_time";   // เวลาที่เคยเด้งไปลิงก์1 ล่าสุด

  // อ่านลิงก์จาก data-* (จะอยู่ที่ startBtn หรือ goBtn ก็ได้)
  const link1 = (startBtn.dataset.link1 || goBtn.dataset.link1 || "").trim();
  const link2 = (startBtn.dataset.link2 || goBtn.dataset.link2 || "").trim();

  // กัน Bootstrap toggle ทำให้ state แปลก
  startBtn.removeAttribute("data-bs-toggle");
  startBtn.classList.remove("active");

  // init UI
  goBtn.style.display = "none";
  countdownText.style.display = "none";
  startBtn.disabled = false;

  const targetLoc = (window.top === window.self) ? window.location : window.top.location;

  // ===== COUNTDOWN =====
  let timer = null;
  function stopTimer(){ if (timer){ clearInterval(timer); timer = null; } }

  function startCooldown(sec){
    stopTimer();
    startBtn.disabled = true;
    countdownText.style.display = "block";
    goBtn.style.display = "none";
    countSpan.textContent = sec;

    timer = setInterval(() => {
      sec -= 1;
      countSpan.textContent = sec;
      if (sec <= 0){
        stopTimer();
        countdownText.style.display = "none";
        goBtn.style.display = "inline-block";
        localStorage.removeItem(KEY_COOLDOWN);
        startBtn.style.display = "none";
      }
    }, 1000);
  }

  startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem(KEY_COOLDOWN, String(Date.now()));
    startCooldown(COOLDOWN_SEC);
  });

  // Resume คูลดาวน์กรณีรีเฟรช
  (function resumeCooldown(){
    const last = Number(localStorage.getItem(KEY_COOLDOWN) || 0);
    if (!last) return;
    const elapsed = Math.floor((Date.now() - last) / 1000);
    const remain  = COOLDOWN_SEC - elapsed;
    if (remain > 0) startCooldown(remain);
    else localStorage.removeItem(KEY_COOLDOWN);
  })();

  // ===== GO BUTTON + ALERT LOGIC =====
  goBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const lastL1 = Number(localStorage.getItem(KEY_LAST_L1) || 0);
    const now    = Date.now();
    const within5min = lastL1 && (now - lastL1) <= THRESHOLD_MS;

    // ถ้า "ภายใน 5 นาที" => ไป link2 เลย (ไม่ต้องทำสองเด้ง)
    if (within5min && link2) {
      targetLoc.assign(link2);
      return;
    }

    // เกิน 5 นาที หรือยังไม่เคยเด้ง link1: แสดง Alert ก่อน "ไปเลย!"
    const goDual = async () => {
      // 1) พยายามเปิดลิงก์ 1 ในแท็บใหม่/แอปภายนอก (อาจเด้งไป Chrome)
      // หมายเหตุ: บางบราวเซอร์/อินแอปอาจบล็อก popup ถ้าไม่ใช่ user gesture ตรง ๆ
      // แต่ใน chain ของ then() จาก Swal ส่วนใหญ่ยังถือเป็น gesture อยู่
      if (link1) {
        const w = window.open(link1, "_blank", "noopener,noreferrer");
        if (w) { try { w.opener = null; } catch {} }
        localStorage.setItem(KEY_LAST_L1, String(now)); // บันทึกว่าเราเพิ่งยิง link1
      }

      // 2) เด้ง "แท็บปัจจุบัน" ไป link2 ทันที
      if (link2) {
        targetLoc.assign(link2);
      } else if (link1) {
        // ถ้าไม่มี link2 ก็อย่างน้อยให้ไป link1 ในแท็บปัจจุบัน
        targetLoc.assign(link1);
      }
    };

    if (typeof Swal !== "undefined") {
      const res = await Swal.fire({
        title: "พร้อมแล้ว!",
        text: "จะเปิด Shopee และพาไปหน้าปลายทางให้ทันที",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ไปเลย!",
        cancelButtonText: "ยกเลิก",
      });
      if (res.isConfirmed) {
        await goDual();
      }
    } else {
      // ไม่มี SweetAlert2: ไปตาม flow เลย
      await goDual();
    }
  });
});
