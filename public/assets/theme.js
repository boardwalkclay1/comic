(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem("bu-theme");
  if (stored === "villain" || stored === "hero") {
    root.setAttribute("data-theme", stored);
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") === "villain" ? "hero" : "villain";
    root.setAttribute("data-theme", current);
    localStorage.setItem("bu-theme", current);
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#themeToggle").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
  });
})();
