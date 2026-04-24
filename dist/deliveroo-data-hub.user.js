// ==UserScript==
// @name         Deliveroo Data Hub
// @namespace    https://github.com/Malamdg/deliveroo-data-hub
// @version      0.1.0
// @description  Retrieve and export your Deliveroo order history as structured JSON.
// @author       MalaM
// @match        https://deliveroo.*/*
// @match        https://www.deliveroo.*/*
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

  // src/core/orderExtractor.js
  function extractOrdersPayload(json, sourceUrl = "") {
    if (!json || typeof json !== "object") {
      return null;
    }
    if (Array.isArray(json.orders)) {
      return {
        orders: json.orders,
        count: json.count ?? null,
        sourceUrl
      };
    }
    const stack = [json];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || typeof current !== "object") {
        continue;
      }
      if (Array.isArray(current.orders) && current.orders.every((order) => order && typeof order === "object")) {
        return {
          orders: current.orders,
          count: current.count ?? null,
          sourceUrl
        };
      }
      for (const value of Object.values(current)) {
        if (value && typeof value === "object") {
          stack.push(value);
        }
      }
    }
    return null;
  }

  // src/adapters/networkInterceptor.js
  function createNetworkInterceptor({ onOrdersCaptured, onLog }) {
    let isInstalled = false;
    let originalFetch = null;
    let originalXhrOpen = null;
    let originalXhrSend = null;
    function log(message, payload = null) {
      onLog?.({
        source: "network",
        message,
        payload,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    function shouldInspectResponse(url, contentType = "") {
      return contentType.includes("application/json") || contentType.includes("graphql") || url.includes("orders") || url.includes("graphql");
    }
    async function inspectJsonResponse(json, sourceUrl, transport) {
      const payload = extractOrdersPayload(json, sourceUrl);
      if (!payload || payload.orders.length === 0) {
        return;
      }
      onOrdersCaptured?.({
        orders: payload.orders,
        count: payload.count,
        sourceUrl,
        transport,
        capturedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      log(`Captured ${payload.orders.length} orders from ${transport}`, {
        sourceUrl,
        count: payload.count
      });
    }
    function installFetchInterceptor() {
      originalFetch = window.fetch.bind(window);
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        try {
          const requestUrl = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
          const clonedResponse = response.clone();
          const contentType = clonedResponse.headers.get("content-type") || "";
          if (!shouldInspectResponse(requestUrl, contentType)) {
            return response;
          }
          clonedResponse.json().then((json) => inspectJsonResponse(json, requestUrl, "fetch")).catch(() => {
          });
        } catch (error) {
          log("Failed to inspect fetch response", {
            error: String(error)
          });
        }
        return response;
      };
    }
    function installXhrInterceptor() {
      originalXhrOpen = XMLHttpRequest.prototype.open;
      originalXhrSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function open(method, url, ...rest) {
        this.__ddhUrl = url;
        return originalXhrOpen.call(this, method, url, ...rest);
      };
      XMLHttpRequest.prototype.send = function send(...args) {
        this.addEventListener("load", function handleLoad() {
          try {
            const sourceUrl = this.__ddhUrl || "";
            const contentType = this.getResponseHeader?.("content-type") || "";
            if (!shouldInspectResponse(sourceUrl, contentType)) {
              return;
            }
            if (!this.responseText || typeof this.responseText !== "string") {
              return;
            }
            const json = JSON.parse(this.responseText);
            inspectJsonResponse(json, sourceUrl, "xhr");
          } catch (error) {
            log("Failed to inspect XHR response", {
              error: String(error)
            });
          }
        });
        return originalXhrSend.apply(this, args);
      };
    }
    function install() {
      if (isInstalled) {
        return;
      }
      installFetchInterceptor();
      installXhrInterceptor();
      isInstalled = true;
      log("Network interceptor installed");
    }
    function uninstall() {
      if (!isInstalled) {
        return;
      }
      if (originalFetch) {
        window.fetch = originalFetch;
      }
      if (originalXhrOpen) {
        XMLHttpRequest.prototype.open = originalXhrOpen;
      }
      if (originalXhrSend) {
        XMLHttpRequest.prototype.send = originalXhrSend;
      }
      isInstalled = false;
      log("Network interceptor uninstalled");
    }
    return {
      install,
      uninstall,
      get isInstalled() {
        return isInstalled;
      }
    };
  }

  // src/core/orderStore.js
  function createOrderStore() {
    const ordersByKey = /* @__PURE__ */ new Map();
    function getOrderKey(order) {
      return order?.id || order?.drn_id || order?.drn || null;
    }
    function addOrders(orders) {
      let addedCount = 0;
      for (const order of orders) {
        const key = getOrderKey(order);
        if (!key) {
          continue;
        }
        if (!ordersByKey.has(key)) {
          addedCount += 1;
        }
        ordersByKey.set(key, order);
      }
      return {
        addedCount,
        totalCount: ordersByKey.size
      };
    }
    function getOrders() {
      return [...ordersByKey.values()].sort((a, b) => {
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      });
    }
    function clear() {
      ordersByKey.clear();
    }
    return {
      addOrders,
      getOrders,
      clear,
      get totalCount() {
        return ordersByKey.size;
      }
    };
  }

  // src/runners/userscriptRunner.js
  function createUserscriptRunner() {
    return {
      start() {
        if (window.__deliverooDataHub) {
          window.__deliverooDataHub.destroy?.();
        }
        const store = createOrderStore();
        const dashboard = createDashboard({
          getStats() {
            return {
              collectedCount: store.totalCount
            };
          }
        });
        const networkInterceptor = createNetworkInterceptor({
          onOrdersCaptured({ orders, transport }) {
            const result = store.addOrders(orders);
            console.log("[DDH] Orders captured", {
              transport,
              received: orders.length,
              added: result.addedCount,
              total: result.totalCount
            });
            dashboard.updateStats?.({
              collectedCount: result.totalCount
            });
          },
          onLog(entry) {
            console.log("[DDH]", entry.message, entry.payload ?? "");
          }
        });
        networkInterceptor.install();
        window.__deliverooDataHub = {
          store,
          dashboard,
          networkInterceptor,
          destroy() {
            networkInterceptor.uninstall();
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
