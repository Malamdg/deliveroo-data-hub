export function convertOrdersToCSV(orders) {
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

    const rows = orders.map((order) => {
        return [
            order.id,
            formatDate(order.submitted_at),
            sanitize(order.restaurant?.name),
            order.total?.amount,
            order.total?.currency_code,
            order.status,
            order.items?.length || 0
        ];
    });

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    return csvContent;
}

function formatDate(date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString();
}

function sanitize(value) {
    if (!value) return "";
    return String(value).trim();
}

function escapeCSV(value) {
    const str = String(value ?? "");

    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
}

export function downloadCSV(csvContent) {
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