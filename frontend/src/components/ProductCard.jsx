import { ArrowUpRight, PackageCheck, ShoppingBag } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { productImage } from "../utils/productImagery";
const priceFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
export default function ProductCard({
  product,
  onAdd,
  onTrackClick,
  adding = false,
}) {
  const {
    productId,
    productName,
    productPrice,
    category,
    quantity,
    description,
    imageUrl,
    size = [],
    color,
    brand,
    gender,
  } = product;
  return (
    <article className="product-card" aria-labelledby={`product-${productId}`}>
      <div className="product-image">
        <button
          type="button"
          className="product-image-button"
          aria-label={`View ${productName}`}
          onClick={() => onTrackClick?.(productId)}
        >
          <ImageWithFallback
            key={productName}
            src={imageUrl || productImage(productName, category)}
            alt={productName}
            loading="lazy"
            width="700"
            height="600"
          />
        </button>
        <span className="category-badge">{category}</span>
        <span className="product-corner" aria-hidden="true">
          <ArrowUpRight size={19} strokeWidth={1.3} />
        </span>
      </div>
      <div className="product-info">
        <div className="product-title-row">
          <h3 id={`product-${productId}`}>{productName}</h3>
          <span className="product-price">
            {priceFormat.format(productPrice)}
          </span>
        </div>
        <p className="product-description">{description}</p>
        <p className="product-details">
          {[brand, color, gender].filter(Boolean).join(" · ")}
        </p>
        <div className="product-meta">
          <span className={quantity > 0 ? "in-stock" : "out-of-stock"}>
            <PackageCheck size={13} />
            {quantity > 0
              ? `${quantity} available`
              : "0 available · Out of stock"}
          </span>
          <span>
            {size.length ? `Sizes: ${size.join(", ")}` : `NO. ${productId}`}
          </span>
        </div>
        <button
          type="button"
          className="button add-cart-button"
          onClick={() => onAdd?.(productId)}
          disabled={!onAdd || quantity === 0 || adding}
        >
          <ShoppingBag size={15} />
          {quantity === 0 ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
