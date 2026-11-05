import { Box, CheckCircle2, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import PageLoader from "../components/PageLoader";
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
        <section
          id="collection"
          className="collection-section"
          aria-labelledby="collection-title"
        >
          <div className="collection-heading">
            <h2 id="collection-title">Products</h2>
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
                  {category || "All"}
                </button>
              ))}
            </div>
            <span className="collection-count" role="status" aria-live="polite">
              {isLoading
                ? "Loading…"
                : error
                  ? "Unavailable"
                  : `${filteredProducts.length} of ${products.length}`}
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
              <h3>Products unavailable</h3>
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
              <h3>
                {products.length
                  ? "No matching products"
                  : "No products available"}
              </h3>
              {products.length > 0 && (
                <Button variant="blue" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
