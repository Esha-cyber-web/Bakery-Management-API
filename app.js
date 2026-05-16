const express = require('express');
const {
  calculateTotalOrderBill,
  verifyInventoryStatus,
  validateCouponCode,
  formatOrderReceipt,
  applyLoyaltyPoints,
} = require('./bakeryController');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Bakery Management API is running.',
    availableEndpoints: [
      '/order-summary',
      '/inventory-status',
      '/validate-coupon',
      '/receipt',
      '/loyalty-points',
    ],
  });
});

app.post('/order-summary', (req, res) => {
  const { items, discountCode } = req.body;
  const summary = calculateTotalOrderBill(items, discountCode);
  res.json(summary);
});

app.post('/inventory-status', (req, res) => {
  const { itemId, quantityRequested } = req.body;
  const status = verifyInventoryStatus(itemId, quantityRequested);
  res.json(status);
});

app.get('/validate-coupon', (req, res) => {
  const { code } = req.query;
  const rate = validateCouponCode(code);
  res.json({ code, discountRate: rate });
});

app.post('/receipt', (req, res) => {
  const { orderId, items, finalBill } = req.body;
  const receipt = formatOrderReceipt(orderId, items, finalBill);
  res.type('text/plain').send(receipt);
});

app.post('/loyalty-points', (req, res) => {
  const { customerType, totalBill } = req.body;
  const points = applyLoyaltyPoints(customerType, totalBill);
  res.json({ customerType, totalBill, points });
});

module.exports = app;
