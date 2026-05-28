"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Play, Zap, Sparkles, ArrowRight, Check, ChevronDown,
  Star, Globe, Shield, Cpu, Users, Download, Film,
  LayoutGrid, Layers, Code2, Menu, X, ExternalLink,
} from "lucide-react";

// ─── DESIGN TOKENS ────────────────────────────────────────────
const C = {
  acc:   "#B8FF3E",
  cyan:  "#3EE8FF",
  vio:   "#9D7AFF",
  gold:  "#FFB930",
  rose:  "#FF5E7D",
  bg:    "#070910",
  surf:  "#0F1220",
  surf2: "#141828",
  surf3: "#1A1F30",
  txt:   "#EEF0FA",
  txt2:  "#7A8299",
  txt3:  "#3D4460",
};

// ─── ANIMATION VARIANTS ────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
};
const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1], delay } },
});
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4 } },
};

// ─── SCROLL-REVEAL WRAPPER ─────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger(delay)}
    >
      {children}
    </motion.div>
  );
}

// ─── SVG SCENE THUMBNAILS ──────────────────────────────────────
const scenes = {
  cyberpunk: (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <rect width="320" height="180" fill="#050014" />
      <rect x="0" y="60" width="28" height="120" fill="#0D0020" />
      <rect x="4" y="70" width="4" height="3" fill="#FF2D7A" opacity=".9" />
      <rect x="10" y="80" width="4" height="3" fill="#3EE8FF" opacity=".8" />
      <rect x="30" y="40" width="22" height="140" fill="#0A001A" />
      <rect x="34" y="50" width="4" height="3" fill="#3EE8FF" opacity=".9" />
      <rect x="54" y="20" width="32" height="160" fill="#07000F" />
      <rect x="58" y="28" width="5" height="4" fill="#3EE8FF" />
      <rect x="65" y="28" width="5" height="4" fill="#FF2D7A" />
      <rect x="180" y="30" width="40" height="150" fill="#06000E" />
      <rect x="185" y="40" width="6" height="5" fill="#3EE8FF" />
      <rect x="193" y="40" width="6" height="5" fill="#FF2D7A" />
      <rect x="225" y="10" width="50" height="170" fill="#080018" />
      <rect x="230" y="18" width="7" height="6" fill="#FF2D7A" />
      <rect x="240" y="18" width="7" height="6" fill="#3EE8FF" />
      <rect x="0" y="145" width="320" height="35" fill="#0A0015" />
      <rect x="50" y="148" width="8" height="30" fill="#FF2D7A" opacity=".18" />
      <rect x="100" y="152" width="5" height="25" fill="#3EE8FF" opacity=".15" />
    </svg>
  ),
  ocean: (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <linearGradient id="lp-sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1A3A" />
          <stop offset="40%" stopColor="#FF6B35" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFB347" />
        </linearGradient>
        <radialGradient id="lp-sun2" cx="50%" cy="55%">
          <stop offset="0%" stopColor="#FFF0A0" />
          <stop offset="30%" stopColor="#FFB347" stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="lp-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E4080" />
          <stop offset="100%" stopColor="#0A1A3A" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#lp-sky2)" />
      <ellipse cx="160" cy="92" rx="80" ry="80" fill="url(#lp-sun2)" />
      <circle cx="160" cy="92" r="18" fill="#FFF0A0" opacity="0.95" />
      <rect x="0" y="100" width="320" height="80" fill="url(#lp-sea)" />
      <ellipse cx="160" cy="105" rx="12" ry="40" fill="#FFE070" opacity="0.25" />
      <path d="M0 115 Q80 110 160 115 Q240 120 320 115" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    </svg>
  ),
  forest: (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <linearGradient id="lp-fsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1F0A" />
          <stop offset="100%" stopColor="#1A3A0A" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#lp-fsky)" />
      <rect x="0" y="60" width="20" height="120" fill="#0A2A0A" />
      <polygon points="10,20 0,65 20,65" fill="#0D3A0D" />
      <rect x="25" y="50" width="22" height="130" fill="#0D300D" />
      <polygon points="36,5 22,55 50,55" fill="#10420A" />
      <rect x="240" y="45" width="25" height="135" fill="#0A280A" />
      <polygon points="252,8 235,50 269,50" fill="#103A0A" />
      <rect x="270" y="60" width="20" height="120" fill="#0D300D" />
      <polygon points="280,22 265,65 295,65" fill="#0A3A08" />
      <rect x="100" y="70" width="15" height="110" fill="#152815" />
      <polygon points="108,35 97,75 119,75" fill="#1A4010" />
      <line x1="160" y1="0" x2="100" y2="180" stroke="rgba(184,255,62,0.06)" strokeWidth="20" />
      <line x1="160" y1="0" x2="220" y2="180" stroke="rgba(184,255,62,0.06)" strokeWidth="20" />
    </svg>
  ),
  galaxy: (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="lp-gcore" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#7B35FF" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#3B1080" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#02000A" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="#02000A" />
      <circle cx="20" cy="15" r="1" fill="white" opacity=".9" />
      <circle cx="55" cy="8" r="1.5" fill="white" opacity=".8" />
      <circle cx="130" cy="12" r="1" fill="white" opacity=".9" />
      <circle cx="170" cy="5" r="1.5" fill="white" />
      <circle cx="285" cy="20" r="1.5" fill="white" opacity=".9" />
      <ellipse cx="160" cy="90" rx="120" ry="55" fill="url(#lp-gcore)" />
      <circle cx="160" cy="90" r="22" fill="#9D60FF" opacity="0.7" />
      <circle cx="160" cy="90" r="10" fill="#EAD4FF" opacity="0.9" />
      <ellipse cx="160" cy="90" rx="80" ry="20" fill="rgba(155,100,255,0.2)" transform="rotate(-30 160 90)" />
    </svg>
  ),
  volcano: (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <linearGradient id="lp-vsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A0500" />
          <stop offset="60%" stopColor="#3D0E00" />
          <stop offset="100%" stopColor="#6A1800" />
        </linearGradient>
        <radialGradient id="lp-vglow" cx="50%" cy="75%">
          <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#lp-vsky)" />
      <rect width="320" height="180" fill="url(#lp-vglow)" />
      <polygon points="160,55 60,180 260,180" fill="#200600" />
      <polygon points="160,55 100,180 220,180" fill="#2A0800" />
      <ellipse cx="160" cy="62" rx="20" ry="10" fill="#FF4500" opacity=".9" />
      <ellipse cx="160" cy="62" rx="12" ry="6" fill="#FFB300" opacity=".95" />
      <path d="M155 68 Q148 90 140 120" stroke="#FF6A00" strokeWidth="3" fill="none" opacity=".7" />
      <path d="M165 68 Q172 90 180 120" stroke="#FF4500" strokeWidth="2.5" fill="none" opacity=".6" />
    </svg>
  ),
  arctic: (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <linearGradient id="lp-asky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000A1A" />
          <stop offset="100%" stopColor="#002050" />
        </linearGradient>
        <radialGradient id="lp-a1" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#00FF88" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#lp-asky)" />
      <ellipse cx="100" cy="55" rx="120" ry="30" fill="url(#lp-a1)" />
      <path d="M0 50 Q80 20 160 55 Q240 90 320 40" stroke="#00FF88" strokeWidth="2" fill="none" opacity=".3" />
      <circle cx="25" cy="10" r="1" fill="white" opacity=".8" />
      <circle cx="200" cy="8" r="1.5" fill="white" opacity=".9" />
      <path d="M0 130 Q60 115 120 122 Q180 130 240 118 Q280 112 320 115 L320 180 L0 180 Z" fill="#0A2040" />
      <polygon points="50,130 40,160 60,160" fill="#0D2A45" opacity=".9" />
    </svg>
  ),
};

