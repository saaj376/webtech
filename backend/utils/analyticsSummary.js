const DAY = 86400000;
const OFFSET = 330 * 60000;
function dateKey(date) { return new Date(new Date(date).getTime() + OFFSET).toISOString().slice(0, 10); }
function reportingWindow(days, now = new Date()) {
  const today = new Date(dateKey(now) + 'T00:00:00+05:30');
  return { start: new Date(today.getTime() - (days - 1) * DAY), end: new Date(now) };
}
function buildSummary({ orders, events, newCustomers, days, start }) {
  const daily = Array.from({ length: days }, (_, i) => ({ date: dateKey(new Date(start.getTime() + i * DAY)), value: 0 }));
  const status = { placed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const buyers = new Map();
  let value = 0, count = 0;
  for (const order of orders) {
    status[order.status]++;
    if (order.status === 'cancelled') continue;
    value += order.totalAmount;
    count++;
    buyers.set(order.emailId, (buyers.get(order.emailId) || 0) + 1);
    const day = daily.find(d => d.date === dateKey(order.createdAt));
    if (day) day.value += order.totalAmount;
  }
  const viewers = new Set(), adders = new Set();
  for (const event of events) {
    const email = event.userId?.emailId;
    if (email) (event.type === 'view' ? viewers : adders).add(email);
  }
  const cartUsers = [...viewers].filter(email => adders.has(email));
  return {
    sales: { value, orders: count, average: count ? value / count : 0 }, daily,
    statuses: Object.entries(status).map(([name, count]) => ({ name, count })),
    customers: { newCustomers, buyers: buyers.size, repeatBuyers: [...buyers.values()].filter(n => n >= 2).length },
    funnel: [{ name: 'Viewed', count: viewers.size }, { name: 'Added to cart', count: cartUsers.length }, { name: 'Ordered', count: cartUsers.filter(email => buyers.has(email)).length }],
  };
}
module.exports = { buildSummary, reportingWindow };
