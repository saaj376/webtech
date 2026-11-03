import { useState } from "react";
import { LogOut, Menu, Search, UserRound, X, ArrowUpRight } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import Brand from "./Brand";
export default function Navbar({ searchQuery = "", onSearchChange }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const searchField = (
    <label className="nav-search">
      <Search size={17} strokeWidth={1.5} aria-hidden="true" />
      <span className="sr-only">Search products by name</span>
      <input
        type="search"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(event) => onSearchChange?.(event.target.value)}
      />
    </label>
  );
  return (
    <>
      <div className="announcement">
        A little something for your everyday.
        <Link to="/">
          Explore with us <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="site-header">
        <div className="nav-inner">
          <Brand />
          <nav className="desktop-links" aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
          </nav>
          <div className="nav-tools">
            {onSearchChange && searchField}
            <Link
              to="/profile"
              className="icon-button profile-link"
              aria-label="Your account"
            >
              <UserRound size={20} strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              className="logout-link"
              onClick={() => logout(navigate)}
            >
              <LogOut size={16} strokeWidth={1.5} />
              <span>Logout</span>
            </button>
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {onSearchChange && (
          <div className="mobile-product-search">{searchField}</div>
        )}
        {open && (
          <nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label="Mobile navigation"
          >
            <Link to="/" onClick={close}>
              Home
            </Link>
            <Link to="/products" onClick={close}>
              Products
            </Link>
            <Link to="/profile" onClick={close}>
              Your profile
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
