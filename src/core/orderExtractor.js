export function extractOrdersPayload(json, sourceUrl = "") {
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

    if (
      Array.isArray(current.orders) &&
      current.orders.every(order => order && typeof order === "object")
    ) {
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