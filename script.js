
document.addEventListener("DOMContentLoaded", () => {
  const startBtn      = document.getElementById("button");
  const countdownText = document.getElementById("countdownText");
  const countSpan     = document.getElementById("count");
  const goBtn         = document.getElementById("goBtn");

  if (!startBtn || !countdownText || !countSpan || !goBtn) return;

  const COOLDOWN_SEC = 5;
  const THRESHOLD_MS = 5 * 60 * 1000;
  const KEY_COOLDOWN = "cooldownTime";
  const KEY_LAST_L1  = "last_link1_time";

  const link1 = (startBtn.dataset.link1 || goBtn.dataset.link1 || "").trim();
  const link2 = (startBtn.dataset.link2 || goBtn.dataset.link2 || "").trim();

  startBtn.removeAttribute("data-bs-toggle");
  startBtn.classList.remove("active");
  goBtn.style.display = "none";
  countdownText.style.display = "none";

  const targetLoc = (window.top === window.self) ? window.location : window.top.location;

  // ==== Countdown ====
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

  // Resume cooldown
  (function(){
    const last = Number(localStorage.getItem(KEY_COOLDOWN) || 0);
    if (!last) return;
    const elapsed = Math.floor((Date.now() - last) / 1000);
    const remain  = COOLDOWN_SEC - elapsed;
    if (remain > 0) startCooldown(remain);
    else localStorage.removeItem(KEY_COOLDOWN);
  })();

  // ==== GO BUTTON ====
  goBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const lastL1 = Number(localStorage.getItem(KEY_LAST_L1) || 0);
    const now    = Date.now();
    const within5min = lastL1 && (now - lastL1) <= THRESHOLD_MS;

    // ถ้าอยู่ใน 5 นาที => ไป link2 เลย
    if (within5min && link2) {
      await Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "กำลังพาไปยังเว็บไซต์...",
        timer: 1500,
        showConfirmButton: false
      });
      targetLoc.assign(link2);
      return;
    }

    // ถ้าเกิน 5 นาที หรือยังไม่เคยกด => ยิงทั้ง link1 และ link2
    const goDual = async () => {
      if (link1) {
        const w = window.open(link1, "_blank", "noopener,noreferrer");
        if (w) { try { w.opener = null; } catch {} }
        localStorage.setItem(KEY_LAST_L1, String(now));
      }

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "กำลังพาไปยังเว็บไซต์...",
        timer: 1500,
        showConfirmButton: false
      });

      if (link2) {
        targetLoc.assign(link2);
      } else if (link1) {
        targetLoc.assign(link1);
      }
    };

    await goDual();
  });
});
