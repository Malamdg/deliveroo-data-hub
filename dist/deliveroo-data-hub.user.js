// ==UserScript==
// @name         Deliveroo Data Hub
// @namespace    https://github.com/Malamdg/deliveroo-data-hub
// @version      0.1.0
// @description  Retrieve and export your Deliveroo order history as structured JSON.
// @author       MalaM
// @include      https://deliveroo.tld/*
// @include      https://www.deliveroo.tld/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==


(() => {
  // src/dashboard/dashboard.html
  var dashboard_default = '<section class="ddh-panel">\n  <header class="ddh-header">\n    <div>\n      <strong>Deliveroo Data Hub</strong>\n      <span class="ddh-status" data-ddh-status>Idle</span>\n    </div>\n\n    <button class="ddh-close" type="button" data-ddh-close>\xD7</button>\n  </header>\n\n  <main class="ddh-body">\n    <label>\n      Date de d\xE9but\n      <input type="date" class="ddh-input" data-ddh-start-date />\n    </label>\n\n    <label>\n      Date de fin\n      <input type="date" class="ddh-input" data-ddh-end-date />\n    </label>\n\n    <div class="ddh-actions">\n      <button type="button" data-ddh-start>Start</button>\n      <button type="button" data-ddh-pause>Pause</button>\n      <button type="button" data-ddh-resume>Resume</button>\n      <button type="button" data-ddh-stop>Stop</button>\n      <button type="button" data-ddh-reset>Reset</button>\n      <label class="ddh-export-format">\n        Format d\u2019export\n        <select class="ddh-input" data-ddh-export-format>\n          <option value="json">JSON</option>\n          <option value="csv">CSV</option>\n        </select>\n      </label>\n      <button type="button" data-ddh-export>Export</button>\n    </div>\n\n    <div class="ddh-stats">\n      <div>Commandes collect\xE9es : <strong data-ddh-collected-count>0</strong></div>\n      <div>Commandes retenues : <strong data-ddh-retained-count>0</strong></div>\n      <div>Total d\xE9pens\xE9 : <strong data-ddh-total-spent>0 \u20AC</strong></div>\n      <div>R\xE9ponses captur\xE9es : <strong data-ddh-responses-captured>0</strong></div>\n      <div>Clics voir plus : <strong data-ddh-view-more-clicks>0</strong></div>\n      <div>Plus r\xE9cente : <strong data-ddh-newest-date>N/A</strong></div>\n      <div>Plus ancienne : <strong data-ddh-oldest-date>N/A</strong></div>\n      <div class="ddh-error" data-ddh-error hidden></div>\n    </div>\n    <section class="ddh-logs">\n      <button type="button" class="ddh-logs-toggle" data-ddh-logs-toggle>\n        Show logs\n      </button>\n\n      <div class="ddh-log-list" data-ddh-logs hidden></div>\n    </section>\n  </main>\n</section>';

  // src/dashboard/dashboard.css
  var dashboard_default2 = "#deliveroo-data-hub {\n  position: fixed;\n  top: 16px;\n  right: 16px;\n  z-index: 999999;\n  font-family: Arial, sans-serif;\n}\n\n.ddh-panel {\n  width: 360px;\n  background: #ffffff;\n  color: #1f2937;\n  border: 1px solid #e5e7eb;\n  border-radius: 14px;\n  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);\n  overflow: hidden;\n}\n\n.ddh-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 14px 16px;\n  background: #00ccbc;\n  color: #ffffff;\n}\n\n.ddh-status {\n  margin-left: 8px;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: rgba(255, 255, 255, 0.22);\n  font-size: 12px;\n}\n\n.ddh-close {\n  border: none;\n  background: transparent;\n  color: white;\n  font-size: 24px;\n  cursor: pointer;\n}\n\n.ddh-body {\n  display: grid;\n  gap: 12px;\n  padding: 16px;\n}\n\n.ddh-body label {\n  display: grid;\n  gap: 4px;\n  font-size: 13px;\n  font-weight: 600;\n}\n\n.ddh-input {\n  padding: 8px;\n  border: 1px solid #d1d5db;\n  border-radius: 8px;\n}\n\n.ddh-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n\n.ddh-actions button {\n  border: none;\n  border-radius: 8px;\n  padding: 8px 10px;\n  background: #6d28d9;\n  color: white;\n  cursor: pointer;\n  font-weight: 600;\n}\n\n.ddh-stats {\n  display: grid;\n  gap: 6px;\n  padding: 10px;\n  border-radius: 10px;\n  background: #f9fafb;\n  font-size: 13px;\n}\n\n.ddh-error {\n  margin-top: 8px;\n  padding: 8px;\n  border-radius: 8px;\n  background: #fee2e2;\n  color: #991b1b;\n  font-weight: 600;\n}\n\n.ddh-logs {\n  display: grid;\n  gap: 6px;\n  padding: 0 16px 16px;\n  font-size: 12px;\n}\n\n.ddh-logs-toggle {\n  border: 1px solid #d1d5db;\n  border-radius: 8px;\n  padding: 8px 10px;\n  background: #f9fafb;\n  color: #374151;\n  cursor: pointer;\n  font-weight: 600;\n  text-align: left;\n}\n\n.ddh-log-list {\n  max-height: 160px;\n  overflow: auto;\n  padding: 8px;\n  border-radius: 8px;\n  background: #111827;\n  color: #f9fafb;\n}\n\n.ddh-log-entry {\n  margin-bottom: 4px;\n  opacity: 0.9;\n}\n\n.ddh-log-entry--warn {\n  color: #fbbf24;\n}\n\n.ddh-log-entry--error {\n  color: #f87171;\n}\n\n.ddh-actions button:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}";

  // src/dashboard/dashboard.js
  function createDashboard() {
    let root = null;
    function mount(callbacks = {}) {
      injectStyles();
      root = document.createElement("div");
      root.id = "deliveroo-data-hub";
      root.innerHTML = dashboard_default;
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
      style.textContent = dashboard_default2;
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
        "[data-ddh-total-spent]": `${stats.totalSpent ?? 0} \u20AC`,
        "[data-ddh-responses-captured]": stats.responsesCaptured,
        "[data-ddh-view-more-clicks]": stats.viewMoreClicks,
        "[data-ddh-oldest-date]": stats.oldestDate,
        "[data-ddh-newest-date]": stats.newestDate
      };
      for (const [selector, value] of Object.entries(map)) {
        const element = root.querySelector(selector);
        if (element && value !== void 0) {
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

  // src/core/dateRange.js
  function createInclusiveDateRange(startDateValue, endDateValue) {
    if (!startDateValue) throw new Error("Start date is required.");
    if (!endDateValue) throw new Error("End date is required.");
    const start = /* @__PURE__ */ new Date(`${startDateValue}T00:00:00.000`);
    const end = /* @__PURE__ */ new Date(`${endDateValue}T23:59:59.999`);
    if (Number.isNaN(start.getTime())) throw new Error("Invalid start date.");
    if (Number.isNaN(end.getTime())) throw new Error("Invalid end date.");
    if (start > end) throw new Error("Start date must be before end date.");
    return { start, end };
  }
  function isOrderInsideDateRange(order, dateRange) {
    const submittedAt = new Date(order?.submitted_at);
    if (Number.isNaN(submittedAt.getTime())) {
      return false;
    }
    return submittedAt >= dateRange.start && submittedAt <= dateRange.end;
  }
  function isLowerBoundReached(orders, dateRange) {
    if (!orders.length) return false;
    const oldestOrder = orders[orders.length - 1];
    const oldestDate = new Date(oldestOrder?.submitted_at);
    if (Number.isNaN(oldestDate.getTime())) {
      return false;
    }
    return oldestDate <= dateRange.start;
  }

  // src/core/csvExporter.js
  function convertOrdersToCsv(orders) {
    if (!orders || !orders.length) return "";
    const headers = [
      "order_id",
      "date",
      "restaurant_name",
      "total_amount",
      "currency",
      "status",
      "items_count"
    ];
    const rows = orders.map((order) => [
      order.id || "",
      formatDate(order.submitted_at),
      sanitize(order.restaurant?.name),
      formatAmount(order.total),
      order.currency_code || order.currency_symbol || "",
      order.status || "",
      order.items?.length || 0
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsv).join(","))
    ].join("\n");
    return csvContent;
  }
  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  }
  function formatAmount(value) {
    if (value === null || value === void 0 || value === "") return "";
    const amount = Number.parseFloat(String(value).replace(",", "."));
    if (Number.isNaN(amount)) return "";
    return amount.toFixed(2);
  }
  function sanitize(value) {
    if (value === null || value === void 0) return "";
    return String(value).trim();
  }
  function escapeCsv(value) {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // src/core/exporter.js
  function createExportPayload({ orders, dateRange, runtime }) {
    const retainedOrders = orders.filter(
      (order) => isOrderInsideDateRange(order, dateRange)
    );
    const totalSpent = retainedOrders.reduce((sum, order) => {
      return sum + Number.parseFloat(order.total || 0);
    }, 0);
    const restaurants = new Set(
      retainedOrders.map((order) => order.restaurant?.id || order.restaurant?.name).filter(Boolean)
    );
    return {
      exported_at: (/* @__PURE__ */ new Date()).toISOString(),
      filters: {
        start_date: dateRange.start.toISOString(),
        end_date: dateRange.end.toISOString()
      },
      collection: {
        started_at: runtime.startedAt,
        finished_at: (/* @__PURE__ */ new Date()).toISOString(),
        responses_captured: runtime.responsesCaptured,
        view_more_clicks: runtime.viewMoreClicks,
        orders_collected: orders.length,
        orders_retained: retainedOrders.length
      },
      stats: {
        retained_total_spent: Number(totalSpent.toFixed(2)),
        retained_distinct_restaurants: restaurants.size
      },
      orders: retainedOrders
    };
  }
  function downloadJson(payload, filename = "deliveroo-orders.json") {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
  function downloadCsv(csvContent, filename = "deliveroo-orders.csv") {
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // src/core/scraperEngine.js
  function createScraperEngine({
    store,
    networkInterceptor,
    domInitialExtractor,
    dashboard,
    viewMoreSelector = "#view-more-orders"
  }) {
    const runtime = {
      status: "idle",
      startedAt: null,
      responsesCaptured: 0,
      viewMoreClicks: 0,
      emptyRounds: 0,
      dateRange: null,
      isPaused: false,
      isStopped: false
    };
    function getViewMoreButton() {
      return document.querySelector(viewMoreSelector);
    }
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    function updateDashboard() {
      const orders = store.getOrders();
      const retainedOrders = runtime.dateRange ? orders.filter((order) => isOrderInsideDateRange(order, runtime.dateRange)) : [];
      const totalSpent = retainedOrders.reduce((sum, order) => {
        return sum + Number.parseFloat(order.total || 0);
      }, 0);
      dashboard.updateStats?.({
        status: runtime.status,
        collectedCount: orders.length,
        retainedCount: retainedOrders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        responsesCaptured: runtime.responsesCaptured,
        viewMoreClicks: runtime.viewMoreClicks,
        oldestDate: orders.at(-1)?.submitted_at || "N/A",
        newestDate: orders.at(0)?.submitted_at || "N/A"
      });
    }
    function ingestOrders(orders) {
      const result = store.addOrders(orders);
      updateDashboard();
      return result;
    }
    async function start({ startDateValue, endDateValue }) {
      try {
        runtime.dateRange = createInclusiveDateRange(startDateValue, endDateValue);
        runtime.status = "running";
        runtime.startedAt = (/* @__PURE__ */ new Date()).toISOString();
        runtime.isPaused = false;
        runtime.isStopped = false;
        runtime.responsesCaptured = 0;
        runtime.viewMoreClicks = 0;
        runtime.emptyRounds = 0;
        store.clear();
        networkInterceptor.install();
        const initialOrders = domInitialExtractor.extractOrders?.() ?? [];
        if (initialOrders.length > 0) {
          ingestOrders(initialOrders);
        }
        updateDashboard();
        while (!runtime.isStopped) {
          if (runtime.isPaused) {
            await sleep(500);
            continue;
          }
          const orders = store.getOrders();
          if (isLowerBoundReached(orders, runtime.dateRange)) {
            runtime.status = "finished";
            updateDashboard();
            break;
          }
          const button = getViewMoreButton();
          if (!button || button.disabled) {
            runtime.emptyRounds += 1;
            if (runtime.emptyRounds >= 5) {
              runtime.status = "finished";
              updateDashboard();
              break;
            }
            await sleep(1e3);
            continue;
          }
          button.scrollIntoView({ block: "center" });
          await sleep(300);
          button.click();
          runtime.viewMoreClicks += 1;
          updateDashboard();
          await sleep(2200);
          const newOrders = store.getOrders();
          if (newOrders.length === orders.length) {
            runtime.emptyRounds += 1;
          } else {
            runtime.emptyRounds = 0;
          }
          if (runtime.emptyRounds >= 5) {
            runtime.status = "finished";
            updateDashboard();
            break;
          }
        }
      } catch (error) {
        runtime.status = "error";
        dashboard.showError?.(error.message);
        updateDashboard();
      }
    }
    function onNetworkOrdersCaptured(orders) {
      runtime.responsesCaptured += 1;
      ingestOrders(orders);
    }
    function pause() {
      runtime.isPaused = true;
      runtime.status = "paused";
      updateDashboard();
    }
    function resume() {
      runtime.isPaused = false;
      runtime.status = "running";
      updateDashboard();
    }
    function stop() {
      runtime.isStopped = true;
      runtime.status = "stopped";
      updateDashboard();
    }
    function reset() {
      stop();
      store.clear();
      runtime.status = "idle";
      runtime.dateRange = null;
      runtime.responsesCaptured = 0;
      runtime.viewMoreClicks = 0;
      runtime.emptyRounds = 0;
      updateDashboard();
    }
    function exportData({ format = "json" } = {}, logger) {
      if (!runtime.dateRange) {
        throw new Error("Date range is required before exporting.");
      }
      const orders = store.getOrders();
      if (!orders.length) {
        logger.warn("No orders found");
        return;
      }
      const payload = createExportPayload({
        orders,
        dateRange: runtime.dateRange,
        runtime
      });
      if (!payload.orders.length) {
        logger.warn("No orders found for selected date range");
        return;
      }
      if (format === "csv") {
        const csv = convertOrdersToCsv(payload.orders);
        downloadCsv(csv, "deliveroo-data-hub-orders.csv");
        return;
      }
      downloadJson(payload, "deliveroo-data-hub-orders.json");
    }
    return {
      start,
      pause,
      resume,
      stop,
      reset,
      exportData,
      onNetworkOrdersCaptured,
      updateDashboard
    };
  }

  // src/adapters/domInitialExtractor.js
  function extractOrders() {
    const orderCards = document.querySelectorAll(
      '[data-testid="order-card"], [class*="order"]'
    );
    const orders = [];
    for (const card of orderCards) {
      const order = extractOrderFromCard(card);
      if (order) orders.push(order);
    }
    return orders;
  }
  function extractOrderFromCard(card) {
    try {
      const id = extractOrderId(card);
      const submittedAt = extractDate(card);
      const restaurant = extractRestaurant(card);
      const total = extractTotal(card);
      if (!id || !submittedAt) return null;
      return {
        id,
        submitted_at: submittedAt,
        restaurant,
        total
      };
    } catch (e) {
      return null;
    }
  }
  function extractOrderId(card) {
    const attrId = card.getAttribute("data-order-id") || card.getAttribute("data-testid");
    if (attrId) return attrId;
    const text = card.textContent || "";
    const match = text.match(/#\d{4,}/);
    return match ? match[0] : `dom-${Math.random().toString(36).slice(2)}`;
  }
  function extractDate(card) {
    const timeEl = card.querySelector("time");
    if (timeEl?.dateTime) {
      return new Date(timeEl.dateTime).toISOString();
    }
    const text = card.textContent || "";
    const dateMatch = text.match(
      /\b\d{1,2}\s+\w+\s+\d{4}\b/
    );
    if (!dateMatch) return null;
    const parsed = new Date(dateMatch[0]);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  function extractRestaurant(card) {
    const el = card.querySelector('[data-testid="restaurant-name"]') || card.querySelector("h3") || card.querySelector("h2");
    if (!el) return null;
    return {
      name: el.textContent.trim()
    };
  }
  function extractTotal(card) {
    const text = card.textContent || "";
    const match = text.match(/(\d+[.,]\d{2})\s?€/);
    if (!match) return 0;
    return parseFloat(match[1].replace(",", "."));
  }
  function createDomInitialExtractor() {
    return {
      extractOrders
    };
  }

  // src/core/logger.js
  function createLogger({ onLog } = {}) {
    const entries = [];
    function push(level, message, payload = null) {
      const entry = {
        level,
        message,
        payload,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      entries.unshift(entry);
      onLog?.(entry);
      const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[method]("[DDH]", message, payload ?? "");
      return entry;
    }
    return {
      info: (message, payload) => push("info", message, payload),
      warn: (message, payload) => push("warn", message, payload),
      error: (message, payload) => push("error", message, payload),
      getEntries: () => [...entries],
      clear: () => entries.splice(0, entries.length)
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
        const dashboard = createDashboard();
        const logger = createLogger({
          onLog(entry) {
            dashboard.addLog?.(entry);
          }
        });
        const domInitialExtractor = createDomInitialExtractor();
        let scraperEngine = null;
        const networkInterceptor = createNetworkInterceptor({
          onOrdersCaptured({ orders }) {
            scraperEngine?.onNetworkOrdersCaptured(orders);
            logger.info(`Captured ${orders.length} orders from network`);
          },
          onLog(entry) {
            logger.info(entry.message, entry.payload);
          }
        });
        scraperEngine = createScraperEngine({
          store,
          networkInterceptor,
          domInitialExtractor,
          dashboard
        });
        dashboard.mount({
          onStart({ startDateValue, endDateValue }) {
            logger.info("Scraping started");
            scraperEngine.start({ startDateValue, endDateValue });
          },
          onPause() {
            logger.info("Scraping paused");
            scraperEngine.pause();
          },
          onResume() {
            logger.info("Scraping resumed");
            scraperEngine.resume();
          },
          onStop() {
            logger.info("Scraping stopped");
            scraperEngine.stop();
          },
          onReset() {
            logger.info("Scraping reset");
            scraperEngine.reset();
          },
          onExport({ format }) {
            logger.info(`Export requested: ${format}`);
            scraperEngine.exportData({ format }, logger);
          }
        });
        window.__deliverooDataHub = {
          store,
          dashboard,
          logger,
          networkInterceptor,
          scraperEngine,
          destroy() {
            networkInterceptor.uninstall();
            dashboard.destroy();
            delete window.__deliverooDataHub;
          }
        };
        logger.info("Deliveroo Data Hub initialized");
      }
    };
  }

  // src/index.js
  createUserscriptRunner().start();
})();
