import { createDashboard } from "../dashboard/dashboard.js";
import { createNetworkInterceptor } from "../adapters/networkInterceptor.js";
import { createOrderStore } from "../core/orderStore.js";
import { createScraperEngine } from "../core/scraperEngine.js";
import { createDomInitialExtractor } from "../adapters/domInitialExtractor.js";
import { createLogger } from "../core/logger.js";

export function createUserscriptRunner() {
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
          scraperEngine.exportData({ format });
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