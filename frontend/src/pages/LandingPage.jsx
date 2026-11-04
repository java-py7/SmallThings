import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "../context/useTheme";

import logoBlack from "../assets/smallthingsICON-green-black0.png";
import logoWhite from "../assets/smallthingsICON-green-white.png";
import elecImg from "../assets/electronics.png";
import fashionImg from "../assets/fashion.png";
import homeImg from "../assets/home&living.png";
import booksImg from "../assets/books&mediaa.png";
import sportsImg from "../assets/sports&outdoor.png";
import toysImg from "../assets/toys&games.jpg";
import sony from "../assets/sony.jpeg"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faShieldAlt,
  faComments,
  faSearch,
  faStore,
  faLeaf,
  faWallet,
  faUsers,
  faBars,
  faXmark,
  faSun,
  faMoon,
  faTag,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";

import {
  faInstagram,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

import "../styles/LandingPage.css";

// Register ScrollTrigger once
gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const token = localStorage.getItem("token");
  const landingRef = useRef(null);

  // Liquid ripple hover effect tracker
  const handleLiquidMove = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty("--ripple-x", `${x}px`);
    btn.style.setProperty("--ripple-y", `${y}px`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP Animation System (Hero Timeline + ScrollTriggers)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Entrance Timeline
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .fromTo(
          ".hero-badge",
          { y: -24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, clearProps: "all" }
        )
        .fromTo(
          ".hero-title .title-line",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.85, clearProps: "all" },
          "-=0.35"
        )
        .fromTo(
          ".hero-description",
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, clearProps: "all" },
          "-=0.45"
        )
        .fromTo(
          ".hero-actions .landing-btn",
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            stagger: 0.1,
            duration: 0.55,
            clearProps: "all",
          },
          "-=0.35"
        )
        .fromTo(
          ".hero-metrics .metric-pill",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, clearProps: "all" },
          "-=0.25"
        )
        .fromTo(
          ".hero-preview-showcase",
          { scale: 0.92, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: "back.out(1.4)",
            clearProps: "all",
          },
          "-=0.6"
        );

      // 2. Categories ScrollTrigger
      gsap.from(".category-card", {
        scrollTrigger: {
          trigger: "#categories .categories-grid",
          start: "top 82%",
        },
        y: 45,
        opacity: 0,
        stagger: 0.09,
        duration: 0.65,
        ease: "power2.out",
      });

      // 3. Features ScrollTrigger
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: "#features .features-grid",
          start: "top 82%",
        },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });

      // 4. How It Works Steps ScrollTrigger
      gsap.from(".step-card", {
        scrollTrigger: {
          trigger: "#how-it-works .steps-container",
          start: "top 82%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.75,
        ease: "power3.out",
      });

      // 5. Business Section ScrollTrigger
      gsap.from(".business-box", {
        scrollTrigger: {
          trigger: "#business",
          start: "top 80%",
        },
        scale: 0.96,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      // 6. Final CTA Section ScrollTrigger
      gsap.from(".landing-cta-section", {
        scrollTrigger: {
          trigger: ".landing-cta-section",
          start: "top 85%",
        },
        y: 35,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
      });
    }, landingRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const categories = [
    { name: "Electronics", subtitle: "Phones, Audio & Gear", img: elecImg, tag: "Tech" },
    { name: "Fashion", subtitle: "Apparel, Bags & Footwear", img: fashionImg, tag: "Style" },
    { name: "Home & Living", subtitle: "Furniture & Decor", img: homeImg, tag: "Home" },
    { name: "Books & Media", subtitle: "Books, Vinyl & Art", img: booksImg, tag: "Media" },
    { name: "Sports & Outdoors", subtitle: "Bikes & Fitness Equipment", img: sportsImg, tag: "Active" },
    { name: "Toys & Games", subtitle: "Collectibles & Board Games", img: toysImg, tag: "Fun" },
  ];

  const features = [
    {
      icon: faShieldAlt,
      title: "Direct Peer-to-Peer & B2C",
      desc: "Buy from neighbors or discover verified small business inventory without algorithmic middlemen.",
    },
    {
      icon: faComments,
      title: "Integrated Live Chat",
      desc: "Connect directly with sellers in real time to ask item questions, negotiate counters, and coordinate pick-up.",
    },
    {
      icon: faTag,
      title: "Zero Hidden Listing Fees",
      desc: "Post unlimited items in minutes without high commission fees eating into your margins.",
    },
    {
      icon: faSearch,
      title: "Curated Category Discovery",
      desc: "Explore items organized by specific categories, price filters, and local availability.",
    },
    {
      icon: faStore,
      title: "Empowering Local Businesses",
      desc: "Independent artisans and neighborhood boutiques can showcase stock directly to local shoppers.",
    },
    {
      icon: faHandshake,
      title: "Clear Reservation System",
      desc: "Send purchase requests with custom notes and lock in items while coordinating payment.",
    },
  ];

  return (
    <div className="landing-root" ref={landingRef}>
      {/* FLOATING GLASSMORPHIC NAVBAR */}
      <header className={`landing-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo" onClick={() => navigate("/")}>
            <img
              src={darkMode ? logoWhite : logoBlack}
              alt="SmallThings Logo"
              className="logo-img"
            />
            <h2>
              Small<span>Things</span>
            </h2>
          </div>

          <nav className={`landing-nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#categories" onClick={() => setMenuOpen(false)}>
              Categories
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#business" onClick={() => setMenuOpen(false)}>
              For Businesses
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>

            <div className="mobile-nav-actions">
              {token ? (
                <button
                  className="landing-btn landing-btn-primary"
                  onClick={() => navigate("/marketplace")}
                >
                  Go to Marketplace
                </button>
              ) : (
                <>
                  <button
                    className="landing-btn landing-btn-outline"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
                  <button
                    className="landing-btn landing-btn-primary"
                    onClick={() => navigate("/register")}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </nav>

          <div className="landing-nav-right">
            <button
              className="landing-theme-toggle"
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            </button>

            {token ? (
              <button
                className="landing-btn landing-btn-primary desktop-only"
                onClick={() => navigate("/marketplace")}
              >
                Dashboard
                <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
              </button>
            ) : (
              <>
                <button
                  className="landing-btn landing-btn-ghost desktop-only"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
                <button
                  className="landing-btn landing-btn-primary desktop-only liquid-btn"
                  onClick={() => navigate("/register")}
                  onMouseMove={handleLiquidMove}
                >
                  <span className="liquid-ripple" />
                  <span>Get Started</span>
                </button>
              </>
            )}

            <button
              className="landing-mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-container">
          <div className="hero-content-col">
            <div className="hero-badge">
              <span className="badge-pulse" />
              <span>Next-Gen Marketplace for C2C & Small Businesses</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line">Where Everyday Goods</span>
              <span className="title-line">
                Find <span className="hero-gradient-text">Real Value</span>
              </span>
            </h1>

            <p className="hero-description">
              SmallThings brings peer-to-peer buying and selling together with independent small business discovery. Chat directly, negotiate transparently, and trade locally with zero listing commissions.
            </p>

            <div className="hero-actions">
              <button
                className="landing-btn landing-btn-primary landing-btn-lg liquid-btn"
                onClick={() => navigate(token ? "/marketplace" : "/register")}
                onMouseMove={handleLiquidMove}
              >
                <span className="liquid-ripple" />
                <span>Start Selling Now</span>
                <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
              </button>

              <button
                className="landing-btn landing-btn-outline landing-btn-lg"
                onClick={() => navigate("/marketplace")}
              >
                <span>Explore Marketplace</span>
              </button>
            </div>

            {/* METRIC PILLS */}
            <div className="hero-metrics">
              <div className="metric-pill">
                <span className="metric-tag">C2C</span>
                <span className="metric-label">Direct Peer-to-Peer</span>
              </div>
              <div className="metric-pill">
                <span className="metric-tag">B2C</span>
                <span className="metric-label">Small Business Makers</span>
              </div>
              <div className="metric-pill">
                <span className="metric-tag">Live</span>
                <span className="metric-label">Buyer-Seller Chat</span>
              </div>
              <div className="metric-pill">
                <span className="metric-tag">0%</span>
                <span className="metric-label">Listing Commission</span>
              </div>
            </div>
          </div>

          {/* HERO INTERACTIVE SHOWCASE CARD */}
          <div className="hero-preview-showcase">
            <div className="preview-card-floating main-float">
              <div className="preview-card-badge">
                <FontAwesomeIcon icon={faShieldAlt} /> Verified Community Listing
              </div>
              <div
                className="preview-card-thumb"
                style={{ backgroundImage: `url(${sony})` }}
              >
                <span className="preview-price-tag">₹8,499</span>
              </div>
              <div className="preview-card-body">
                <h4>Sony Noise-Cancelling Headphones</h4>
                <p>Electronics • Condition: Like New</p>
                <div className="preview-card-footer">
                  <div className="preview-seller-chip">
                    <span className="seller-online-indicator" />
                    <span>Rahul S. (Active Now)</span>
                  </div>
                  <span className="preview-offer-btn">Chat / Offer</span>
                </div>
              </div>
            </div>

            <div className="preview-mini-pill pill-top">
              <span className="mini-pill-dot" />
              <span>Direct Chat Negotiation</span>
            </div>

            <div className="preview-mini-pill pill-bottom">
              <span className="mini-pill-check">✓</span>
              <span>Purchase Request Confirmed</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="landing-section" id="categories">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Curated Collections</span>
            <h2>Discover What You Love</h2>
            <p>From pre-owned tech to handmade furniture, explore verified items from real local sellers.</p>
          </div>

          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div
                key={index}
                className="category-card"
                onClick={() => navigate(`/marketplace?category=${encodeURIComponent(cat.name)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/marketplace?category=${encodeURIComponent(cat.name)}`);
                  }
                }}
              >
                <div
                  className="category-image"
                  style={{ backgroundImage: `url(${cat.img})` }}
                >
                  <span className="category-tag">{cat.tag}</span>
                </div>
                <div className="category-meta">
                  <h3>{cat.name}</h3>
                  <p>{cat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES / VALUE PROPOSITION */}
      <section className="landing-section alt-bg" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Why Choose SmallThings</span>
            <h2>Built for People, Not Algorithms</h2>
            <p>A modern marketplace crafted to foster transparent peer-to-peer exchanges and local artisan shops.</p>
          </div>

          <div className="features-grid">
            {features.map((item, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-box">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Simple & Safe</span>
            <h2>How SmallThings Works</h2>
            <p>Start buying or selling in three straightforward, transparent steps.</p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Explore or Post Item</h3>
              <p>
                Sign up in seconds. Browse verified listings or snap high-res photos to post your item with description and price.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Chat & Make Offers</h3>
              <p>
                Message sellers directly through integrated live chat. Ask product details, negotiate fair counter-offers, and coordinate.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Reserve & Handover</h3>
              <p>
                When both sides agree, send a purchase request. Once accepted, the item is marked as reserved until completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOR SMALL BUSINESSES */}
      <section className="landing-section alt-bg" id="business">
        <div className="section-container">
          <div className="business-box">
            <div className="business-content">
              <span className="section-eyebrow">For Independent Makers</span>
              <h2>Turn Your Craft Into A Thriving Local Business</h2>
              <p>
                Small businesses, independent artisans, and boutique shops can establish an instant digital storefront without expensive platform commission cuts.
              </p>

              <div className="business-perks">
                <div className="perk-item">
                  <FontAwesomeIcon icon={faLeaf} className="perk-icon" />
                  <div>
                    <h4>Community Supported</h4>
                    <p>Connect with local shoppers passionate about supporting independent makers.</p>
                  </div>
                </div>

                <div className="perk-item">
                  <FontAwesomeIcon icon={faWallet} className="perk-icon" />
                  <div>
                    <h4>Fair & Transparent</h4>
                    <p>Keep your revenue without paying high transaction commissions on every sale.</p>
                  </div>
                </div>

                <div className="perk-item">
                  <FontAwesomeIcon icon={faUsers} className="perk-icon" />
                  <div>
                    <h4>Direct Buyer Relationships</h4>
                    <p>Build repeat customer loyalty through direct messaging and tailored support.</p>
                  </div>
                </div>
              </div>

              <button
                className="landing-btn landing-btn-primary landing-btn-lg liquid-btn"
                onClick={() => navigate("/register")}
                onMouseMove={handleLiquidMove}
              >
                <span className="liquid-ripple" />
                <span>Register as a Seller</span>
                <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="landing-section" id="about">
        <div className="section-container">
          <div className="about-wrapper">
            <div className="about-block">
              <span className="section-eyebrow">Our Mission</span>
              <h2>Accessible, Sustainable Commerce</h2>
              <p>
                SmallThings was created to make buying and selling simple, secure, and personal. By bridging direct C2C exchanges with local small business discovery, we extend item lifecycles and support neighborhood makers.
              </p>
            </div>
            <div className="about-block">
              <span className="section-eyebrow">Our Philosophy</span>
              <h2>People-First Community</h2>
              <p>
                Every transaction on SmallThings strengthens local community ties. Reusing pre-owned goods reduces planetary footprint, while supporting indie artisans helps local economic growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="landing-cta-section">
        <div className="cta-container">
          <h2>Ready to Start Buying & Selling?</h2>
          <p>Join thousands of community buyers and small businesses on SmallThings today.</p>
          <div className="cta-buttons">
            <button
              className="landing-btn landing-btn-primary landing-btn-lg liquid-btn"
              onClick={() => navigate(token ? "/marketplace" : "/register")}
              onMouseMove={handleLiquidMove}
            >
              <span className="liquid-ripple" />
              <span>Create Free Account</span>
              <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 8 }} />
            </button>
            <button
              className="landing-btn landing-btn-outline landing-btn-lg"
              onClick={() => navigate("/marketplace")}
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="landing-logo">
                <img src={logoWhite} alt="SmallThings" className="logo-img" />
                <h2 style={{ color: "#ffffff" }}>
                  Small<span>Things</span>
                </h2>
              </div>
              <p>
                The modern marketplace where individuals and small businesses connect, negotiate, and trade with confidence.
              </p>
              <div className="footer-social-links">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <FontAwesomeIcon icon={faGithub} />
                </a>
              </div>
            </div>

            <div className="footer-links-grid">
              <div className="footer-col">
                <h4>Marketplace</h4>
                <a href="/marketplace">Browse Products</a>
                <a href="#categories">Categories</a>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
              </div>

              <div className="footer-col">
                <h4>Account</h4>
                <a href="/login">Sign In</a>
                <a href="/register">Create Account</a>
                <a href="/listings">My Listings</a>
                <a href="/orders">Orders</a>
              </div>

              <div className="footer-col">
                <h4>Company</h4>
                <a href="#about">About SmallThings</a>
                <a href="#business">Small Businesses</a>
                <a href="/settings">Settings</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 SmallThings Inc. All rights reserved.</p>
            <p>Crafted for sustainable, direct peer-to-peer and small business trading.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