// ─── MODEL DATA ────────────────────────────────────────────────
const MODELS = [
  { name: "Kling 2.6",      by: "Kuaishou",        color: C.cyan, quality: 96, speed: 78, realism: 92, res: "4K · 2min",  badge: "TOP",  scene: "cyberpunk" },
  { name: "Veo 3.1",        by: "Google DeepMind", color: "#4285F4", quality: 94, speed: 82, realism: 90, res: "4K · 20s",   badge: "NEW",  scene: "ocean"    },
  { name: "Sora 2 Pro",     by: "OpenAI",          color: "#10A37F", quality: 91, speed: 65, realism: 95, res: "1080p · 60s",badge: "",     scene: "galaxy"   },
  { name: "Runway Gen-4.5", by: "Runway ML",       color: C.rose,  quality: 93, speed: 88, realism: 89, res: "4K · 15s",   badge: "",     scene: "volcano"  },
  { name: "Luma Ray3",      by: "Luma AI",         color: C.vio,   quality: 90, speed: 90, realism: 91, res: "4K · 10s",   badge: "",     scene: "arctic"   },
  { name: "Pika 2.2",       by: "Pika Labs",       color: C.gold,  quality: 84, speed: 95, realism: 82, res: "1080p · 8s", badge: "FAST", scene: "forest"   },
];

// ─── PRICING DATA ──────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    tag: "For individuals",
    monthly: 19,
    annual: 15,
    credits: "1,500",
    color: C.txt2,
    features: [
      "3 AI models (Kling, Pika, Luma)",
      "Up to 1080p resolution",
      "5 seconds max per video",
      "10 videos per month",
      "Standard queue",
      "Email support",
    ],
    cta: "Start free trial",
    featured: false,
  },
  {
    name: "Pro",
    tag: "Most popular",
    monthly: 49,
    annual: 39,
    credits: "6,000",
    color: C.acc,
    features: [
      "All 6 AI models included",
      "4K Ultra resolution",
      "30 seconds max per video",
      "Unlimited videos",
      "Priority generation queue",
      "Storyboard builder",
      "Prompt enhancer AI",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Studio",
    tag: "For agencies",
    monthly: 149,
    annual: 119,
    credits: "25,000",
    color: C.vio,
    features: [
      "Everything in Pro",
      "Full API access",
      "4K · up to 2 min videos",
      "Team workspace (10 seats)",
      "White-label export",
      "Custom model fine-tuning",
      "SLA & dedicated support",
      "Invoice billing",
    ],
    cta: "Contact sales",
    featured: false,
  },
];

