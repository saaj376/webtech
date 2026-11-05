import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import api from "../services/api";
import "../styles/account.css";

const priceFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadCart() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/cart");
      setCart({ items: data.items || [], total: data.total || 0 });
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        setError(
          requestError.response?.data?.message ||
            "We couldn’t load your cart. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function changeQuantity(item, quantity) {
    if (quantity < 1 || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.patch(`/api/cart/${item.productId}`, { quantity });
      await loadCart();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t update your cart. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(productId) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/api/cart/${productId}`);
      await loadCart();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t update your cart. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/api/orders");
      navigate("/orders", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t place your order. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="account-page" id="main-content">
        <header className="account-heading">
          <h1>Cart</h1>
        </header>

        {error && (
          <div className="form-notice notice-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="account-panel">Loading your cart…</div>
        ) : cart.items.length === 0 ? (
          <div className="account-panel empty-state">
            <ShoppingBag size={34} strokeWidth={1.2} />
            <h2>Your cart is empty</h2>
            <p>Add something you like from the collection.</p>
            <Button to="/products" variant="blue">
              Browse products
            </Button>
          </div>
        ) : (
          <>
            <section className="account-panel">
              <div className="cart-list">
                {cart.items.map((item) => (
                  <div className="cart-item" key={item.productId}>
                    <div className="cart-item-info">
                      <Link to="/products">{item.productName}</Link>
                      <span>{priceFormat.format(item.price)} each</span>
                    </div>
                    <div className="cart-controls">
                      <button
                        type="button"
                        className="qty-button"
                        aria-label={`Decrease ${item.productName} quantity`}
                        disabled={busy || item.quantity <= 1}
                        onClick={() =>
                          changeQuantity(item, item.quantity - 1)
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-button"
                        aria-label={`Increase ${item.productName} quantity`}
                        disabled={busy}
                        onClick={() =>
                          changeQuantity(item, item.quantity + 1)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <strong>
                      {priceFormat.format(item.price * item.quantity)}
                    </strong>
                    <button
                      type="button"
                      className="qty-button remove-button"
                      aria-label={`Remove ${item.productName}`}
                      disabled={busy}
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="account-panel cart-summary">
              <div>
                <span>Total</span>
                <strong>{priceFormat.format(cart.total)}</strong>
              </div>
              <Button variant="blue" disabled={busy} onClick={checkout}>
                {busy ? "Please wait…" : "Place order"}
              </Button>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
