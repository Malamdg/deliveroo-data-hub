import { extractOrdersPayload } from "../core/orderExtractor.js";

export function createNetworkInterceptor({ onOrdersCaptured, onLog }) {
  let isInstalled = false;
  let originalFetch = null;
  let originalXhrOpen = null;
  let originalXhrSend = null;

  function log(message, payload = null) {
    onLog?.({
      source: "network",
      message,
      payload,
      createdAt: new Date().toISOString()
    });
  }

  function shouldInspectResponse(url, contentType = "") {
    return (
      contentType.includes("application/json") ||
      contentType.includes("graphql") ||
      url.includes("orders") ||
      url.includes("graphql")
    );
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
      capturedAt: new Date().toISOString()
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
        const requestUrl =
          typeof args[0] === "string"
            ? args[0]
            : args[0]?.url || "";

        const clonedResponse = response.clone();
        const contentType = clonedResponse.headers.get("content-type") || "";

        if (!shouldInspectResponse(requestUrl, contentType)) {
          return response;
        }

        clonedResponse
          .json()
          .then(json => inspectJsonResponse(json, requestUrl, "fetch"))
          .catch(() => {});
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