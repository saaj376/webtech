import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageWithFallback from "../components/ImageWithFallback";
import { productImage } from "../utils/productImagery";
import api from "../services/api";
import "../styles/account.css";

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [notice, setNotice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [reviewVersion, setReviewVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setProduct(null); setError(""); setNotice(""); setQuantity(1);
    api.get(`/api/products/${productId}`, { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      setProduct(data);
      api.post("/api/analytics", { productId: data.productId, type: "click" }).catch(() => {});
    }).catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.message || "Couldn’t load product."); });
    return () => controller.abort();
  }, [productId, version]);
  useEffect(() => {
    const controller = new AbortController();
    setReviews(null); setReviewError(""); setRating(5); setComment("");
    api.get(`/api/products/${productId}/reviews`, { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      setReviews(data);
      setRating(data.ownReview?.rating || 5); setComment(data.ownReview?.comment || "");
    }).catch(e => { if (!controller.signal.aborted) setReviewError(e.response?.data?.message || "Couldn’t load reviews."); });
    return () => controller.abort();
  }, [productId, version, reviewVersion]);
  async function addToCart() {
    setBusy(true); setNotice("");
    try { await api.post("/api/cart", { productId: product.productId, quantity }); setNotice("Added to your cart."); }
    catch (e) { setNotice(e.response?.data?.message || "Couldn’t add to cart."); }
    finally { setBusy(false); }
  }
  async function saveReview(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    try { await api.put(`/api/products/${productId}/reviews/me`, { rating, comment }); setReviewVersion(v => v + 1); setNotice("Review saved."); }
    catch (e) { setNotice(e.response?.data?.message || "Couldn’t save review."); }
    finally { setBusy(false); }
  }
  return <><Navbar /><main className="account-page"><Link to="/products">← All products</Link>
    {error ? <p role="alert">{error} <button onClick={() => setVersion(v => v + 1)}>Retry</button></p> : !product ? <p role="status">Loading product…</p> : <>
      <section className="account-panel product-detail">
        <ImageWithFallback src={product.imageUrl || productImage(product.productName, product.category)} alt={product.productName} width="600" height="600" />
        <div><p>{product.category}</p><h1>{product.productName}</h1><h2>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.productPrice)}</h2><p>{product.description}</p><p>{[product.brand, product.color, product.gender].filter(Boolean).join(" · ")}</p>
          {product.size?.length > 0 && <p>Available sizes: {product.size.join(", ")}</p>}
          <p>{product.quantity ? `${product.quantity} in stock` : "Out of stock"}</p>
          <label htmlFor="quantity">Quantity </label><input id="quantity" type="number" min="1" max={Math.max(1, product.quantity)} value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          <button className="button" disabled={busy || !Number.isInteger(quantity) || quantity < 1 || quantity > product.quantity} onClick={addToCart}>{busy ? "Please wait…" : "Add to cart"}</button>
        </div>
      </section>
      <section className="account-panel"><h2>Customer reviews</h2>
        {reviewError ? <p role="alert">{reviewError} <button onClick={() => setVersion(v => v + 1)}>Retry</button></p> : !reviews ? <p>Loading reviews…</p> : <>
          <p>{reviews.count ? `${reviews.average.toFixed(1)} / 5 · ${reviews.count} reviews` : "No reviews yet."}</p>
          {reviews.canReview ? <form className="review-form" onSubmit={saveReview}><h3>{reviews.ownReview ? "Edit your review" : "Write a review"}</h3><label htmlFor="rating">Rating</label><select id="rating" value={rating} onChange={e => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}</select><label htmlFor="comment">Your review (optional)</label><textarea id="comment" maxLength={1000} rows={4} value={comment} onChange={e => setComment(e.target.value)} /><button className="button" disabled={busy}>Save review</button></form> : <p className="panel-help">You can review this product after your order is delivered.</p>}
          {reviews.reviews.map(r => <article className="review-item" key={r._id}><strong>{r.username} · {r.rating} / 5</strong><p>{r.comment}</p><small>{new Date(r.createdAt).toLocaleDateString("en-IN")}</small></article>)}
          {reviews.count > 50 && <p>Showing the latest 50 reviews.</p>}
        </>}
      </section>
    </>}
    {notice && <p role="status">{notice}</p>}
  </main><Footer /></>;
}
