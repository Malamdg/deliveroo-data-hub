// ==UserScript==
// @name         Deliveroo Data Hub
// @namespace    https://github.com/Malamdg/deliveroo-data-hub
// @version      0.1.0
// @description  Retrieve and export your Deliveroo order history as structured JSON.
// @author       MalaM
// @match        https://deliveroo.fr/*
// @match        https://www.deliveroo.fr/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==


(() => {
  // src/dashboard/dashboard.html
  var dashboard_default = '<section class="ddh-panel">\n  <header class="ddh-header">\n    <div>\n      <strong>Deliveroo Data Hub</strong>\n      <span class="ddh-status">Idle</span>\n    </div>\n\n    <button class="ddh-close" type="button" data-ddh-close>\xD7</button>\n  </header>\n\n  <main class="ddh-body">\n    <label>\n      Date de d\xE9but\n      <input type="date" class="ddh-input" data-ddh-start-date />\n    </label>\n\n    <label>\n      Date de fin\n      <input type="date" class="ddh-input" data-ddh-end-date />\n    </label>\n\n    <div class="ddh-actions">\n      <button type="button" data-ddh-start>Start</button>\n      <button type="button" data-ddh-pause>Pause</button>\n      <button type="button" data-ddh-stop>Stop</button>\n      <button type="button" data-ddh-export>Export JSON</button>\n    </div>\n\n    <div class="ddh-stats">\n      <div>Commandes collect\xE9es : <strong data-ddh-collected-count>0</strong></div>\n      <div>Commandes retenues : <strong data-ddh-retained-count>0</strong></div>\n      <div>Total d\xE9pens\xE9 : <strong data-ddh-total-spent>0 \u20AC</strong></div>\n    </div>\n  </main>\n</section>';

  // src/dashboard/dashboard.css
  var dashboard_default2 = "#deliveroo-data-hub {\n  position: fixed;\n  top: 16px;\n  right: 16px;\n  z-index: 999999;\n  font-family: Arial, sans-serif;\n}\n\n.ddh-panel {\n  width: 360px;\n  background: #ffffff;\n  color: #1f2937;\n  border: 1px solid #e5e7eb;\n  border-radius: 14px;\n  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);\n  overflow: hidden;\n}\n\n.ddh-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 14px 16px;\n  background: #00ccbc;\n  color: #ffffff;\n}\n\n.ddh-status {\n  margin-left: 8px;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.22);\n  font-size: 12px;\n}\n\n.ddh-close {\n  border: none;\n  background: transparent;\n  color: white;\n  font-size: 24px;\n  cursor: pointer;\n}\n\n.ddh-body {\n  display: grid;\n  gap: 12px;\n  padding: 16px;\n}\n\n.ddh-body label {\n  display: grid;\n  gap: 4px;\n  font-size: 13px;\n  font-weight: 600;\n}\n\n.ddh-input {\n  padding: 8px;\n  border: 1px solid #d1d5db;\n  border-radius: 8px;\n}\n\n.ddh-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n\n.ddh-actions button {\n  border: none;\n  border-radius: 8px;\n  padding: 8px 10px;\n  background: #6d28d9;\n  color: white;\n  cursor: pointer;\n  font-weight: 600;\n}\n\n.ddh-stats {\n  display: grid;\n  gap: 6px;\n  padding: 10px;\n  border-radius: 10px;\n  background: #f9fafb;\n  font-size: 13px;\n}";

  // src/dashboard/dashboard.js
  function createDashboard() {
    let root = null;
    function mount() {
      injectStyles();
      root = document.createElement("div");
      root.id = "deliveroo-data-hub";
      root.innerHTML = dashboard_default;
      document.body.appendChild(root);
      root.querySelector("[data-ddh-close]").addEventListener("click", destroy);
    }
    function injectStyles() {
      if (document.getElementById("deliveroo-data-hub-styles")) return;
      const style = document.createElement("style");
      style.id = "deliveroo-data-hub-styles";
      style.textContent = dashboard_default2;
      document.head.appendChild(style);
    }
    function destroy() {
      root?.remove();
      root = null;
    }
    return {
      mount,
      destroy
    };
  }

  // src/runners/userscriptRunner.js
  function createUserscriptRunner() {
    return {
      start() {
        if (window.__deliverooDataHub) {
          window.__deliverooDataHub.destroy?.();
        }
        const dashboard = createDashboard();
        window.__deliverooDataHub = {
          dashboard,
          destroy() {
            dashboard.destroy();
            delete window.__deliverooDataHub;
          }
        };
        dashboard.mount();
      }
    };
  }

  // src/index.js
  createUserscriptRunner().start();
})();
