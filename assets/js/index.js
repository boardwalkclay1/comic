window.addEventListener("DOMContentLoaded", () => {
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const byId = (id) => document.querySelector(id);

  function activateScene(num) {
    scenes.forEach((s) => {
      s.classList.toggle("scene--active", s.dataset.scene === String(num));
    });
  }

  document.querySelectorAll(".scene__next-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.next;
      if (next) activateScene(next);
    });
  });

  const chooseModeBtn = byId("#chooseModeBtn");
  if (chooseModeBtn) {
    chooseModeBtn.addEventListener("click", () => {
      // Just a small flash effect; theme toggle is separate
      document.body.classList.add("flash");
      setTimeout(() => document.body.classList.remove("flash"), 300);
    });
  }

  // Optional: auto‑advance after a delay per scene
  // You can tune these timings later if you want it to play like a movie.
});
