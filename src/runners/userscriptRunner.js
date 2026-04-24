import { createDashboard } from "../dashboard/dashboard.js";
import { createNetworkInterceptor } from "../adapters/networkInterceptor.js";
import { createOrderStore } from "../core/orderStore.js";

export function createUserscriptRunner() {
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