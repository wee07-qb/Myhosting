
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("button");
  const countdownText = document.getElementById("countdownText");
  const countSpan = document.getElementById("count");
  const goBtn = document.getElementById("goBtn");

  // ตั้งได้: นาทีที่ใช้ตัดสิน (ค่าเริ่ม 5 นาที)
  const THRESHOLD_MS = 5 * 60 * 1000;
  const COOLDOWN_SEC = 5;

  // local/session keys
  const KEY_COOLDOWN = "cooldownTime";
  const KEY_PENDING2 = "pending_link2";
  const KEY_LEFT_AT  = "left_for_link1_at";
  const KEY_DONE2    = "link2_redirected"; // กันเด้งซ้ำในรอบเดียว

  if (!startBtn || !countdownText || !countSpan || !goBtn) return;

  // กัน Bootstrap toggle
  startBtn.removeAttribute("data-bs-toggle");
  startBtn.classList.remove("active");
  goBtn.style.display = "none";
  countdownText.style.display = "none";

  const link1 = (startBtn.dataset.link1 || "").trim();
  const link2 = (startBtn.dataset.link2 || "").trim();

  // ---------- Countdown ----------
  let timer = null;
  function clearTimer(){ if (timer){ clearInterval(timer); timer=null; } }
  function startCooldown(sec){
    clearTimer();
    startBtn.disabled = true;
    countdownText.style.display = "block";
    goBtn.style.display = "none";
    countSpan.textContent = sec;
    timer = setInterval(() => {
      sec -= 1;
      countSpan.textContent = sec;
      if (sec <= 0){
        clearTimer();
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

  // Resume ระหว่างคูลดาวน์
  (function resumeCooldown(){
    const last = Number(localStorage.getItem(KEY_COOLDOWN) || 0);
    if (!last) return;
    const elapsed = Math.floor((Date.now() - last) / 1000);
    const remain  = COOLDOWN_SEC - elapsed;
    if (remain > 0) startCooldown(remain);
    else localStorage.removeItem(KEY_COOLDOWN);
  })();

  // ---------- ไป Shopee (link1) แล้วตั้งธงกลับมา ----------
  async function confirmThenGo(){
    const go = async () => {
      if (link1){
        // ตั้งธงว่า “กลับมาให้พิจารณาเวลา” และบันทึกเวลาออก
        localStorage.setItem(KEY_PENDING2, "1");
        localStorage.setItem(KEY_LEFT_AT, String(Date.now()));
        (window.top === window.self ? window.location : window.top.location).assign(link1);
        return;
      }
      if (link2){
        (window.top === window.self ? window.location : window.top.location).assign(link2);
      }
    };

    if (typeof Swal !== "undefined"){
      const res = await Swal.fire({
        title: "พร้อมแล้ว!",
        text: "คลิกเพื่อไปยังเว็บไซต์",
        icon: "success",
        confirmButtonText: "ไปเลย!",
      });
      if (res.isConfirmed) await go();
    } else {
      await go();
    }
  }

  goBtn.addEventListener("click", (e) => {
    e.preventDefault();
    confirmThenGo();
  });

  // ---------- เมื่อย้อนกลับมา ให้ตรวจเวลาแล้วตัดสินใจ ----------
  window.addEventListener("pageshow", () => {
    const pending = localStorage.getItem(KEY_PENDING2) === "1";
    const already = sessionStorage.getItem(KEY_DONE2) === "1";
    if (!pending || already) return;

    const leftAt = Number(localStorage.getItem(KEY_LEFT_AT) || 0);
    const now = Date.now();
    const elapsed = now - leftAt;

    const targetLoc = (window.top === window.self) ? window.location : window.top.location;

    if (leftAt && link2 && elapsed <= THRESHOLD_MS){
      // กลับมา “ภายใน” 5 นาที → ไป link2
      localStorage.removeItem(KEY_PENDING2);
      sessionStorage.setItem(KEY_DONE2, "1");
      targetLoc.assign(link2);
    } else if (link1){
      // กลับมา “เกิน” 5 นาที (หรือไม่มีเวลา/ไม่มี link2) → ไป Shopee อีกรอบ
      // อัปเดตเวลาออกใหม่เพื่อใช้ตัดสินรอบถัดไป
      localStorage.setItem(KEY_LEFT_AT, String(Date.now()));
      // ยังคง KEY_PENDING2 = "1" ไว้ เพื่อให้รอบถัดไปตัดสินได้อีก
      targetLoc.assign(link1);
    } else {
      // ไม่มี link1 ก็ยกเลิกสถานะค้าง
      localStorage.removeItem(KEY_PENDING2);
    }
  });
});