// ─── FAQ DATA ──────────────────────────────────────────────────
const FAQS = [
  { q: "What are credits and how do they work?", a: "Credits are the currency used to generate videos. Each generation costs credits based on the model, resolution, and duration you choose. Credits refresh monthly on your billing date and unused credits do not roll over." },
  { q: "Can I cancel anytime?", a: "Yes — cancel at any time from your account settings with one click. You keep full access until the end of your billing period with no cancellation fees." },
  { q: "Do I own the videos I generate?", a: "Absolutely. You own 100% of the output you create on CineAI. You can use videos commercially, publish them, sell them — no restrictions." },
  { q: "How is CineAI different from using each model directly?", a: "CineAI gives you access to 6 top AI models through a single subscription, single dashboard, and single credit system. No juggling 6 accounts, 6 subscriptions, or 6 different UIs." },
  { q: "Is there an API I can integrate into my app?", a: "Yes — the Studio plan includes full REST API access. You can trigger generations, poll status, and retrieve video URLs programmatically. Full docs are available in your dashboard." },
  { q: "What happens when I run out of credits?", a: "You can purchase top-up credit packs at any time without upgrading your plan. Packs start at $9 for 500 credits." },
  { q: "Can I use CineAI for a team?", a: "The Studio plan includes 10 team seats with shared credits and a team workspace. Each member gets their own login and generation history." },
  { q: "What video formats do you export in?", a: "All videos export as MP4 (H.264) by default. Studio plan users can also export ProRes and WebM. Resolution ranges from 720p to 4K depending on your plan." },
];

// ─── TESTIMONIALS ─────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sarah Chen",       role: "Content Director, Pulse Media",   text: "CineAI replaced our entire motion graphics budget. We're producing 40 videos a month that would've cost $20K+ with an agency.",              stars: 5, initials: "SC", color: "#3EE8FF" },
  { name: "Marcus Webb",      role: "Indie Filmmaker",                  text: "The Kling 2.6 model on CineAI is genuinely astonishing. I used it for a short film that got into three festivals. The physics are unreal.", stars: 5, initials: "MW", color: "#B8FF3E" },
  { name: "Priya Nair",       role: "Growth Lead, Launchpad Studio",    text: "We switched from 4 separate AI subscriptions to CineAI Studio. Saved $280/month and our team onboarded in under an hour.",               stars: 5, initials: "PN", color: "#9D7AFF" },
  { name: "James Okafor",     role: "YouTube Creator (2.1M subs)",      text: "My thumbnails and shorts intros used to take 3 days. Now it's 20 minutes. CineAI is the most impactful tool I've added in years.",           stars: 5, initials: "JO", color: "#FFB930" },
  { name: "Aiko Tanaka",      role: "Creative Director, Notion Films",  text: "The storyboard builder is what sold us. Being able to plan a 5-scene sequence, assign models per scene, and generate in batch — perfect.",   stars: 5, initials: "AT", color: "#FF5E7D" },
  { name: "Ravi Mehta",       role: "Founder, AdForge AI",              text: "The API integration was done in 2 hours. We now auto-generate product videos for 800+ SKUs every week. ROI was immediate.",                   stars: 5, initials: "RM", color: "#3EE8FF" },
];

// ─── FEATURE CARDS ────────────────────────────────────────────
const FEATURES = [
  { icon: Layers,     title: "6 AI Models, One Platform",  desc: "Kling 2.6, Veo 3.1, Sora 2, Runway Gen-4.5, Luma Ray3 & Pika 2.2 — all in one subscription.", size: "large", color: C.acc },
  { icon: Zap,        title: "4K Ultra Generation",         desc: "Export broadcast-quality 4K video at up to 2 minutes in length.", size: "small", color: C.cyan },
  { icon: Film,       title: "Storyboard Builder",          desc: "Plan multi-scene films, assign models per scene, generate in batch.", size: "small", color: C.vio },
  { icon: Sparkles,   title: "AI Prompt Enhancer",          desc: "Our AI rewrites your prompt to get the best possible result from each model.", size: "small", color: C.gold },
  { icon: Users,      title: "Team Workspace",              desc: "Shared credits, team video library, and per-member generation history.", size: "small", color: C.rose },
  { icon: Code2,      title: "Full REST API",               desc: "Trigger generations, poll status, retrieve video URLs — build anything.", size: "large", color: C.vio },
];

// ─── NAV LINKS ────────────────────────────────────────────────
const NAV_LINKS = ["Features", "Models", "How it works", "Pricing", "FAQ"];

// ─── STAT TICKER DATA ─────────────────────────────────────────
const STATS = [
  { val: "12,000+", label: "Creators" },
  { val: "1M+",     label: "Videos Generated" },
  { val: "4.9★",    label: "Average Rating" },
  { val: "6",       label: "AI Models" },
  { val: "4K",      label: "Max Resolution" },
  { val: "2 min",   label: "Max Duration" },
];

// ─── LOGO MARQUEE DATA ────────────────────────────────────────
const LOGOS = ["Kling 2.6", "Veo 3.1", "Sora 2 Pro", "Runway Gen-4.5", "Luma Ray3", "Pika 2.2", "OpenAI", "Google", "Runway", "Kuaishou"];

