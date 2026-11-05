import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import api from "../services/api";

const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
function Stats({ items }) {
  return <div className="stat-grid">{items.map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}
export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    api.get("/api/analytics/summary", { params: { days }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setData(data); })
      .catch(error => { if (!controller.signal.aborted) setError(error.response?.data?.message || "Couldn’t load analytics."); });
    return () => controller.abort();
  }, [days, version]);
  return <section aria-label="Analytics">
    <div className="analytics-heading"><h2>Analytics</h2><label>Period <select value={days} onChange={e => setDays(Number(e.target.value))}>{[7, 30, 90].map(n => <option key={n} value={n}>Last {n} days</option>)}</select></label></div>
    <p className="panel-help">Includes today · Asia/Kolkata. Sales show order value, not collected payments. Cancelled orders are excluded from sales and buyer counts.</p>
    {error ? <p role="alert">{error} <button onClick={() => setVersion(v => v + 1)}>Retry</button></p> : !data ? <p role="status">Loading analytics…</p> : <>
      <Stats items={[["Order value", money(data.sales.value)], ["Orders", data.sales.orders], ["Average order value", money(data.sales.average)]]} />
      <section className="account-panel"><h2>Sales trends</h2>
        {!data.sales.orders && <p>No sales in this period.</p>}
        <div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.daily} margin={{ top: 10, right: 15, bottom: 5, left: 5 }} accessibilityLayer><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={v => v.slice(5)} minTickGap={35} /><YAxis width={65} tickFormatter={v => `₹${v}`} /><Tooltip formatter={v => [money(v), "Order value"]} /><Line type="monotone" dataKey="value" stroke="#6266c7" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
        <details><summary>Daily sales data</summary><div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Order value</th></tr></thead><tbody>{data.daily.map(d => <tr key={d.date}><td>{d.date}</td><td>{money(d.value)}</td></tr>)}</tbody></table></div></details>
      </section>
      <section className="account-panel"><h2>Purchase funnel</h2><p className="panel-help">Unique customers in nested groups during this period. Activity is not matched by session, product, or action order.</p>
        <div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.funnel} layout="vertical" margin={{ left: 15, right: 20 }} accessibilityLayer><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={100} /><Tooltip /><Bar dataKey="count" fill="#6266c7" isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
        <p>{data.funnel.map(s => `${s.name}: ${s.count}`).join(" · ")}</p>
        <p className="panel-help">{data.trackingSince ? `Recorded activity begins ${new Date(data.trackingSince).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}. Earlier views and cart activity are unavailable.` : "No activity recorded yet. Tracking starts when products are viewed or added to cart."}</p>
      </section>
      <section className="account-panel"><h2>Order status breakdown</h2><p className="panel-help">Current status of orders created during this period.</p><Stats items={data.statuses.map(s => [s.name, s.count])} /></section>
      <section className="account-panel"><h2>Customer insights</h2><Stats items={[["New customers", data.customers.newCustomers], ["Buying customers", data.customers.buyers], ["Repeat buyers", data.customers.repeatBuyers]]} /><p className="panel-help">Repeat buyers placed at least two non-cancelled orders during this period.</p></section>
    </>}
  </section>;
}
