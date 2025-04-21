document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("button");
  const countdownText = document.getElementById("countdownText");
  const countSpan = document.getElementById("count");
  const goBtn = document.getElementById("goBtn");
  const cooldownSeconds = 10;

  // ✅ ฟังก์ชันนับถอยหลัง
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

  // ✅ ตอนคลิกปุ่มแรก
  startBtn.addEventListener("click", () => {
    localStorage.setItem("cooldownTime", Date.now());
    setCooldown(cooldownSeconds);
  });

  // ✅ ตอนโหลดหน้า → เช็กว่ามี cooldown ที่เก็บไว้ไหม
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

  // ✅ ปุ่มไปยังเว็บปลายทาง
  goBtn.addEventListener("click", () => {
    window.open("https://s.shopee.co.th/8KcLx5n3x2", "_blank"); // เปิดลิงก์แรกในแท็บใหม่
  
    Swal.fire({
      title: "พร้อมแล้ว!",
      text: "คลิกเพื่อไปยังเว็บไซต์",
      icon: "success",
      confirmButtonText: "ไปเลย!",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "https://mcpedl.org/getfile/5416"; // ลิงก์ที่เปลี่ยนหน้าปัจจุบัน
      }
    });
  });  
});
