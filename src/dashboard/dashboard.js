import dashboardTemplate from "./dashboard.html";
import dashboardStyles from "./dashboard.css";

export function createDashboard() {
  let root = null;

  function mount() {
    injectStyles();

    root = document.createElement("div");
    root.id = "deliveroo-data-hub";
    root.innerHTML = dashboardTemplate;

    document.body.appendChild(root);

    root.querySelector("[data-ddh-close]").addEventListener("click", destroy);
  }

  function injectStyles() {
    if (document.getElementById("deliveroo-data-hub-styles")) return;

    const style = document.createElement("style");
    style.id = "deliveroo-data-hub-styles";
    style.textContent = dashboardStyles;
    document.head.appendChild(style);
  }

  function destroy() {
    root?.remove();
    root = null;
  }

  function updateStats(stats) {
    if (!root) return;

    const collectedCountElement = root.querySelector("[data-ddh-collected-count]");

    if (collectedCountElement && typeof stats.collectedCount === "number") {
      collectedCountElement.textContent = String(stats.collectedCount);
    }
  }

  return {
    mount,
    destroy,
    updateStats
  };
}