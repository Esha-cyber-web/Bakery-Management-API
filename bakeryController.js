const couponRates = {
  SAVE10: 0.1,
  BAKERY20: 0.2,
  SWEET5: 0.05,
};

const inventory = {
  bread: 50,
  croissant: 30,
  muffin: 40,
  cake: 10,
};

function validateCouponCode(code) {
  if (!code || typeof code !== 'string') {
    return 0;
  }

  const normalizedCode = code.trim().toUpperCase();
  return couponRates[normalizedCode] || 0;
}

function calculateTotalOrderBill(items, discountCode) {
  if (!Array.isArray(items)) {
    throw new TypeError('Order items must be provided as an array.');
  }

  if (items.length === 0) {
    throw new Error('Order items array cannot be empty.');
  }

  const subtotal = items.reduce((sum, item, index) => {
    if (!item || typeof item !== 'object') {
      throw new TypeError(`Item at index ${index} must be an object.`);
    }

    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (!Number.isFinite(price)) {
      throw new TypeError(`Price for item at index ${index} must be a valid number.`);
    }
    if (!Number.isFinite(quantity)) {
      throw new TypeError(`Quantity for item at index ${index} must be a valid number.`);
    }
    if (price < 0) {
      throw new RangeError(`Price for item at index ${index} cannot be negative.`);
    }
    if (quantity < 0) {
      throw new RangeError(`Quantity for item at index ${index} cannot be negative.`);
    }

    return sum + price * quantity;
  }, 0);

  const discountRate = validateCouponCode(discountCode);
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const finalBill = Math.max(Math.round((subtotal - discount) * 100) / 100, 0);

  return {
    total: subtotal,
    discount,
    finalBill,
    discountRate,
  };
}

function verifyInventoryStatus(itemId, quantityRequested) {
  if (!itemId || typeof itemId !== 'string' || quantityRequested <= 0) {
    return {
      itemId,
      available: false,
      requested: quantityRequested,
      inStock: 0,
      message: 'Invalid item identifier or quantity requested.',
    };
  }

  const stock = inventory[itemId.toLowerCase()] || 0;
  return {
    itemId,
    requested: quantityRequested,
    inStock: stock,
    available: quantityRequested <= stock,
  };
}

function formatOrderReceipt(orderId, items, finalBill) {
  const header = `Order Receipt - #${orderId}`;
  const lines = [header, '----------------------------'];

  if (!Array.isArray(items) || items.length === 0) {
    lines.push('No items were ordered.');
  } else {
    items.forEach((item) => {
      const name = item.name || 'Unknown item';
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const lineTotal = price * quantity;
      lines.push(`${name} x ${quantity} @ $${price.toFixed(2)} = $${lineTotal.toFixed(2)}`);
    });
  }

  lines.push('----------------------------');
  lines.push(`Total Due: $${Number(finalBill).toFixed(2)}`);
  lines.push('Thank you for ordering from our bakery!');

  return lines.join('\n');
}

function applyLoyaltyPoints(customerType, totalBill) {
  const normalizedType = (customerType || '').toString().trim().toLowerCase();
  const billAmount = Number(totalBill) || 0;

  let multiplier = 1;
  if (normalizedType === 'vip') {
    multiplier = 2;
  }

  return Math.floor(billAmount * multiplier * 0.05);
}

module.exports = {
  calculateTotalOrderBill,
  verifyInventoryStatus,
  validateCouponCode,
  formatOrderReceipt,
  applyLoyaltyPoints,
};
