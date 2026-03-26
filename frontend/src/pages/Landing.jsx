import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   TransX Landing  —  "Vault Noir" aesthetic
   Dark-first, monospace accents, cinematic glows,
   micro-animations, noise-texture atmosphere.
───────────────────────────────────────────── */

const useScrollY = () => {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
};

/* Noise SVG data-uri for grain overlay */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

const Landing = () => {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollY();
  const heroRef = useRef(null);

  /* Light / dark token map */
  const tk = {
    bg:        dark ? '#08090d' : '#f4f4f0',
    surface:   dark ? '#0f1017' : '#ffffff',
    card:      dark ? '#13141c' : '#fafafa',
    border:    dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
    borderHov: dark ? 'rgba(99,179,237,0.5)'  : 'rgba(37,99,235,0.4)',
    text:      dark ? '#eef0f5' : '#0f1017',
    sub:       dark ? '#6b7280' : '#6b7280',
    muted:     dark ? '#3d4050' : '#c4c7cc',
    accent:    '#3b82f6',
    accentBr:  '#60a5fa',
    glow:      dark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
  };

  const css = (obj) => Object.assign({}, obj);

  const features = [
    { icon: '⬡', title: 'AES-256 Encryption',      desc: 'Every file encrypted client-side before hitting our servers. Zero-knowledge by design.' },
    { icon: '◈', title: 'Organization Workspaces', desc: 'Private orgs with invite-only join codes. No public exposure, ever.' },
    { icon: '⊞', title: 'Category-Based Sharing',  desc: 'Organize members into departments. Broadcast files to entire teams in one action.' },
    { icon: '◉', title: 'Role Management',          desc: 'Admin, uploader, or member — fine-grained permissions out of the box.' },
    { icon: '◎', title: 'Granular Access Control',  desc: 'Share with specific categories or individuals. Revoke access instantly.' },
    { icon: '◈', title: 'Access Logs',              desc: 'Every download timestamped. Full audit trail so nothing goes unnoticed.' },
  ];

  const steps = [
    { number: '01', title: 'Create an Organization', desc: 'Spin up a private workspace and generate a unique join code in seconds.' },
    { number: '02', title: 'Invite Your Team',        desc: 'Members join with the code. Assign roles — admin, uploader, or viewer.' },
    { number: '03', title: 'Organize with Categories',desc: 'Build categories like Engineering or Design and slot members in.' },
    { number: '04', title: 'Upload & Share Securely', desc: 'Drop files, pick who sees them, encryption handles the rest.' },
  ];

  const plans = [
    {
      name: 'Free', price: 'NPR 0', period: 'forever',
      desc: 'For small teams getting started.',
      features: ['1 Organization','Up to 10 members','Files stored 30 days','500 MB storage','Basic role management','AES-256 encryption'],
      cta: 'Get Started Free', ctaLink: '/register', pro: false,
    },
    {
      name: 'Pro', price: 'NPR 499', period: 'per month',
      desc: 'For teams that need power and permanence.',
      features: ['Unlimited organizations','Unlimited members','Permanent file storage','10 GB storage','Advanced roles','AES-256 encryption','Priority support','Access logs & analytics'],
      cta: 'Upgrade to Pro', ctaLink: '/register', pro: true,
    },
  ];

  /* ─── style helpers ─── */
  const navStyle = css({
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: scrollY > 20
      ? dark ? 'rgba(8,9,13,0.85)' : 'rgba(244,244,240,0.85)'
      : 'transparent',
    backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
    borderBottom: scrollY > 20 ? `1px solid ${tk.border}` : '1px solid transparent',
    transition: 'all 0.3s ease',
  });

  const glowOrb = (top, left, size, opacity = 1) => ({
    position: 'absolute', top, left,
    width: size, height: size,
    background: `radial-gradient(circle, rgba(59,130,246,${0.18 * opacity}) 0%, transparent 70%)`,
    borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)',
  });

  return (
    <div style={{ background: tk.bg, minHeight: '100vh', fontFamily: "'DM Mono', 'Fira Code', monospace", transition: 'background 0.3s', position: 'relative', overflow: 'hidden' }}>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::selection { background: rgba(59,130,246,0.35); color: #fff; }

        html { scroll-behavior: smooth; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 12px rgba(59,130,246,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        @keyframes scanline {
          0%   { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }

        .hero-title { font-family: 'Syne', sans-serif; animation: fadeUp 0.9s ease both; }
        .hero-sub   { animation: fadeUp 0.9s 0.15s ease both; }
        .hero-cta   { animation: fadeUp 0.9s 0.3s ease both; }
        .hero-stats { animation: fadeUp 0.9s 0.45s ease both; }

        .feature-card {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .feature-card:hover {
          border-color: rgba(99,179,237,0.5) !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(59,130,246,0.1);
        }

        .step-card {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 32px;
          display: flex; align-items: flex-start; gap: 24px;
          transition: border-color 0.25s, transform 0.25s;
        }
        .step-card:hover {
          border-color: rgba(99,179,237,0.4) !important;
          transform: translateX(4px);
        }

        .price-card {
          border-radius: 20px;
          padding: 36px;
          display: flex; flex-direction: column;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .price-card:hover { transform: translateY(-4px); }
        .price-card.pro:hover { box-shadow: 0 24px 60px rgba(59,130,246,0.25); }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 14px 28px;
          background: #3b82f6;
          color: #fff; font-weight: 600; font-size: 13px;
          border-radius: 10px; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          text-decoration: none; letter-spacing: 0.02em;
          font-family: 'DM Mono', monospace;
          animation: pulse-ring 2.5s infinite;
        }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59,130,246,0.35); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 14px 28px;
          color: inherit; font-weight: 500; font-size: 13px;
          border-radius: 10px; border: 1px solid var(--border);
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
          text-decoration: none; letter-spacing: 0.02em;
          font-family: 'DM Mono', monospace; background: transparent;
        }
        .btn-ghost:hover { border-color: rgba(99,179,237,0.5); color: #3b82f6; }

        .nav-link {
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--sub); text-decoration: none;
          transition: color 0.2s; font-family: 'DM Mono', monospace;
        }
        .nav-link:hover { color: #3b82f6; }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px;
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 999px;
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #60a5fa; background: rgba(59,130,246,0.08);
          font-family: 'DM Mono', monospace;
          animation: fadeIn 0.6s ease both;
        }

        .section-label {
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #3b82f6; font-family: 'DM Mono', monospace;
          margin-bottom: 12px; display: block;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; letter-spacing: -0.02em; line-height: 1.1;
        }

        .check-item {
          display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
          font-size: 13px;
        }
        .check-icon { color: #3b82f6; font-size: 12px; flex-shrink: 0; }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.35;
          background-image: ${NOISE};
        }

        .glow-line {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent);
        }

        .mono-num {
          font-family: 'DM Mono', monospace;
          font-size: 32px; font-weight: 300;
          color: rgba(59,130,246,0.2); flex-shrink: 0; width: 44px; text-align: right;
        }

        .terminal-badge {
          display: inline-block;
          padding: 2px 8px; border-radius: 4px;
          background: rgba(59,130,246,0.12);
          color: #60a5fa;
          font-size: 10px; letter-spacing: 0.1em;
          font-family: 'DM Mono', monospace;
        }

        .float-card { animation: float 4s ease-in-out infinite; }

        @media (max-width: 768px) {
          .hero-title { font-size: clamp(36px, 9vw, 64px) !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      {/* CSS vars bridge */}
      <style>{`:root { --border: ${tk.border}; --sub: ${tk.sub}; }`}</style>

      {/* Grain overlay */}
      <div className="grain" />

      {/* ── NAVBAR ── */}
      <nav style={navStyle}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: tk.text, letterSpacing: '-0.02em' }}>
            Trans<span style={{ color: tk.accent }}>X</span>
            <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: '0.15em', color: tk.muted, verticalAlign: 'middle', textTransform: 'uppercase' }}>secure</span>
          </span>

          {/* Nav links */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 36 }}>
            {['Features', 'How It Works', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="nav-link">{item}</a>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setDark(d => !d)}
              style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${tk.border}`, background: 'transparent', cursor: 'pointer', fontSize: 15, transition: 'border-color 0.2s', color: tk.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >{dark ? '○' : '●'}</button>

            <Link to="/login" className="nav-link" style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${tk.border}`, transition: 'border-color 0.2s' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: 12, animation: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>

        {/* Background glows */}
        <div style={glowOrb('-10%', '10%', '600px', 0.7)} />
        <div style={glowOrb('20%', '60%', '400px', 0.5)} />

        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${tk.border} 1px, transparent 1px), linear-gradient(90deg, ${tk.border} 1px, transparent 1px)`,
          backgroundSize: '60px 60px', opacity: dark ? 0.6 : 0.3,
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          <div style={{ marginBottom: 24 }}>
            <span className="badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
              AES-256 · End-to-End Encrypted
            </span>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, color: tk.text, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 24 }}>
            Share Files<br />
            <span style={{ color: tk.accent, position: 'relative' }}>
              Without Fear
              <svg style={{ position: 'absolute', bottom: -4, left: 0, width: '100%', height: 8, overflow: 'visible' }} viewBox="0 0 400 8">
                <path d="M0 6 Q100 0 200 6 Q300 12 400 6" stroke={tk.accent} strokeWidth="2" fill="none" opacity="0.5" />
              </svg>
            </span>
          </h1>

          <p className="hero-sub" style={{ fontSize: 16, lineHeight: 1.75, color: tk.sub, maxWidth: 520, margin: '0 auto 40px', fontFamily: "'DM Mono', monospace", fontWeight: 300 }}>
            TransX gives your organization a private encrypted vault — upload, organize,
            and share files with surgical control over who sees what.
          </p>

          <div className="hero-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary">
              Start for Free <span style={{ fontSize: 16 }}>→</span>
            </Link>
            <a href="#how-it-works" className="btn-ghost" style={{ color: tk.text }}>
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats" style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, maxWidth: 420, margin: '64px auto 0', borderTop: `1px solid ${tk.border}`, paddingTop: 40 }}>
            {[{ value: 'AES-256', label: '// encryption' }, { value: '100%', label: '// private' }, { value: 'Free', label: '// to start' }].map(({ value, label }) => (
              <div key={label}>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: tk.text, marginBottom: 4 }}>{value}</p>
                <p style={{ fontSize: 11, color: tk.muted, letterSpacing: '0.05em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative' }}>
        <div className="glow-line" style={{ marginBottom: 80 }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-label">// features</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px,5vw,44px)', color: tk.text, marginBottom: 16 }}>Everything Your Team Needs</h2>
            <p style={{ color: tk.sub, fontSize: 14, maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
              Built for organizations that treat data security as a first-class concern.
            </p>
          </div>

          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {features.map(({ icon, title, desc }, i) => (
              <div key={title} className="feature-card" style={{ background: tk.card, animationDelay: `${i * 80}ms` }}>
                <div style={{ fontSize: 22, marginBottom: 16, color: tk.accent, fontFamily: 'monospace' }}>{icon}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 13, color: tk.sub, lineHeight: 1.7, fontWeight: 300 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '100px 24px', position: 'relative' }}>
        <div className="glow-line" style={{ marginBottom: 80 }} />
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-label">// how it works</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px,5vw,44px)', color: tk.text, marginBottom: 16 }}>Up and Running in Minutes</h2>
            <p style={{ color: tk.sub, fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
              No complicated setup. Create, invite, and share.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map(({ number, title, desc }, i) => (
              <div key={number} className="step-card" style={{ background: tk.card, position: 'relative' }}>
                <span className="mono-num">{number}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: tk.text, marginBottom: 4, letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: 13, color: tk.sub, lineHeight: 1.7, fontWeight: 300 }}>{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', left: 62, bottom: -18, color: tk.muted, fontSize: 18, zIndex: 1 }}>↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px 80px', position: 'relative' }}>
        <div className="glow-line" style={{ marginBottom: 80 }} />
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="section-label">// pricing</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(28px,5vw,44px)', color: tk.text, marginBottom: 16 }}>Simple, Honest Pricing</h2>
            <p style={{ color: tk.sub, fontSize: 14, maxWidth: 380, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
              Start free. Upgrade when your team needs more.
            </p>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`price-card ${plan.pro ? 'pro' : ''}`}
                style={{
                  background: plan.pro
                    ? `linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)`
                    : tk.card,
                  border: `1px solid ${plan.pro ? 'rgba(59,130,246,0.6)' : tk.border}`,
                }}
              >
                {plan.pro && (
                  <div style={{ marginBottom: 16 }}>
                    <span className="terminal-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>★ most popular</span>
                  </div>
                )}

                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: plan.pro ? 'rgba(255,255,255,0.6)' : tk.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{plan.name}</span>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: plan.pro ? '#fff' : tk.text, letterSpacing: '-0.02em' }}>{plan.price}</span>
                  <span style={{ fontSize: 12, color: plan.pro ? 'rgba(255,255,255,0.5)' : tk.muted, marginLeft: 6 }}>/ {plan.period}</span>
                </div>

                <p style={{ fontSize: 13, color: plan.pro ? 'rgba(255,255,255,0.65)' : tk.sub, marginBottom: 28, lineHeight: 1.6, fontWeight: 300 }}>{plan.desc}</p>

                <div style={{ flex: 1, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} className="check-item">
                      <span className="check-icon" style={{ color: plan.pro ? 'rgba(255,255,255,0.7)' : tk.accent }}>✓</span>
                      <span style={{ fontSize: 13, color: plan.pro ? 'rgba(255,255,255,0.75)' : tk.sub, fontWeight: 300 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={plan.ctaLink}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '12px 0', borderRadius: 10,
                    fontWeight: 600, fontSize: 13,
                    letterSpacing: '0.05em', textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: plan.pro ? '#fff' : tk.accent,
                    color: plan.pro ? '#1d4ed8' : '#fff',
                    fontFamily: "'DM Mono', monospace",
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >{plan.cta}</Link>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: tk.muted, marginTop: 20, letterSpacing: '0.04em' }}>
            * Pro payments via eSewa · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${tk.border}`, padding: '48px 24px', background: dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.02)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 36 }}>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: tk.text, letterSpacing: '-0.02em' }}>
                Trans<span style={{ color: tk.accent }}>X</span>
              </p>
              <p style={{ fontSize: 12, color: tk.muted, marginTop: 4, letterSpacing: '0.04em' }}>Secure File Sharing for Modern Teams</p>
            </div>

            <div style={{ display: 'flex', gap: 32 }}>
              {['Features', 'How It Works', 'Pricing'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="nav-link">{item}</a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" className="btn-ghost" style={{ color: tk.text, padding: '8px 18px', fontSize: 12 }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: 12, animation: 'none' }}>Get Started</Link>
            </div>
          </div>

          <div className="glow-line" style={{ marginBottom: 24 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 11, color: tk.muted, letterSpacing: '0.04em' }}>© 2025 TransX. All rights reserved.</p>
            <p style={{ fontSize: 11, color: tk.muted, letterSpacing: '0.04em' }}>Built with ♥ in Nepal</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;