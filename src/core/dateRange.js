export function createInclusiveDateRange(startDateValue, endDateValue) {
  if (!startDateValue) throw new Error("Start date is required.");
  if (!endDateValue) throw new Error("End date is required.");

  const start = new Date(`${startDateValue}T00:00:00.000`);
  const end = new Date(`${endDateValue}T23:59:59.999`);

  if (Number.isNaN(start.getTime())) throw new Error("Invalid start date.");
  if (Number.isNaN(end.getTime())) throw new Error("Invalid end date.");
  if (start > end) throw new Error("Start date must be before end date.");

  return { start, end };
}

export function isOrderInsideDateRange(order, dateRange) {
  const submittedAt = new Date(order?.submitted_at);

  if (Number.isNaN(submittedAt.getTime())) {
    return false;
  }

  return submittedAt >= dateRange.start && submittedAt <= dateRange.end;
}

export function isLowerBoundReached(orders, dateRange) {
  if (!orders.length) return false;

  const oldestOrder = orders[orders.length - 1];
  const oldestDate = new Date(oldestOrder?.submitted_at);

  if (Number.isNaN(oldestDate.getTime())) {
    return false;
  }

  return oldestDate <= dateRange.start;
}