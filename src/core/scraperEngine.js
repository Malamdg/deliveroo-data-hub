import {
  createInclusiveDateRange,
  isLowerBoundReached,
  isOrderInsideDateRange
} from "./dateRange.js";
import {
  createExportPayload,
  downloadJson,
  downloadCsv
} from "./exporter.js";

import { convertOrdersToCsv } from "./csvExporter.js";

export function createScraperEngine({
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function updateDashboard() {
    const orders = store.getOrders();
    const retainedOrders = runtime.dateRange
      ? orders.filter(order => isOrderInsideDateRange(order, runtime.dateRange))
      : [];

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
      runtime.startedAt = new Date().toISOString();
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

          await sleep(1000);
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

  function exportData({ format = "json" } = {}) {
    if (!runtime.dateRange) {
      throw new Error("Date range is required before exporting.");
    }

    const orders = store.getOrders();

    const payload = createExportPayload({
      orders,
      dateRange: runtime.dateRange,
      runtime
    });

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