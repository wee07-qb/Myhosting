document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("button");
  const countdownText = document.getElementById("countdownText");
  const countSpan = document.getElementById("count");
  const goBtn = document.getElementById("goBtn");
  const cooldownSeconds = 5;

  if (!startBtn || !countdownText || !countSpan || !goBtn) return;

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
  Swal.fire({
    title: "พร้อมแล้ว!",
    text: "คลิกเพื่อไปยังเว็บไซต์",
    icon: "success",
    confirmButtonText: "ไปเลย!",
  }).then((result) => {
    if (result.isConfirmed) {
      // ✅ เปิด link1
      if (link1) {
        const links = link1.split(",");
        links.forEach(link => {
          window.open(link.trim(), "_blank");
        });
      }

      // ✅ redirect หน้าไป link2
      if (link2) {
        window.location.href = link2;
      }
    }
  });
 });
});

  /*const btn = document.getElementById('button');
  btn.addEventListener('click', () => {
  window.open("https://www.lazada.co.th/products/2022-i5661814104-s24147192009.html?trafficFrom=17449020_303586&laz_trackid=2:mm_321251106_287552583_2244402583:clkgikqsm1ir5bco0e9r4o&mkttid=clkgikqsm1ir5bco0e9r4o", "_blank");
  });*/

