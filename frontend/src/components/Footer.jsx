import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "./Brand";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand />
          <p>
            Your everyday shopping spot.
            <br />
            Find useful things. Discover new favorites.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/products">
            Browse products <ArrowUpRight size={14} />
          </Link>
          <Link to="/">
            Create an account <ArrowUpRight size={14} />
          </Link>
          <Link to="/login">
            Sign in <ArrowUpRight size={14} />
          </Link>
        </nav>
        <div className="footer-manifesto">
          Good finds.
          <br />
          <em>Happy days.</em>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} WearIt! All rights reserved.</span>
        <span>ELECTRONICS · FASHION · ACCESSORIES</span>
        <span>India · INR ₹</span>
      </div>
    </footer>
  );
}
