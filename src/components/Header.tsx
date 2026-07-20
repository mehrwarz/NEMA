"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Menu,
  X,
  UserCircle,
} from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className={`navbar${scrolled ? " scrolled" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar-inner">
        {/* Logo */}
        <a href="#" className="navbar-logo" aria-label="mehrabani.org home">
          <span className="navbar-logo-icon">
            <GraduationCap size={20} />
          </span>
          <span className="navbar-logo-text">
            mehrabani.org
            <small>Knowledge For All</small>
          </span>
        </a>

        {/* Desktop nav links */}
        <ul className="navbar-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Who We Serve</a></li>
          <li><a href="#">Study Tracks</a></li>
          <li><a href="#">Resources</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          <a href="#" className="btn btn-ghost">Explore Library</a>
          <a href="/auth" className="btn btn-outline-primary">
            <UserCircle size={16} />
            Learner Login
          </a>
          <a href="#" className="btn btn-danger">Support Us</a>

          {/* Mobile toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <a href="#" style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 500, fontSize: "0.95rem" }}>Home</a>
          <a href="#" style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 500, fontSize: "0.95rem" }}>Who We Serve</a>
          <a href="#" style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 500, fontSize: "0.95rem" }}>Study Tracks</a>
          <a href="#" style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 500, fontSize: "0.95rem" }}>Resources</a>
        </div>
      )}
    </nav>
  );
}
