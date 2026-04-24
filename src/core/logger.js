export function createLogger({ onLog } = {}) {
  const entries = [];

  function push(level, message, payload = null) {
    const entry = {
      level,
      message,
      payload,
      createdAt: new Date().toISOString()
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