import { useEffect, useState } from "react";
import {
  ClipboardList,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { getUser } from "../utils/auth";
import "../styles/account.css";

export default function Dashboard() {
  const user = getUser();
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([api.get("/api/cart"), api.get("/api/orders")])
      .then(([cartResponse, ordersResponse]) => {
        if (!active) return;
        setCartCount(cartResponse.data?.items?.length || 0);
        setOrderCount(ordersResponse.data?.orders?.length || 0);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="account-page" id="main-content">
        <header className="account-heading">
          <h1>Welcome, {user?.username || "there"}</h1>
        </header>

        <div className="stat-grid">
          <Link to="/cart" className="stat-card">
            <ShoppingBag size={22} strokeWidth={1.4} />
            <strong>{cartCount}</strong>
            <span>Items in cart</span>
          </Link>
          <Link to="/orders" className="stat-card">
            <ClipboardList size={22} strokeWidth={1.4} />
            <strong>{orderCount}</strong>
            <span>{user?.role === "admin" ? "Orders in store" : "Orders placed"}</span>
          </Link>
          <Link to="/profile" className="stat-card">
            <UserRound size={22} strokeWidth={1.4} />
            <strong>Profile</strong>
            <span>Manage your details</span>
          </Link>
        </div>

        {user?.role === "admin" && (
          <section className="account-panel">
            <Link to="/admin" className="button button-blue admin-link">
              <ShieldCheck size={17} />
              Open admin panel
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
