import { isOrderInsideDateRange } from "./dateRange.js";

export function createExportPayload({ orders, dateRange, runtime }) {
  const retainedOrders = orders.filter(order =>
    isOrderInsideDateRange(order, dateRange)
  );

  const totalSpent = retainedOrders.reduce((sum, order) => {
    return sum + Number.parseFloat(order.total || 0);
  }, 0);

  const restaurants = new Set(
    retainedOrders
      .map(order => order.restaurant?.id || order.restaurant?.name)
      .filter(Boolean)
  );

  return {
    exported_at: new Date().toISOString(),
    filters: {
      start_date: dateRange.start.toISOString(),
      end_date: dateRange.end.toISOString()
    },
    collection: {
      started_at: runtime.startedAt,
      finished_at: new Date().toISOString(),
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

export function downloadJson(payload, filename = "deliveroo-orders.json") {
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