import {
  ArrowDown,
  ArrowUpRight,
  Box,
  Check,
  CheckCircle2,
  CircleAlert,
  Leaf,
  Shapes,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import PageLoader from "../components/PageLoader";
import ImageWithFallback from "../components/ImageWithFallback";
import Button from "../components/Button";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [addingId, setAddingId] = useState(null);
  const [cartNotice, setCartNotice] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/products", {
          signal: controller.signal,
          timeout: 15000,
        });
        if (controller.signal.aborted) return;
        const result = Array.isArray(data)
          ? data
          : data?.message === "No products available"
            ? []
            : null;
        if (!result) throw new Error("Unexpected products response");
        setProducts(result);
        setSelectedCategory((current) =>
          result.some((product) => product.category === current) ? current : "",
        );
      } catch (requestError) {
        if (controller.signal.aborted) return;
        // The shared interceptor clears rejected tokens; ProtectedRoute redirects.
        if (requestError.response?.status === 401) return;
        setError(
          !requestError.response && requestError.isAxiosError
            ? "We couldn’t connect to the server. Please check your connection and try again."
            : "We couldn’t load the products right now. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    loadProducts();
    return () => controller.abort();
  }, [requestVersion]);

  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].sort();
  const query = searchQuery.trim().toLocaleLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLocaleLowerCase().includes(query) &&
      (!selectedCategory || product.category === selectedCategory),
  );
  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("");
  }
  function trackClick(productId) {
    api.post("/api/analytics", { productId, type: "click" }).catch(() => {});
  }
  async function addToCart(productId) {
    setAddingId(productId);
    setCartNotice(null);
    try {
      await api.post("/api/cart", { productId, quantity: 1 });
      api
        .post("/api/analytics", { productId, type: "add_to_cart" })
        .catch(() => {});
      setCartNotice({ type: "success", message: "Added to your cart." });
    } catch (requestError) {
      if (requestError.response?.status === 401) return;
      setCartNotice({
        type: "error",
        message:
          requestError.response?.data?.message ||
          "We couldn’t add that item right now. Please try again.",
      });
    } finally {
      setAddingId(null);
    }
  }
  return (
    <div className="store-page">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main id="main-content">
        <section className="store-hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">A LITTLE SOMETHING FOR EVERY DAY</span>
            <h1 id="hero-title">
              Everyday finds.
              <br />
              <em>Made for you.</em>
            </h1>
            <p>
              Explore everyday clothing and accessories.
              <br className="desktop-break" /> Find your next favorite, all in
              one place.
            </p>
            <a href="#collection" className="button">
              Shop Now <ArrowUpRight size={17} />
            </a>
            <div className="hero-caption">
              <span className="caption-line" /> SIMPLE FINDS. EVERYDAY
              FAVORITES.
            </div>
          </div>
          <div className="hero-image">
            <ImageWithFallback
              src="/images/headphones.jpg"
              alt="Wireless headphones on a bright desk"
              fetchPriority="high"
            />
            <span className="hero-image-tag">
              <span /> Something for everyone
            </span>
          </div>
          <a
            href="#collection"
            className="hero-scroll"
            aria-label="Scroll to the collection"
          >
            <ArrowDown size={17} />
          </a>
        </section>
        <div className="values-strip">
          <span>
            <Shapes size={19} strokeWidth={1.3} /> Clothing & more
          </span>
          <span>
            <Check size={19} strokeWidth={1.3} /> Your everyday essentials, all
            together
          </span>
          <span>
            <Leaf size={19} strokeWidth={1.3} /> Find your own style
          </span>
        </div>
        <section
          id="collection"
          className="collection-section"
          aria-labelledby="collection-title"
        >
          <div className="collection-heading">
            <div>
              <span className="eyebrow">TAKE A LOOK AROUND</span>
              <h2 id="collection-title">
                Explore Our Products<span>.</span>
              </h2>
            </div>
            <p>Good products. Simple choices.</p>
          </div>
          <div className="collection-toolbar">
            <div
              className="category-filters"
              role="group"
              aria-label="Filter products by category"
            >
              {["", ...categories].map((category) => (
                <button
                  type="button"
                  key={category}
                  className={selectedCategory === category ? "selected" : ""}
                  disabled={isLoading || Boolean(error)}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category || "All Categories"}
                </button>
              ))}
            </div>
            <span className="collection-count" role="status" aria-live="polite">
              {isLoading
                ? "Loading…"
                : error
                  ? "Products unavailable"
                  : `${filteredProducts.length} of ${products.length} products`}
              <SlidersHorizontal
                size={15}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
          </div>
          {cartNotice && (
            <div
              className={`form-notice notice-${cartNotice.type}`}
              role={cartNotice.type === "error" ? "alert" : "status"}
            >
              {cartNotice.type === "success" ? (
                <CheckCircle2 size={17} aria-hidden="true" />
              ) : (
                <CircleAlert size={17} aria-hidden="true" />
              )}
              <span>
                {cartNotice.message}
                {cartNotice.type === "success" && (
                  <>
                    {" "}
                    <Link to="/cart">View cart</Link>
                  </>
                )}
              </span>
            </div>
          )}
          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <div className="empty-products products-error" role="alert">
              <div className="empty-icon">
                <CircleAlert size={32} strokeWidth={1.2} />
              </div>
              <h3>Let’s try that again</h3>
              <p>{error}</p>
              <Button
                variant="blue"
                onClick={() => setRequestVersion((current) => current + 1)}
              >
                Retry
              </Button>
            </div>
          ) : filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onAdd={addToCart}
                  onTrackClick={trackClick}
                  adding={addingId === product.productId}
                />
              ))}
            </div>
          ) : (
            <div className="empty-products" role="status">
              <div className="empty-icon">
                <Box size={35} strokeWidth={1} />
              </div>
              <span className="eyebrow">
                {products.length ? "TRY ANOTHER SEARCH" : "CHECK BACK SOON"}
              </span>
              <h3>
                {products.length
                  ? "No matching products"
                  : "No products available"}
              </h3>
              <p>
                {products.length
                  ? "Try a different product name or choose another category."
                  : "We’re getting things ready. Check back soon for new favorites."}
              </p>
              {products.length > 0 && (
                <Button variant="blue" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </section>
        <section className="editorial-note">
          <span className="eyebrow">A STORE FOR YOUR EVERYDAY</span>
          <h2>
            Find what you need.
            <br />
            <em>Love what you find.</em>
          </h2>
          <p>
            From your desk to your next day out, there’s something for every
            part of your day.
            <br className="desktop-break" /> Browse our collection and discover
            your next favorite.
          </p>
          <span className="editorial-signature">
            A little browsing goes a long way.
          </span>
        </section>
      </main>
      <Footer />
    </div>
  );
}
