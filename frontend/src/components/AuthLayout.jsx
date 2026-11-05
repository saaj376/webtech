import Brand from "./Brand";
import ImageWithFallback from "./ImageWithFallback";
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="auth-visual" aria-label="WearIt!">
        <div className="auth-visual-top">
          <Brand />
        </div>
        <div className="auth-photo">
          <ImageWithFallback
            src="/images/backpack.jpg"
            alt="An everyday backpack from our sample collection"
          />
        </div>
      </aside>
      <div className="auth-content">
        <header className="auth-mobile-header">
          <Brand />
        </header>
        <main id="main-content" className="auth-form-area">
          {children}
        </main>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} WearIt!</span>
        </footer>
      </div>
    </div>
  );
}
