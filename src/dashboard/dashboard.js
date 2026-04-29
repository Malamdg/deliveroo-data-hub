import dashboardTemplate from "./dashboard.html";
import dashboardStyles from "./dashboard.css";

export function createDashboard() {
  let root = null;

  function mount(callbacks = {}) {
    injectStyles();

    root = document.createElement("div");
    root.id = "deliveroo-data-hub";
    root.innerHTML = dashboardTemplate;

    document.body.appendChild(root);

    root.querySelector("[data-ddh-close]").addEventListener("click", destroy);

    root.querySelector("[data-ddh-start]").addEventListener("click", () => {
      callbacks.onStart?.({
        startDateValue: root.querySelector("[data-ddh-start-date]").value,
        endDateValue: root.querySelector("[data-ddh-end-date]").value
      });
    });

    root.querySelector("[data-ddh-pause]").addEventListener("click", () => {
      callbacks.onPause?.();
    });

    root.querySelector("[data-ddh-resume]")?.addEventListener("click", () => {
      callbacks.onResume?.();
    });

    root.querySelector("[data-ddh-stop]").addEventListener("click", () => {
      callbacks.onStop?.();
    });

    root.querySelector("[data-ddh-reset]")?.addEventListener("click", () => {
      callbacks.onReset?.();
    });

    root.querySelector("[data-ddh-export]").addEventListener("click", () => {
      callbacks.onExport?.({
        format: root.querySelector("[data-ddh-export-format]")?.value || "json"
      });
    });

    const logsToggleButton = root.querySelector("[data-ddh-logs-toggle]");
    const logsContainer = root.querySelector("[data-ddh-logs]");

    logsToggleButton?.addEventListener("click", () => {
      if (!logsContainer) return;

      const isHidden = logsContainer.hidden;
      logsContainer.hidden = !isHidden;
      logsToggleButton.textContent = isHidden ? "Hide logs" : "Show logs";
    });
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

    const map = {
      "[data-ddh-status]": stats.status,
      "[data-ddh-collected-count]": stats.collectedCount,
      "[data-ddh-retained-count]": stats.retainedCount,
      "[data-ddh-total-spent]": `${stats.totalSpent ?? 0} €`,
      "[data-ddh-responses-captured]": stats.responsesCaptured,
      "[data-ddh-view-more-clicks]": stats.viewMoreClicks,
      "[data-ddh-oldest-date]": stats.oldestDate,
      "[data-ddh-newest-date]": stats.newestDate
    };

    for (const [selector, value] of Object.entries(map)) {
      const element = root.querySelector(selector);
      if (element && value !== undefined) {
        element.textContent = String(value);
      }
    }

    updateControls(stats.status);
  }

  function updateControls(status) {
    if (!root) return;

    const start = root.querySelector("[data-ddh-start]");
    const pause = root.querySelector("[data-ddh-pause]");
    const resume = root.querySelector("[data-ddh-resume]");
    const stop = root.querySelector("[data-ddh-stop]");
    const exportJson = root.querySelector("[data-ddh-export]");

    const isRunning = status === "running";
    const isPaused = status === "paused";

    if (start) start.disabled = isRunning || isPaused;
    if (pause) pause.disabled = !isRunning;
    if (resume) resume.disabled = !isPaused;
    if (stop) stop.disabled = !isRunning && !isPaused;
    if (exportJson) exportJson.disabled = isRunning;
  }

  function showError(message) {
    if (!root) return;

    const element = root.querySelector("[data-ddh-error]");
    if (!element) return;

    if (!message) {
      element.hidden = true;
      element.textContent = "";
      return;
    }

    element.hidden = false;
    element.textContent = message;
  }

  function addLog(entry) {
    if (!root) return;

    const list = root.querySelector("[data-ddh-logs]");
    if (!list) return;

    const item = document.createElement("div");
    item.className = `ddh-log-entry ddh-log-entry--${entry.level}`;
    item.textContent = `[${new Date(entry.createdAt).toLocaleTimeString()}] ${entry.message}`;

    list.prepend(item);

    while (list.children.length > 80) {
      list.lastElementChild?.remove();
    }
  }

  return {
    mount,
    destroy,
    updateStats,
    showError,
    addLog
  };
}