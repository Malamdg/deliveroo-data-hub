export function convertOrdersToCsv(orders) {
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

    const rows = orders.map(order => [
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
  if (value === null || value === undefined || value === "") return "";

  const amount = Number.parseFloat(String(value).replace(",", "."));

  if (Number.isNaN(amount)) return "";

  return amount.toFixed(2);
}

function sanitize(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function escapeCsv(value) {
  const str = String(value ?? "");

  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function downloadCsv(csvContent) {
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "deliveroo-orders.csv";
    link.click();

    URL.revokeObjectURL(url);
}