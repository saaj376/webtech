import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
export default function Brand() {
  return (
    <Link
      to="/products"
      className="brand"
      aria-label="FORME — discover the collection"
    >
      <span className="brand-mark" aria-hidden="true">
        <ShoppingBag size={23} strokeWidth={1.8} />
      </span>
      FORME<span className="brand-period">.</span>
    </Link>
  );
}
