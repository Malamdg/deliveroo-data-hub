export function createOrderStore() {
  const ordersByKey = new Map();

  function getOrderKey(order) {
    return order?.id || order?.drn_id || order?.drn || null;
  }

  function addOrders(orders) {
    let addedCount = 0;

    for (const order of orders) {
      const key = getOrderKey(order);

      if (!key) {
        continue;
      }

      if (!ordersByKey.has(key)) {
        addedCount += 1;
      }

      ordersByKey.set(key, order);
    }

    return {
      addedCount,
      totalCount: ordersByKey.size
    };
  }

  function getOrders() {
    return [...ordersByKey.values()].sort((a, b) => {
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });
  }

  function clear() {
    ordersByKey.clear();
  }

  return {
    addOrders,
    getOrders,
    clear,
    get totalCount() {
      return ordersByKey.size;
    }
  };
}