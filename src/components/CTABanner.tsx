import { FolderOpen, PlayCircle } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="section" id="cta-section">
      <div className="section-inner">
        <div className="cta-banner">
          <h2>Ready to download learning resources?</h2>
          <p>
            Get instant access to thousands of open textbooks, interactive
            video crash-courses, practice tests, and homework modules without
            creating an account.
          </p>
          <div className="cta-actions">
            <a href="#" className="btn btn-white btn-lg">
              <FolderOpen size={18} />
              Go to Open Library
            </a>
            <a href="#" className="btn btn-outline-white btn-lg">
              <PlayCircle size={18} />
              Watch Video Guides
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
