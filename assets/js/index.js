window.addEventListener("DOMContentLoaded", () => {
  const scenes = Array.from(document.querySelectorAll(".scene"));

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

  activateScene(1);
});
