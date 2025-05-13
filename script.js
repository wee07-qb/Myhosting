document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("button");
    const countdownText = document.getElementById("countdownText");
    const countSpan = document.getElementById("count");
    const goBtn = document.getElementById("goBtn");
    const cooldownSeconds = 10;
  
    if (!startBtn || !countdownText || !countSpan || !goBtn) return;
  
    // 🔗 ดึงลิงก์จาก data-attribute
    const link1 = startBtn.dataset.link1;
    const link2 = startBtn.dataset.link2;
  
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
  
    startBtn.addEventListener("click", () => {
      localStorage.setItem("cooldownTime", Date.now());
      setCooldown(cooldownSeconds);
    });
  
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
  
    goBtn.addEventListener("click", () => {
  // ✅ เปิด link1 หลายลิงก์ในแท็บใหม่
  if (link1) {
    const links = link1.split(",");
    links.forEach(link => {
      window.open(link.trim(), "_blank");
    });
  }

  // ✅ แสดง popup ให้ user ยืนยันก่อน redirect
  Swal.fire({
    title: "พร้อมแล้ว!",
    text: "คลิกเพื่อไปยังเว็บไซต์",
    icon: "success",
    confirmButtonText: "ไปเลย!",
  }).then((result) => {
    if (result.isConfirmed && link2) {
      window.location.href = link2; // redirect หน้าปัจจุบัน
    }
  });
});
});
  
