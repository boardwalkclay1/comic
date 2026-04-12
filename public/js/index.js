<script>
window.addEventListener("DOMContentLoaded", () => {
  const pages = Array.from(document.querySelectorAll(".page"));
  const galaxy = document.getElementById("comicGalaxy");
  let index = 0;

  /* ============================================================
     1. PAGE FLIP INTRO (1 → 10)
  ============================================================ */
  function showNextPage() {
    const prev = pages[index - 1];
    const current = pages[index];

    if (prev) {
      prev.classList.remove("page--active");
      prev.classList.add("page--burn");
    }

    if (current) {
      current.classList.remove("page--burn");
      current.classList.add("page--active");
    }

    index++;

    if (index <= pages.length) {
      setTimeout(showNextPage, 260);
    } else {
      // After final burn, spawn galaxy
      setTimeout(() => {
        pages.forEach(p => p.classList.remove("page--burn"));
        spawnGalaxyPages();
      }, 1200);
    }
  }

  setTimeout(showNextPage, 400);

  /* ============================================================
     2. FLOATING GALAXY PAGES (AFTER INTRO)
  ============================================================ */
  function spawnGalaxyPages() {
    pages.forEach((p, i) => {
      const g = document.createElement("div");
      g.className = "comic-galaxy-page";
      g.style.backgroundImage = p.style.backgroundImage;

      // Random starting position
      g.style.left = Math.random() * 80 + "vw";
      g.style.top = Math.random() * 60 + "vh";

      // Staggered animation
      g.style.animationDelay = (i * 2) + "s";

      galaxy.appendChild(g);
    });
  }
});
</script>
