import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "./Brand";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Brand />
        <nav aria-label="Footer navigation">
          <Link to="/products">
            Products <ArrowUpRight size={14} />
          </Link>
          <Link to="/login">
            Sign in <ArrowUpRight size={14} />
          </Link>
          <Link to="/">
            Register <ArrowUpRight size={14} />
          </Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} WearIt! All rights reserved.</span>
      </div>
    </footer>
  );
}
