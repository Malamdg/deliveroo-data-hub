function extractOrders() {
    const orderCards = document.querySelectorAll(
        '[data-testid="order-card"], [class*="order"]'
    );

    const orders = [];
    for (const card of orderCards) {
        const order = extractOrderFromCard(card);
        if (order) orders.push(order);
    }

    return orders;
}

function extractOrderFromCard(card) {
    try {
        const id = extractOrderId(card);
        const submittedAt = extractDate(card);
        const restaurant = extractRestaurant(card);
        const total = extractTotal(card);

        if (!id || !submittedAt) return null;

        return {
            id,
            submitted_at: submittedAt,
            restaurant,
            total
        };
    } catch (e) {
        return null;
    }
}

function extractOrderId(card) {
    const attrId =
        card.getAttribute("data-order-id") ||
        card.getAttribute("data-testid");

    if (attrId) return attrId;

    const text = card.textContent || "";
    const match = text.match(/#\d{4,}/);

    return match ? match[0] : `dom-${Math.random().toString(36).slice(2)}`;
}

function extractDate(card) {
    const timeEl = card.querySelector("time");
    if (timeEl?.dateTime) {
        return new Date(timeEl.dateTime).toISOString();
    }
    const text = card.textContent || "";
    const dateMatch = text.match(
        /\b\d{1,2}\s+\w+\s+\d{4}\b/
    );
    if (!dateMatch) return null;

    const parsed = new Date(dateMatch[0]);
    return Number.isNaN(parsed.getTime())
        ? null
        : parsed.toISOString();
}

function extractRestaurant(card) {
    const el =
        card.querySelector('[data-testid="restaurant-name"]') ||
        card.querySelector("h3") ||
        card.querySelector("h2");
    if (!el) return null;

    return {
        name: el.textContent.trim()
    };
}

function extractTotal(card) {
    const text = card.textContent || "";
    const match = text.match(/(\d+[.,]\d{2})\s?€/);

    if (!match) return 0;
    return parseFloat(match[1].replace(",", "."));
}


export function createDomInitialExtractor() {
    return {
        extractOrders
    };
}