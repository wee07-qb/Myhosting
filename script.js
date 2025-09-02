
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("button");
  const countdownText = document.getElementById("countdownText");
  const countSpan = document.getElementById("count");
  const goBtn = document.getElementById("goBtn");
  const cooldownSeconds = 5;

  if (!startBtn || !countdownText || !countSpan || !goBtn) {
    console.warn("[countdown] element missing", { startBtn, countdownText, countSpan, goBtn });
    return;
  }

  // กัน Bootstrap toggle ทำให้ state แปลก
  startBtn.removeAttribute("data-bs-toggle");
  startBtn.classList.remove("active");
  startBtn.disabled = false;
  goBtn.style.display = "none";
  countdownText.style.display = "none";

  const link1 = (startBtn.dataset.link1 || "").trim();
  const link2 = (startBtn.dataset.link2 || "").trim();

  // ใช้ตัวแปรเก็บ interval กันการสร้างซ้ำ
  let countdownTimer = null;

  function clearTimer() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function setCooldown(seconds) {
    console.log("[countdown] start", seconds, "sec");
    clearTimer();
    startBtn.disabled = true;
    countdownText.style.display = "block";
    goBtn.style.display = "none";
    countSpan.textContent = seconds;

    countdownTimer = setInterval(() => {
      seconds -= 1;
      countSpan.textContent = seconds;
      if (seconds <= 0) {
        clearTimer();
        countdownText.style.display = "none";
        goBtn.style.display = "inline-block";
        localStorage.removeItem("cooldownTime");
        startBtn.style.display = "none";
        console.log("[countdown] done");
      }
    }, 1000);
  }

  // คลิกเริ่มนับ
  startBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("[countdown] button clicked");
    localStorage.setItem("cooldownTime", String(Date.now()));
    setCooldown(cooldownSeconds);
  });

  // ถ้ารีเฟรชระหว่างคูลดาวน์ ให้คืน state
  try {
    const lastClicked = localStorage.getItem("cooldownTime");
    if (lastClicked) {
      const now = Date.now();
      const elapsed = Math.floor((now - Number(lastClicked)) / 1000);
      const remaining = cooldownSeconds - elapsed;
      console.log("[countdown] resume check", { elapsed, remaining });
      if (remaining > 0) setCooldown(remaining);
      else localStorage.removeItem("cooldownTime");
    }
  } catch (err) {
    console.error("[countdown] resume error", err);
    localStorage.removeItem("cooldownTime");
  }

  // ไป Shopee แล้วตั้งธงกลับมาเปิด link2
  goBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const goNow = async () => {
      const targetLoc = (window.top === window.self) ? window.location : window.top.location;
      if (link1) {
        localStorage.setItem("pending_link2", "1");
        targetLoc.assign(link1);
        return;
      }
      if (link2) targetLoc.assign(link2);
    };

    if (typeof Swal !== "undefined") {
      const result = await Swal.fire({
        title: "พร้อมแล้ว!",
        text: "คลิกเพื่อไปยังเว็บไซต์",
        icon: "success",
        confirmButtonText: "ไปเลย!",
      });
      if (result.isConfirmed) goNow();
    } else {
      goNow();
    }
  });

  // กลับมาจาก Back ให้เด้ง link2
  window.addEventListener("pageshow", () => {
    const shouldGo2 = localStorage.getItem("pending_link2") === "1";
    const already = sessionStorage.getItem("link2_redirected") === "1";
    if (shouldGo2 && !already && link2) {
      localStorage.removeItem("pending_link2");
      sessionStorage.setItem("link2_redirected", "1");
      const targetLoc = (window.top === window.self) ? window.location : window.top.location;
      targetLoc.assign(link2);
    }
  });

  // กัน error ทำให้สคริปต์หยุดทั้งไฟล์แบบเงียบๆ
  window.addEventListener("error", (ev) => {
    console.error("[global error]", ev.message, ev.filename, ev.lineno + ":" + ev.colno);
  });
});
