import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const useScrollY = () => {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
};

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

const Landing = () => {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollY();
  const heroRef = useRef(null);

  // Colors dynamically mapping to CSS variables to feed clean Tailwind classes
  const tk = {
    bg:       dark ? 'bg-[#08090d]' : 'bg-[#f4f4f0]',
    surface:  dark ? 'bg-[#0f1017]' : 'bg-[#ffffff]',
    card:     dark ? 'bg-[#13141c]' : 'bg-[#fafafa]',
    text:     dark ? 'text-[#eef0f5]' : 'text-[#0f1017]',
    sub:      dark ? 'text-[#6b7280]' : 'text-[#6b7280]',
    muted:    dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]',
    border:   dark ? 'border-white/5' : 'border-black/5',
    borderHov:dark ? 'hover:border-blue-400/50' : 'hover:border-blue-600/40',
  };

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

  return (
    <div className={`${tk.bg} ${tk.text} min-h-screen antialiased transition-colors duration-300 relative overflow-hidden font-mono`}>
      
      {/* Embedded Global Styles & Custom Utilities */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap');
        
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono { font-family: 'DM Mono', 'Fira Code', monospace; }
        
        /* Smooth Custom Dropdown Animation */
        .dropdown-transition {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, visibility 0.25s;
        }
      `}</style>

      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]" style={{ backgroundImage: NOISE }} />

      {/* ── NAVBAR ── */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrollY > 20 
            ? `${dark ? 'bg-[#08090d]/85' : 'bg-[#f4f4f0]/85'} backdrop-blur-md ${dark ? 'border-white/5' : 'border-black/5'}` 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="h-16 flex items-center justify-between">

            {/* Logo */}
            <span className="font-syne text-xl font-extrabold tracking-tight select-none">
              Trans<span className="text-blue-500">X</span>
              <span className={`ml-2 text-[9px] tracking-[0.15em] ${dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]'} align-middle uppercase font-mono font-medium`}>secure</span>
            </span>

            {/* Nav links — Desktop */}
            <div className="hidden md:flex items-center gap-9">
              {['Features', 'How It Works', 'Pricing'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className={`text-xs tracking-wider uppercase font-medium ${dark ? 'text-gray-400 hover:text-blue-500' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                  {item}
                </a>
              ))}
            </div>

            {/* Right Control Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setDark(d => !d)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center bg-transparent cursor-pointer text-sm transition-colors duration-200 ${dark ? 'border-white/5 text-gray-400 hover:text-gray-200' : 'border-black/5 text-gray-500 hover:text-gray-900'}`}
              >
                {dark ? '☀️' : '🌙'}
              </button>

              {/* Layout Container for Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2.5">
                <Link to="/login" className={`text-xs tracking-wider uppercase font-medium px-4 py-2 rounded-lg border transition-all duration-200 ${dark ? 'border-white/5 text-gray-400 hover:text-white' : 'border-black/5 text-gray-500 hover:text-black'}`}>Login</Link>
                <Link to="/register" className={`text-xs tracking-wider font-semibold px-4.5 py-2 rounded-lg transition-all duration-200 shadow-md ${dark ? 'bg-[#eef0f5] text-[#08090d] hover:bg-white' : 'bg-[#0f1017] text-white hover:opacity-90'} active:scale-95`}>Get Started</Link>
              </div>

              {/* Hamburger Menu Icon */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                className={`md:hidden w-9 h-9 rounded-lg border flex items-center justify-center bg-transparent cursor-pointer text-lg transition-colors duration-200 ${dark ? 'border-white/5 text-gray-400' : 'border-black/5 text-gray-500'}`}
              >
                {menuOpen ? '✕' : '≡'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu — Beautiful Custom Reveal Transition */}
        <div
          className={`dropdown-transition absolute top-16 left-0 right-0 p-6 flex flex-col gap-4 border-b md:hidden z-40 ${
            menuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-2 opacity-0 visibility-hidden pointer-events-none'
          } ${dark ? 'bg-[#08090d]/98 border-white/5' : 'bg-[#f4f4f0]/98 border-black/5'} backdrop-blur-xl`}
        >
          {['Features', 'How It Works', 'Pricing'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className={`text-sm tracking-wide py-2.5 border-b uppercase font-medium ${dark ? 'border-white/5 text-gray-400 hover:text-blue-500' : 'border-black/5 text-gray-500 hover:text-blue-600'}`}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2.5 mt-2 sm:hidden">
            <Link to="/login" onClick={() => setMenuOpen(false)} className={`text-xs tracking-wider uppercase text-center font-medium py-3 rounded-lg border ${dark ? 'border-white/5 text-gray-400' : 'border-black/5 text-gray-500'}`}>Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className={`text-xs tracking-wider text-center font-semibold py-3 rounded-lg ${dark ? 'bg-[#eef0f5] text-[#08090d]' : 'bg-[#0f1017] text-white'}`}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-20 overflow-hidden">
        
        {/* Glow Orbs */}
        <div className="absolute -top-[10%] left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none filter blur-[40px]" style={{ background: `radial-gradient(circle, rgba(59,130,246,${dark ? 0.126 : 0.054}) 0%, transparent 70%)` }} />
        <div className="absolute top-[20%] left-[60%] w-[400px] h-[400px] rounded-full pointer-events-none filter blur-[40px]" style={{ background: `radial-gradient(circle, rgba(59,130,246,${dark ? 0.09 : 0.04}) 0%, transparent 70%)` }} />

        {/* Technical Grid Texture */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} 
        />

        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <div className="mb-6 animate-[fadeIn_0.6s_ease_both]">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-500/25 rounded-full text-[11px] tracking-wider uppercase text-blue-400 bg-blue-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              AES-256 · End-to-End Encrypted
            </span>
          </div>

          <h1 className="font-syne text-[clamp(36px,7.5vw,76px)] font-extrabold tracking-tight leading-[1.05] mb-6 animate-[fadeUp_0.9s_ease_both] ${tk.text}">
            Share Files<br />
            <span className="text-blue-500 relative inline-block">
              Without Fear
              <svg className="absolute -bottom-1 left-0 w-full h-2 overflow-visible" viewBox="0 0 400 8">
                <path d="M0 6 Q100 0 200 6 Q300 12 400 6" stroke="#3b82f6" strokeWidth="2" fill="none" className="opacity-50" />
              </svg>
            </span>
          </h1>

          <p className={`text-sm md:text-base leading-relaxed ${tk.sub} max-w-[520px] mx-auto mb-10 font-light font-mono animate-[fadeUp_0.9s_0.15s_ease_both]`}>
            TransX gives your organization a private encrypted vault — upload, organize,
            and share files with surgical control over who sees what.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none animate-[fadeUp_0.9s_0.3s_ease_both]">
            <Link to="/register" className="inline-flex items-center justify-center gap-1.5 px-7 py-3.5 bg-blue-500 text-white font-semibold text-xs rounded-lg tracking-wide hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0">
              Start for Free <span className="text-base font-normal">→</span>
            </Link>
            <a href="#how-it-works" className={`inline-flex items-center justify-center gap-1.5 px-7 py-3.5 rounded-lg font-medium text-xs border tracking-wide transition-all duration-200 ${dark ? 'border-white/5 text-[#eef0f5] hover:border-blue-400/40' : 'border-black/5 text-[#0f1017] hover:border-blue-600/40'} hover:text-blue-500`}>
              See How It Works
            </a>
          </div>

          {/* Stats Metrics Display */}
          <div className={`mt-16 grid grid-cols-3 gap-3 md:gap-6 max-w-[420px] mx-auto border-t pt-10 ${dark ? 'border-white/5' : 'border-black/5'} animate-[fadeUp_0.9s_0.45s_ease_both]`}>
            {[{ value: 'AES-256', label: '// encryption' }, { value: '100%', label: '// private' }, { value: 'Free', label: '// to start' }].map(({ value, label }) => (
              <div key={label}>
                <p className={`font-syne text-lg md:text-2xl font-bold mb-1 ${tk.text}`}>{value}</p>
                <p className={`text-[10px] tracking-wide ${dark ? 'text-[#3d4050]' : 'text----'}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glow Line Divider Helper */}
      <div className="h-[1px] max-w-[1100px] mx-auto bg-gradient-to-right from-transparent via-blue-500/20 to-transparent my-16" />

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] tracking-[0.2em] uppercase text-blue-500 font-medium mb-3 block">// features</span>
            <h2 className={`font-syne text-3xl md:text-4xl font-extrabold tracking-tight mb-4 ${tk.text}`}>Everything Your Team Needs</h2>
            <p className={`${tk.sub} text-sm max-w-[480px] mx-auto leading-relaxed font-light`}>
              Built for organizations that treat data security as a first-class concern.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className={`${tk.card} border ${tk.border} ${tk.borderHov} rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/5`}>
                <div className="text-xl mb-4 text-blue-500 font-mono">{icon}</div>
                <h3 className={`font-syne font-bold text-[15px] mb-2 tracking-tight ${tk.text}`}>{title}</h3>
                <p className={`${tk.sub} text-[13px] leading-relaxed font-light`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-[1px] max-w-[1100px] mx-auto bg-gradient-to-right from-transparent via-blue-500/20 to-transparent my-16" />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 relative">
        <div className="max-w-[680px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] tracking-[0.2em] uppercase text-blue-500 font-medium mb-3 block">// how it works</span>
            <h2 className={`font-syne text-3xl md:text-4xl font-extrabold tracking-tight mb-4 ${tk.text}`}>Up and Running in Minutes</h2>
            <p className={`${tk.sub} text-sm max-w-[400px] mx-auto leading-relaxed font-light`}>
              No complicated setup. Create, invite, and share.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {steps.map(({ number, title, desc }, i) => (
              <div key={number} className={`${tk.card} border ${tk.border} hover:border-blue-500/30 rounded-2xl p-6 md:p-8 flex items-start gap-5 md:gap-6 relative group transition-all duration-200 hover:translate-x-1`}>
                <span className="font-mono text-3xl font-light text-blue-500/20 shrink-0 w-11 text-right">{number}</span>
                <div className="grow">
                  <h3 className={`font-syne font-bold text-[15px] mb-1 tracking-tight ${tk.text}`}>{title}</h3>
                  <p className={`${tk.sub} text-[13px] leading-relaxed font-light`}>{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`absolute left-14 -bottom-[15px] text-lg font-bold z-10 transition-colors ${dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]'}`}>↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-[1px] max-w-[1100px] mx-auto bg-gradient-to-right from-transparent via-blue-500/20 to-transparent my-16" />

      {/* ── PRICING ── */}
      <section id="pricing" className="pt-20 pb-24 px-6 relative">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] tracking-[0.2em] uppercase text-blue-500 font-medium mb-3 block">// pricing</span>
            <h2 className={`font-syne text-3xl md:text-4xl font-extrabold tracking-tight mb-4 ${tk.text}`}>Simple, Honest Pricing</h2>
            <p className={`${tk.sub} text-sm max-w-[380px] mx-auto leading-relaxed font-light`}>
              Start free. Upgrade when your team needs more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 md:p-9 flex flex-col transition-all duration-300 border hover:-translate-y-1 ${
                  plan.pro
                    ? 'bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 border-blue-500/60 shadow-2xl shadow-blue-500/20'
                    : `${tk.card} ${tk.border}`
                }`}
              >
                {plan.pro && (
                  <div className="mb-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold bg-white/15 text-white">★ most popular</span>
                  </div>
                )}

                <div className="mb-1.5">
                  <span className={`font-syne text-xs font-bold tracking-widest uppercase ${plan.pro ? 'text-white/60' : dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]'}`}>{plan.name}</span>
                </div>

                <div className="mb-2 flex items-baseline">
                  <span className={`font-syne text-3xl md:text-4xl font-extrabold tracking-tight ${plan.pro ? 'text-white' : tk.text}`}>{plan.price}</span>
                  <span className={`text-[11px] ml-1.5 ${plan.pro ? 'text-white/50' : dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]'}`}>/ {plan.period}</span>
                </div>

                <p className={`text-[13px] leading-relaxed mb-7 font-light ${plan.pro ? 'text-white/70' : tk.sub}`}>{plan.desc}</p>

                <div className="grow flex flex-col gap-3 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-[13px]">
                      <span className={`shrink-0 text-xs ${plan.pro ? 'text-white/70' : 'text-blue-500'}`}>✓</span>
                      <span className={`font-light ${plan.pro ? 'text-white/80' : tk.sub}`}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={plan.ctaLink}
                  className={`block text-center py-3 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 hover:opacity-90 ${
                    plan.pro ? 'bg-white text-blue-700' : 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className={`text-center text-[11px] mt-6 tracking-wide ${dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]'}`}>
            * Pro payments via eSewa · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t px-6 py-12 relative z-10 ${dark ? 'border-white/5 bg-black/40' : 'border-black/5 bg-black/[0.01]'}`}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-9">
            <div>
              <p className={`font-syne text-xl font-extrabold tracking-tight ${tk.text}`}>
                Trans<span className="text-blue-500">X</span>
              </p>
              <p className={`text-xs mt-1 tracking-wide ${dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]'}`}>Secure File Sharing for Modern Teams</p>
            </div>

            {/* Centered Desktop Nav Footer */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'Pricing'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className={`text-xs tracking-wider uppercase font-medium ${dark ? 'text-gray-400 hover:text-blue-500' : 'text-gray-500 hover:text-blue-600'} transition-colors duration-200`}>
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <Link to="/login" className={`text-xs tracking-wider uppercase font-medium px-4 py-2 rounded-lg border transition-all duration-200 ${dark ? 'border-white/5 text-gray-400 hover:text-white' : 'border-black/5 text-gray-500 hover:text-black'}`}>Login</Link>
              <Link to="/register" className={`text-xs tracking-wider font-semibold px-4.5 py-2 rounded-lg transition-all duration-200 ${dark ? 'bg-[#eef0f5] text-[#08090d] hover:bg-white' : 'bg-[#0f1017] text-white hover:opacity-90'}`}>Get Started</Link>
            </div>
          </div>

          {/* Dynamic Bottom Accent Line */}
          <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent mb-6`} />

          <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] tracking-wide ${dark ? 'text-[#3d4050]' : 'text-[#c4c7cc]'}`}>
            <p>© 2026 TransX. All rights reserved.</p>
            <p>Built with ♥ in Nepal</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;