// ─── INLINE STYLES (CSS vars not in Tailwind v4 by default) ──
const glow = (color) => ({ boxShadow: `0 0 40px ${color}22, 0 0 80px ${color}11` });
const borderGlow = (color) => ({ boxShadow: `0 0 0 1px ${color}40, 0 0 30px ${color}18` });


// ═══════════════════════════════════════════════════════════════
//  SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── 01 NAVBAR ────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 40));
  }, [scrollY]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(7,9,16,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid rgba(255,255,255,0.06)` : "1px solid transparent",
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" style={{ textDecoration: "none" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.acc}, ${C.cyan})`, animation: "glow 3s ease infinite" }}
          >
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
              <path d="M4 4L16 10L4 16Z" fill="#070910" />
            </svg>
          </div>
          <span className="text-[17px] font-extrabold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            Cine<span style={{ color: C.acc }}>AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              className="px-3 py-2 text-sm rounded-lg transition-colors duration-150"
              style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.txt)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.txt2)}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/app/dashboard"
            className="hidden md:block text-sm px-4 py-2 rounded-lg transition-all duration-150"
            style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.txt)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.txt2)}
          >
            Log in
          </Link>
          <Link
            href="/app/dashboard"
            className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              background: C.acc,
              color: "#000",
              fontFamily: "'Outfit', sans-serif",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#cbff5c"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.acc; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Try Free
          </Link>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ background: C.surf2, border: `1px solid rgba(255,255,255,0.08)`, color: C.txt2 }}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: "rgba(7,9,16,0.97)", borderTop: `1px solid rgba(255,255,255,0.06)` }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                  className="px-3 py-2.5 text-sm rounded-lg"
                  style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}
                  onClick={() => setOpen(false)}
                >
                  {link}
                </a>
              ))}
              <Link
                href="/app/dashboard"
                className="mt-2 text-sm font-bold px-4 py-2.5 rounded-lg text-center"
                style={{ background: C.acc, color: "#000", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}
                onClick={() => setOpen(false)}
              >
                Try Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ─── 02 HERO ──────────────────────────────────────────────────
function Hero() {
  const [activeScene, setActiveScene] = useState(0);
  const sceneKeys = Object.keys(scenes);

  useEffect(() => {
    const t = setInterval(() => setActiveScene((i) => (i + 1) % sceneKeys.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      style={{ background: C.bg }}
    >
      {/* Background radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04]" style={{ background: `radial-gradient(circle, ${C.acc}, transparent 70%)` }} />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: `radial-gradient(circle, ${C.cyan}, transparent 70%)` }} />
        {/* Grain overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <filter id="lp-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#lp-grain)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-6"
              style={{ background: `${C.acc}18`, border: `1px solid ${C.acc}30`, color: C.acc, fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.acc }} />
              Now live — 6 AI models in one studio
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}
            >
              Generate{" "}
              <span
                className="relative"
                style={{
                  background: `linear-gradient(90deg, ${C.acc}, ${C.cyan})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                cinematic
              </span>
              <br />
              AI videos<br />
              in seconds.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg leading-relaxed mb-8 max-w-lg"
              style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}
            >
              Type a prompt. Pick Kling, Veo, Sora, Runway, or Luma. Download broadcast-quality 4K video — all from one studio, one subscription.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link
                href="/app/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{ background: C.acc, color: "#000", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#cbff5c"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${C.acc}40`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.acc; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Start Free Trial <ArrowRight size={15} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: C.surf2, color: C.txt, border: `1px solid rgba(255,255,255,0.08)`, fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <Play size={14} fill={C.txt} /> Watch Demo
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap gap-x-6 gap-y-2"
            >
              {STATS.slice(0, 4).map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="text-sm font-bold" style={{ color: C.acc, fontFamily: "'Outfit', sans-serif" }}>{s.val}</span>
                  <span className="text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Animated video grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Main featured scene */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: `1px solid rgba(255,255,255,0.1)`, ...glow(C.acc) }}
            >
              <div className="aspect-video relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScene}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    {scenes[sceneKeys[activeScene]]}
                  </motion.div>
                </AnimatePresence>
                {/* Overlay UI chrome */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }} />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold mb-0.5" style={{ color: C.acc, fontFamily: "'Outfit', sans-serif" }}>✓ Generated with CineAI</div>
                    <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'JetBrains Mono', monospace" }}>Kling 2.6 · 4K · 8s · 42 credits</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.acc }} />
                    <span className="text-[10px] font-bold" style={{ color: C.acc, fontFamily: "'Outfit', sans-serif" }}>LIVE</span>
                  </div>
                </div>
                {/* Scene selector dots */}
                <div className="absolute top-3 right-3 flex gap-1">
                  {sceneKeys.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScene(i)}
                      className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{ background: i === activeScene ? C.acc : "rgba(255,255,255,0.3)" }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mini scene strip */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {sceneKeys.slice(0, 3).map((key, i) => (
                <motion.div
                  key={key}
                  className="rounded-xl overflow-hidden cursor-pointer relative"
                  style={{
                    border: `1px solid ${activeScene === i ? `${C.acc}60` : "rgba(255,255,255,0.06)"}`,
                    transition: "border-color 0.2s",
                  }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setActiveScene(i)}
                >
                  <div className="aspect-video">{scenes[key]}</div>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
                  <div className="absolute bottom-1.5 left-2 text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {MODELS[i]?.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-[10px] tracking-widest uppercase" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown size={14} style={{ color: C.txt3 }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── 03 LOGO / TRUST BAR ─────────────────────────────────────
function LogoBar() {
  return (
    <section style={{ background: C.surf, borderTop: `1px solid rgba(255,255,255,0.05)`, borderBottom: `1px solid rgba(255,255,255,0.05)` }} className="py-5 overflow-hidden">
      <div className="flex items-center gap-8 mb-3">
        <div className="flex-shrink-0 pl-6">
          <p className="text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>Powered by</p>
        </div>
        {/* Marquee */}
        <div className="overflow-hidden flex-1">
          <motion.div
            className="flex gap-10 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, ease: "linear", repeat: Infinity }}
            style={{ width: "max-content" }}
          >
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: MODELS[i % MODELS.length]?.color || C.txt3 }} />
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>{logo}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── 04 HOW IT WORKS ─────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Sparkles,
      title: "Type your prompt",
      desc: "Describe your scene in plain English. Use our AI prompt enhancer to get better results automatically.",
      detail: "\"A golden retriever running through lavender fields at golden hour, slow-motion dolly shot, cinematic depth of field\"",
      color: C.acc,
    },
    {
      num: "02",
      icon: Cpu,
      title: "Pick your AI model",
      desc: "Choose from 6 world-class models. Each excels at different styles — motion, realism, speed, or length.",
      detail: "Kling 2.6 for motion · Veo 3.1 for audio · Sora 2 for physics · Runway for cinema",
      color: C.cyan,
    },
    {
      num: "03",
      icon: Download,
      title: "Download 4K video",
      desc: "Your video is ready in seconds to minutes. Download MP4, share a link, or use our API.",
      detail: "MP4 · ProRes · WebM · 720p to 4K Ultra · up to 2 minutes",
      color: C.vio,
    },
  ];

  return (
    <section id="how-it-works" className="py-28" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: `${C.cyan}18`, border: `1px solid ${C.cyan}30`, color: C.cyan, fontFamily: "'Outfit', sans-serif" }}>
            How it works
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            From idea to 4K in{" "}
            <span style={{ background: `linear-gradient(90deg, ${C.acc}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              three steps
            </span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>
            No video editing skills required. No subscriptions to 6 different platforms. Just results.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-[calc(16.66%-16px)] right-[calc(16.66%-16px)] h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.acc}40, ${C.cyan}40, ${C.vio}40, transparent)` }} />

          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.12}>
              <motion.div
                className="relative rounded-2xl p-6"
                style={{ background: C.surf, border: `1px solid rgba(255,255,255,0.06)` }}
                whileHover={{ y: -4, borderColor: `${step.color}40` }}
                transition={{ duration: 0.2 }}
              >
                {/* Step number */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}>
                    <step.icon size={18} style={{ color: step.color }} />
                  </div>
                  <span className="text-4xl font-black opacity-10 leading-none" style={{ color: step.color, fontFamily: "'Outfit', sans-serif" }}>{step.num}</span>
                </div>

                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>{step.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>{step.desc}</p>

                {/* Detail pill */}
                <div className="rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: C.surf3, color: C.txt2, fontFamily: "'JetBrains Mono', monospace", border: `1px solid rgba(255,255,255,0.04)` }}>
                  {step.detail}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 05 FEATURES BENTO ───────────────────────────────────────
function Features() {
  return (
    <section id="features" className="py-28" style={{ background: C.surf }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: `${C.acc}18`, border: `1px solid ${C.acc}30`, color: C.acc, fontFamily: "'Outfit', sans-serif" }}>
            Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            Everything you need to{" "}
            <span style={{ color: C.acc }}>go pro</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>
            Built for creators, agencies, and developers who need cinematic output without the workflow complexity.
          </p>
        </Reveal>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <motion.div
                className={`relative rounded-2xl p-6 overflow-hidden ${f.size === "large" ? "md:col-span-2 lg:col-span-1" : ""}`}
                style={{ background: C.bg, border: `1px solid rgba(255,255,255,0.06)`, minHeight: "180px" }}
                whileHover={{ y: -3, borderColor: `${f.color}40` }}
                transition={{ duration: 0.2 }}
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${f.color}, transparent)` }} />

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}18`, border: `1px solid ${f.color}25` }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 06 AI MODELS ────────────────────────────────────────────
function AIModels() {
  const [active, setActive] = useState(0);

  return (
    <section id="models" className="py-28" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: `${C.vio}18`, border: `1px solid ${C.vio}30`, color: C.vio, fontFamily: "'Outfit', sans-serif" }}>
            AI Models
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            6 world-class models.{" "}
            <span style={{ color: C.vio }}>One subscription.</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>
            Stop juggling separate accounts. Access every top AI video model through CineAI — the right model for every scene.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Model list */}
          <div className="flex flex-col gap-3">
            {MODELS.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.06}>
                <motion.div
                  className="rounded-xl p-4 cursor-pointer flex items-center gap-4"
                  style={{
                    background: active === i ? `${m.color}08` : C.surf,
                    border: `1px solid ${active === i ? `${m.color}40` : "rgba(255,255,255,0.06)"}`,
                    transition: "all 0.2s",
                  }}
                  onClick={() => setActive(i)}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: m.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>{m.name}</span>
                      {m.badge && (
                        <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${m.color}25`, color: m.color, fontFamily: "'Outfit', sans-serif" }}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{m.by} · {m.res}</div>
                  </div>
                  {/* Mini quality bar */}
                  <div className="hidden sm:flex flex-col gap-1 w-28">
                    {[{ label: "Quality", val: m.quality }, { label: "Speed", val: m.speed }].map((b) => (
                      <div key={b.label} className="flex items-center gap-2">
                        <div className="text-[9px] w-10 text-right" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{b.label}</div>
                        <div className="flex-1 h-1 rounded-full" style={{ background: C.surf3 }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: m.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${b.val}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold flex-shrink-0" style={{ color: active === i ? m.color : C.txt3, fontFamily: "'JetBrains Mono', monospace" }}>
                    {active === i ? "Active" : "Select"}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Preview panel */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${MODELS[active].color}40`, ...glow(MODELS[active].color) }}
                >
                  {/* Scene preview */}
                  <div className="aspect-video relative">
                    {scenes[MODELS[active].scene]}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-base font-extrabold mb-1" style={{ color: C.txt, fontFamily: "'Outfit', sans-serif" }}>{MODELS[active].name}</div>
                      <div className="text-xs" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>{MODELS[active].by} · {MODELS[active].res}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-5" style={{ background: C.surf }}>
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      {[{ label: "Quality", val: MODELS[active].quality }, { label: "Speed", val: MODELS[active].speed }, { label: "Realism", val: MODELS[active].realism }].map((b) => (
                        <div key={b.label}>
                          <div className="text-[10px] mb-1.5" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{b.label}</div>
                          <div className="h-1.5 rounded-full mb-1" style={{ background: C.surf3 }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: MODELS[active].color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${b.val}%` }}
                              transition={{ duration: 0.7 }}
                            />
                          </div>
                          <div className="text-xs font-bold" style={{ color: MODELS[active].color, fontFamily: "'JetBrains Mono', monospace" }}>{b.val}%</div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/app/dashboard"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                      style={{ background: MODELS[active].color, color: MODELS[active].color === C.acc ? "#000" : "#fff", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      Use {MODELS[active].name} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 07 DASHBOARD PREVIEW ────────────────────────────────────
function DashboardPreview() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [12, 0, 0, -8]);
  const scale   = useTransform(scrollYProgress, [0, 0.3], [0.9, 1]);
  const y       = useTransform(scrollYProgress, [0, 0.4], [40, 0]);

  const hotspots = [
    { x: "8%",  y: "18%", label: "6 AI Models",         desc: "Switch models instantly" },
    { x: "45%", y: "28%", label: "Prompt Studio",        desc: "AI-enhanced prompts" },
    { x: "72%", y: "52%", label: "Credit Tracker",       desc: "Real-time usage" },
    { x: "28%", y: "72%", label: "4K Video Grid",        desc: "All generations in one place" },
  ];

  return (
    <section ref={ref} className="py-28 overflow-hidden" style={{ background: C.surf }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}30`, color: C.gold, fontFamily: "'Outfit', sans-serif" }}>
            Product
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            See exactly{" "}
            <span style={{ color: C.gold }}>what you get</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>
            A production-grade studio — not a toy. Clean, fast, and built for serious creators.
          </p>
        </Reveal>

        {/* Dashboard mockup */}
        <motion.div
          style={{ rotateX, scale, y, perspective: 1200, transformStyle: "preserve-3d" }}
          className="relative mx-auto max-w-5xl"
        >
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ border: `1px solid rgba(255,255,255,0.1)`, ...glow(C.acc) }}
          >
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#0C0F18", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.rose }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.gold }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.acc }} />
              <div className="flex-1 mx-4 px-3 py-1 rounded-md text-[10px] text-center" style={{ background: "#070910", color: C.txt3, fontFamily: "'JetBrains Mono', monospace" }}>
                app.cineai.studio
              </div>
            </div>

            {/* Simulated dashboard UI */}
            <div className="flex" style={{ background: C.bg, minHeight: "420px" }}>
              {/* Sidebar strip */}
              <div className="w-12 flex-shrink-0 flex flex-col items-center gap-3 py-4" style={{ background: C.surf, borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                {[C.acc, C.txt3, C.txt3, C.txt3, C.txt3].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-lg" style={{ background: i === 0 ? `${c}18` : "transparent", border: i === 0 ? `1px solid ${c}40` : "none" }}>
                    <div className="w-full h-full rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div className="flex-1 p-4 overflow-hidden">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { val: "247", label: "Videos", color: C.acc },
                    { val: "2.3K", label: "Credits", color: C.cyan },
                    { val: "38m", label: "Runtime", color: C.gold },
                    { val: "4.8★", label: "Quality", color: C.vio },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg p-3" style={{ background: C.surf }}>
                      <div className="text-xs font-bold mb-0.5" style={{ color: s.color, fontFamily: "'Outfit', sans-serif" }}>{s.val}</div>
                      <div className="text-[9px]" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Video grid */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(scenes).slice(0, 6).map((k, i) => (
                    <div key={k} className="rounded-lg overflow-hidden relative" style={{ border: "1px solid rgba(255,255,255,0.06)", aspectRatio: "16/9" }}>
                      {scenes[k]}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                      <div className="absolute bottom-1 left-1.5">
                        <div className="text-[8px] font-bold" style={{ color: C.acc, fontFamily: "'JetBrains Mono', monospace" }}>✓ 4K</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hotspot annotations */}
            {hotspots.map((h, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: h.x, top: h.y }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 + 0.3 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center cursor-pointer" style={{ background: C.acc, boxShadow: `0 0 0 4px ${C.acc}30` }}>
                    <span className="text-[9px] font-black" style={{ color: "#000", fontFamily: "'Outfit', sans-serif" }}>{i + 1}</span>
                  </div>
                  <div className="absolute left-6 top-0 whitespace-nowrap px-2 py-1 rounded-lg text-[10px]" style={{ background: C.surf, border: `1px solid rgba(255,255,255,0.1)`, color: C.txt }}>
                    <div className="font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{h.label}</div>
                    <div style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>{h.desc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 08 TESTIMONIALS ─────────────────────────────────────────
function Testimonials() {
  return (
    <section className="py-28" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: `${C.rose}18`, border: `1px solid ${C.rose}30`, color: C.rose, fontFamily: "'Outfit', sans-serif" }}>
            Testimonials
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            Loved by{" "}
            <span style={{ color: C.rose }}>12,000+ creators</span>
          </h2>
        </Reveal>

        {/* Stats bar */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-8 mb-14">
            {[{ val: "4.9★", label: "Average rating" }, { val: "12,000+", label: "Active creators" }, { val: "1M+", label: "Videos generated" }, { val: "98%", label: "Satisfaction score" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold mb-0.5" style={{ color: C.acc, fontFamily: "'Outfit', sans-serif" }}>{s.val}</div>
                <div className="text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Featured testimonial */}
        <Reveal delay={0.05}>
          <div className="rounded-2xl p-8 mb-6 relative overflow-hidden" style={{ background: C.surf, border: `1px solid rgba(255,255,255,0.08)`, ...borderGlow(C.acc) }}>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]" style={{ background: `radial-gradient(circle, ${C.acc}, transparent)` }} />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black" style={{ background: `${C.acc}25`, color: C.acc, fontFamily: "'Outfit', sans-serif" }}>
                {TESTIMONIALS[0].initials}
              </div>
              <div>
                <div className="flex gap-0.5 mb-3">
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill={C.acc} style={{ color: C.acc }} />)}
                </div>
                <p className="text-lg leading-relaxed mb-4" style={{ color: C.txt, fontFamily: "'Outfit', sans-serif" }}>"{TESTIMONIALS[0].text}"</p>
                <div>
                  <div className="text-sm font-bold" style={{ color: C.txt, fontFamily: "'Outfit', sans-serif" }}>{TESTIMONIALS[0].name}</div>
                  <div className="text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{TESTIMONIALS[0].role}</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.slice(1).map((t, i) => (
            <Reveal key={t.name} delay={i * 0.07}>
              <motion.div
                className="rounded-xl p-5"
                style={{ background: C.surf, border: "1px solid rgba(255,255,255,0.06)" }}
                whileHover={{ y: -3, borderColor: `${t.color}40` }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: `${t.color}20`, color: t.color, fontFamily: "'Outfit', sans-serif" }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: C.txt, fontFamily: "'Outfit', sans-serif" }}>{t.name}</div>
                    <div className="text-[11px]" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array(5).fill(0).map((_, j) => <Star key={j} size={11} fill={C.gold} style={{ color: C.gold }} />)}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>"{t.text}"</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 09 PRICING ──────────────────────────────────────────────
function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-28" style={{ background: C.surf }}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: `${C.acc}18`, border: `1px solid ${C.acc}30`, color: C.acc, fontFamily: "'Outfit', sans-serif" }}>
            Pricing
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            Simple, transparent pricing.{" "}
            <span style={{ color: C.acc }}>No surprises.</span>
          </h2>
          <p className="text-base max-w-xl mx-auto mb-6" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>
            Compare to hiring a video editor at $500+ per video. CineAI pays for itself on day one.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-full" style={{ background: C.bg, border: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
              style={{ background: !annual ? C.acc : "transparent", color: !annual ? "#000" : C.txt2, fontFamily: "'Outfit', sans-serif" }}
              onClick={() => setAnnual(false)}
            >Monthly</button>
            <button
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
              style={{ background: annual ? C.acc : "transparent", color: annual ? "#000" : C.txt2, fontFamily: "'Outfit', sans-serif" }}
              onClick={() => setAnnual(true)}
            >
              Annual <span className="ml-1 opacity-70">−20%</span>
            </button>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1}>
              <motion.div
                className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
                style={{
                  background: plan.featured ? `${C.acc}06` : C.bg,
                  border: `1px solid ${plan.featured ? `${C.acc}40` : "rgba(255,255,255,0.07)"}`,
                  ...(plan.featured ? glow(C.acc) : {}),
                }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg text-[10px] font-black tracking-widest uppercase" style={{ background: C.acc, color: "#000", fontFamily: "'Outfit', sans-serif" }}>
                    Most Popular
                  </div>
                )}

                <div className="mb-5" style={{ marginTop: plan.featured ? "16px" : 0 }}>
                  <div className="text-lg font-extrabold mb-1" style={{ color: plan.color, fontFamily: "'Outfit', sans-serif" }}>{plan.name}</div>
                  <div className="text-xs mb-4" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{plan.tag}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-sm" style={{ color: C.txt2, fontFamily: "'JetBrains Mono', monospace" }}>$</span>
                    <span className="text-5xl font-black tracking-tight" style={{ color: C.txt, fontFamily: "'Outfit', sans-serif" }}>
                      {annual ? plan.annual : plan.monthly}
                    </span>
                    <span className="text-sm" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>/mo</span>
                  </div>
                  <div className="text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>
                    {plan.credits} credits / month
                    {annual && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: `${C.acc}18`, color: C.acc }}>billed annually</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                      <span className="text-sm leading-snug" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/app/dashboard"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: plan.featured ? C.acc : C.surf2,
                    color: plan.featured ? "#000" : C.txt,
                    border: plan.featured ? "none" : `1px solid rgba(255,255,255,0.1)`,
                    fontFamily: "'Outfit', sans-serif",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { if (!plan.featured) e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
                  onMouseLeave={(e) => { if (!plan.featured) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  {plan.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Guarantee strip */}
        <Reveal delay={0.2}>
          <div className="mt-10 rounded-xl py-4 px-6 flex flex-wrap items-center justify-center gap-6 text-sm" style={{ background: C.bg, border: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { icon: Shield, text: "14-day free trial — no card required" },
              { icon: Zap,    text: "Cancel anytime, no questions asked" },
              { icon: Globe,  text: "You own 100% of your generated videos" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>
                <item.icon size={14} style={{ color: C.acc }} />
                {item.text}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── 10 FAQ ──────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="py-28" style={{ background: C.bg }}>
      <div className="max-w-3xl mx-auto px-6">
        <Reveal className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: `${C.cyan}18`, border: `1px solid ${C.cyan}30`, color: C.cyan, fontFamily: "'Outfit', sans-serif" }}>
            FAQ
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            Everything you need to know
          </h2>
        </Reveal>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <motion.div
                className="rounded-xl overflow-hidden"
                style={{ background: C.surf, border: `1px solid ${open === i ? `${C.acc}30` : "rgba(255,255,255,0.06)"}`, transition: "border-color 0.2s" }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-sm font-semibold" style={{ color: C.txt, fontFamily: "'Outfit', sans-serif" }}>{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} style={{ color: open === i ? C.acc : C.txt3, flexShrink: 0 }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA BANNER ────────────────────────────────────────
function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: C.surf }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${C.acc}, transparent)` }} />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
            Start generating in{" "}
            <span style={{ color: C.acc }}>60 seconds</span>
          </h2>
          <p className="text-base mb-8" style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif" }}>
            No credit card required. 1,500 free credits on sign-up. Cancel anytime.
          </p>

          {!submitted ? (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: C.bg, color: C.txt,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  fontFamily: "'Outfit', sans-serif",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = `${C.acc}50`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              <button
                onClick={() => email && setSubmitted(true)}
                className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 justify-center"
                style={{ background: C.acc, color: "#000", fontFamily: "'Outfit', sans-serif" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#cbff5c"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.acc; }}
              >
                Get Early Access <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ color: C.acc, fontFamily: "'Outfit', sans-serif" }}
            >
              <Check size={16} /> You're on the list! We'll be in touch shortly.
            </motion.div>
          )}

          <p className="mt-4 text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>
            No spam. Unsubscribe anytime. Used by 12,000+ creators worldwide.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────
function Footer() {
  const links = {
    Product: ["Features", "AI Models", "Storyboard", "API", "Changelog"],
    Company:  ["About", "Blog", "Careers", "Press"],
    Support:  ["Documentation", "Help Center", "Status", "Contact"],
    Legal:    ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer style={{ background: C.bg, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.acc}, ${C.cyan})` }}>
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><path d="M4 4L16 10L4 16Z" fill="#070910" /></svg>
              </div>
              <span className="text-[17px] font-extrabold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: C.txt }}>
                Cine<span style={{ color: C.acc }}>AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>
              The AI video studio for creators, agencies, and developers who need cinematic quality without the complexity.
            </p>
            <div className="text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>
              © 2026 CineAI · All rights reserved
            </div>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>{group}</div>
              <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: C.txt2, fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = C.acc; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C.txt2; }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>
            <span>Built with Kling 2.6 · Veo 3.1 · Sora 2 · Runway Gen-4.5 · Luma Ray3 · Pika 2.2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.acc }} />
            <span className="text-xs" style={{ color: C.txt3, fontFamily: "'Outfit', sans-serif" }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOT PAGE EXPORT
// ═══════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <main style={{ background: C.bg, fontFamily: "'Outfit', sans-serif" }}>
      <Navbar />
      <Hero />
      <LogoBar />
      <HowItWorks />
      <Features />
      <AIModels />
      <DashboardPreview />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
