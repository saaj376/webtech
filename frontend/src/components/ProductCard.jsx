import { ArrowUpRight, PackageCheck } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { productImage } from "../utils/productImagery";
const priceFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
export default function ProductCard({ product }) {
  const {
    productId,
    productName,
    productPrice,
    category,
    quantity,
    description,
  } = product;
  return (
    <article className="product-card" aria-labelledby={`product-${productId}`}>
      <div className="product-image">
        <ImageWithFallback
          key={productName}
          src={productImage(productName, category)}
          alt={productName}
          loading="lazy"
          width="700"
          height="600"
        />
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
        <div className="product-meta">
          <span className={quantity > 0 ? "in-stock" : "out-of-stock"}>
            <PackageCheck size={13} />
            {quantity > 0
              ? `${quantity} available`
              : "0 available · Out of stock"}
          </span>
          <span>NO. {productId}</span>
        </div>
      </div>
    </article>
  );
}
