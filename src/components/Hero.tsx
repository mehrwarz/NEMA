import {
  FlaskConical,
  Code,
  BookOpen,
  ArrowRight,
  Heart,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-inner">
        {/* Left content */}
        <div className="animate-in">
          <div className="hero-badge">
            <Heart size={14} color="#dc2626" fill="#dc2626" />
            100% Free Non-Profit Education
          </div>

          <h1 className="hero-title">
            Free education
            <br />
            materials for{" "}
            <span className="highlight">every</span>
            <br />
            <span className="highlight">dreamer</span>.
          </h1>

          <p className="hero-subtitle">
            Whether you are starting primary school, preparing for college, or
            mastering a new skill on your own, Mehrabani provides high-quality,
            open-source knowledge absolutely free.
          </p>

          <div className="hero-actions">
            <a href="/auth" className="btn btn-primary btn-lg">
              Start Learning
            </a>
            <a href="#" className="btn btn-outline-dark btn-lg">
              Find Your Level <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Right cards grid */}
        <div className="hero-cards animate-in-right delay-200">
          <div className="hero-card green">
            <div className="hero-card-icon">
              <FlaskConical size={22} color="#059669" />
            </div>
            <h3>Science Studies</h3>
            <p>Physics, Chemistry, Biology &amp; Earth sciences.</p>
          </div>

          <div className="hero-card green">
            <div className="hero-card-icon">
              <Code size={22} color="#059669" />
            </div>
            <h3>Technical Tracks</h3>
            <p>Coding, Engineering &amp; Data Science.</p>
          </div>

          <div className="hero-card yellow">
            <div className="hero-card-icon">
              <BookOpen size={22} color="#d97706" />
            </div>
            <h3>Informational</h3>
            <p>History, Literature &amp; General Knowledge.</p>
          </div>

          <div className="hero-card pink">
            <div className="hero-card-icon">
              <span className="stat-number">10k+</span>
            </div>
            <h3>Free Resources</h3>
            <p>Guides, video lessons, and test preps.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
