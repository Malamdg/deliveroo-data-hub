import { createDashboard } from "../dashboard/dashboard.js";

export function createUserscriptRunner() {
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