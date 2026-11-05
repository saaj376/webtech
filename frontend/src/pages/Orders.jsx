import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import api from "../services/api";
import { getRole } from "../utils/auth";
import "../styles/account.css";

const priceFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const isAdmin = getRole() === "admin";

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/orders");
      setOrders(data.orders || []);
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.message ||
            "We couldn’t load your orders. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function cancelOrder(orderId) {
    if (busyId) return;
    setBusyId(orderId);
    setError("");
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      await loadOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t cancel that order. Please try again.",
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <>
      <Navbar />
      <main className="account-page" id="main-content">
        <header className="account-heading">
          <h1>Orders</h1>
        </header>

        {error && (
          <div className="form-notice notice-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="account-panel">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="account-panel empty-state">
            <ClipboardList size={34} strokeWidth={1.2} />
            <h2>No orders yet</h2>
            <p>Your placed orders will appear here.</p>
            <Button to="/products" variant="blue">
              Browse products
            </Button>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <section className="account-panel order-card" key={order._id}>
                <div className="order-heading">
                  <div>
                    <strong>Order #{order._id.slice(-6)}</strong>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {isAdmin && <span>{order.emailId}</span>}
                  </div>
                  <span className={`status-pill status-${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div className="order-item" key={item.productId}>
                      <span>
                        {item.productName}
                        {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                      </span>
                      <span>{priceFormat.format(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <strong>Total: {priceFormat.format(order.totalAmount)}</strong>
                  {order.status === "placed" && (
                    <Button
                      className="danger-button"
                      disabled={busyId === order._id}
                      onClick={() => cancelOrder(order._id)}
                    >
                      {busyId === order._id ? "Cancelling…" : "Cancel order"}
                    </Button>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
