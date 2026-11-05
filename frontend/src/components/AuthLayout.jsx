import { ArrowDownRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "./Brand";
import ImageWithFallback from "./ImageWithFallback";
export default function AuthLayout({ children, login = false }) {
  return (
    <div className="auth-page">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="auth-visual" aria-label="Discover WearIt!">
        <div className="auth-visual-top">
          <Brand />
          <span className="edition">Your everyday shopping spot</span>
        </div>
        <div className="auth-editorial">
          <span className="eyebrow">A little shopping. A lot to love.</span>
          <h2>
            {login ? (
              <>
                Your favorites,
                <br />
                <em>all in one place.</em>
              </>
            ) : (
              <>
                Great finds.
                <br />
                <em>Happy everyday.</em>
              </>
            )}
          </h2>
          <p>
            From everyday clothing to simple accessories,
            <br />
            find a little something that feels like you.
          </p>
          <Link to="/products" className="auth-discover">
            Take a look around <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="auth-photo">
          <ImageWithFallback
            src="/images/backpack.jpg"
            alt="An everyday backpack from our sample collection"
          />
          <div className="auth-photo-label">
            <span>
              <Sparkles size={14} /> Your next favorite is waiting.
            </span>
            <ArrowDownRight size={20} />
          </div>
        </div>
        <div className="auth-visual-bottom">
          <span>Tops</span>
          <span>Bottoms</span>
          <span>Accessories</span>
        </div>
      </aside>
      <div className="auth-content">
        <header className="auth-mobile-header">
          <Brand />
          <Link to="/products">
            Explore <ArrowUpRight size={15} />
          </Link>
        </header>
        <main id="main-content" className="auth-form-area">
          {children}
        </main>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} WearIt!</span>
          <span>
            <Check size={13} /> Simple shopping. Good finds.
          </span>
        </footer>
      </div>
    </div>
  );
}
