document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("button"); // ปุ่มแรกของคุณ
    const countdownText = document.getElementById("countdownText");
    const countSpan = document.getElementById("count");
    const goBtn = document.getElementById("goBtn");
  
    startBtn.addEventListener("click", () => {
      startBtn.disabled = true; // ป้องกันกดซ้ำ
      countdownText.style.display = "block";
  
      let seconds = 10;
      countSpan.textContent = seconds;
  
      const countdown = setInterval(() => {
        seconds--;
        countSpan.textContent = seconds;
  
        if (seconds <= 0) {
          clearInterval(countdown);
          countdownText.style.display = "none";
          goBtn.style.display = "inline-block";
        }
      }, 1000);
    });
  
    goBtn.addEventListener("click", () => {
      Swal.fire({
        title: "พร้อมแล้ว!",
        text: "คลิกเพื่อไปยังเว็บไซต์",
        icon: "success",
        confirmButtonText: "ไปเลย!"
      }).then((result) => {
        if (result.isConfirmed) {
          // เปิดเว็บไซต์ในแท็บใหม่ โดยใช้ URL ที่แฝงไว้
          window.open("https://mcpedl.org/getfile/5416", "_blank"); // เปิดในแท็บใหม่
          window.location.href = "https://collshp.com/vian628"; // URL ที่แสดงในเบราว์เซอร์
        }
      });
    });
});
