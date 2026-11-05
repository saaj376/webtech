import { Link } from "react-router-dom";
export default function Brand() {
  return (
    <Link
      to="/products"
      className="brand"
      aria-label="WearIt! — discover the collection"
    >
      WearIt<span className="brand-period">!</span>
    </Link>
  );
}
