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
    if (remaining > 0) setCooldown(remaining);
    else localStorage.removeItem("cooldownTime");
  }

  // ไป Shopee แท็บเดิม + ตั้งธงกลับมาให้ไป link2
  goBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // ถ้ามี SweetAlert2 ก็ให้ยืนยันก่อน
    if (typeof Swal !== "undefined") {
      const result = await Swal.fire({
        title: "พร้อมแล้ว!",
        text: "คลิกเพื่อไปยังเว็บไซต์",
        icon: "success",
        confirmButtonText: "ไปเลย!",
      });
      if (!result.isConfirmed) return;
    }

    const targetLoc = (window.top === window.self) ? window.location : window.top.location;

    if (link1) {
      localStorage.setItem("pending_link2", "1");  // ธงว่า 'กลับมาค่อยไป link2'
      targetLoc.assign(link1);                     // เด้ง Shopee ในแท็บเดิม
      return;                                      // โค้ดหลังจากนี้จะไม่รันต่อ
    }
    if (link2) targetLoc.assign(link2);
  });

  // เมื่อย้อนกลับมาหน้านี้ ให้เช็กธงแล้วไป link2
  window.addEventListener("pageshow", () => {
    const shouldGo2 = localStorage.getItem("pending_link2") === "1";
    const already = sessionStorage.getItem("link2_redirected") === "1";
    if (shouldGo2 && !already && link2) {
      localStorage.removeItem("pending_link2");            // กันวน
      sessionStorage.setItem("link2_redirected", "1");     // กันซ้ำในรอบเดียว
      const targetLoc = (window.top === window.self) ? window.location : window.top.location;
      targetLoc.assign(link2);                              // เด้ง link2 ในแท็บเดิม
    }
  });
});    });

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

