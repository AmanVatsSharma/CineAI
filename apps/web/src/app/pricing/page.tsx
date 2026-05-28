"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Crown, ArrowRight } from "lucide-react";
import { Reveal } from "@cineai/ui";

type Cycle = "monthly" | "yearly";

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    accent: "var(--cyan)",
    blurb: "Everything you need to explore AI video.",
    monthly: 0,
    yearly: 0,
    credits: "500 credits / mo",
    cta: "Start free",
    features: [
      "500 credits / month",
      "Up to 720p HD",
      "All 7 AI models",
      "5 sec clips",
      "Watermark on export",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    accent: "var(--acc)",
    featured: true,
    blurb: "For creators shipping real work.",
    monthly: 29,
    yearly: 290,
    credits: "6,000 credits / mo",
    cta: "Start 14-day trial",
    features: [
      "6,000 credits / month",
      "Up to 4K Ultra",
      "All 7 AI models",
      "30 sec clips",
      "No watermark",
      "Priority queue",
      "Commercial license",
      "API access (10k req/mo)",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    icon: Crown,
    accent: "var(--vio)",
    blurb: "Team seats, custom models, SLAs.",
    monthly: 99,
    yearly: 990,
    credits: "25,000 credits / mo",
    cta: "Talk to sales",
    features: [
      "25,000 credits / month",
      "8K resolution",
      "Custom LoRA training",
      "60 sec clips",
      "5 team seats",
      "Dedicated GPU pool",
      "SSO + audit logs",
      "Unlimited API access",
      "99.9% SLA",
    ],
  },
];

const FAQS = [
  {
    q: "What is a credit?",
    a: "Credits meter compute time. A 5 sec 1080p clip on Pika costs ~25 credits; a 15 sec 4K on Sora ~150. You'll see the live cost before you render.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes — upgrade, downgrade, or cancel any time. Prorated instantly. Unused credits roll over for 30 days.",
  },
  {
    q: "Do I own the videos I generate?",
    a: "You own everything you create on Pro and Studio tiers, with a full commercial license. Starter has a non-commercial watermark.",
  },
  {
    q: "Which models are included?",
    a: "All tiers get Kling 2.6, Veo 3.0, Runway Gen-4.5, Luma Ray3, Sora 2, Pika 3.0, and Hailuo 2. Pro & Studio skip the queue.",
  },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--t1)", fontFamily: "var(--f)" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(7,9,16,.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--b1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,var(--acc),var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 20 20" width={14} height={14}><path d="M4 4 L16 10 L4 16 Z" fill="#070910" /></svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.5px" }}>Cine<em style={{ color: "var(--acc)", fontStyle: "normal" }}>AI</em></span>
          </Link>
          <nav style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 13 }}>
            <Link href="/" style={{ color: "var(--t2)", textDecoration: "none" }}>Home</Link>
            <Link href="/pricing" style={{ color: "var(--acc)", textDecoration: "none", fontWeight: 600 }}>Pricing</Link>
            <Link href="/login" style={{ color: "var(--t2)", textDecoration: "none" }}>Log in</Link>
            <Link href="/signup" style={{ padding: "8px 16px", borderRadius: 10, background: "var(--acc)", color: "#070910", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>
              Start free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 48px", textAlign: "center" }}>
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "rgba(184,255,62,.08)", border: "1px solid rgba(184,255,62,.2)", fontSize: 11, fontWeight: 700, color: "var(--acc)", letterSpacing: ".5px", marginBottom: 20 }}>
            <Sparkles size={12} /> SIMPLE, TRANSPARENT PRICING
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05, margin: "0 0 16px" }}>
            Pick the plan that<br />
            <span style={{ color: "var(--acc)" }}>ships your vision</span>.
          </h1>
          <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Every plan includes all 7 AI video models. Upgrade when you need more credits, higher resolutions, or a team.
          </p>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", padding: 4, borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--b1)" }}>
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                style={{
                  position: "relative",
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: cycle === c ? "var(--surf3)" : "transparent",
                  color: cycle === c ? "var(--t1)" : "var(--t3)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--f)",
                  transition: "all .2s",
                }}
              >
                {c === "monthly" ? "Monthly" : "Yearly"}
                {c === "yearly" && (
                  <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(184,255,62,.15)", color: "var(--acc)", fontWeight: 700 }}>
                    −17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Tiers */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {TIERS.map((t, i) => {
            const price = cycle === "monthly" ? t.monthly : Math.round(t.yearly / 12);
            const TierIcon = t.icon;
            return (
              <Reveal key={t.id} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: "relative",
                    padding: 28,
                    borderRadius: 20,
                    background: t.featured ? "linear-gradient(180deg,rgba(184,255,62,.06),var(--surf))" : "var(--surf)",
                    border: `1px solid ${t.featured ? "rgba(184,255,62,.3)" : "var(--b1)"}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {t.featured && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", borderRadius: 999, background: "var(--acc)", color: "#070910", fontSize: 10, fontWeight: 800, letterSpacing: ".5px" }}>
                      MOST POPULAR
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${t.accent}15`, border: `1px solid ${t.accent}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TierIcon size={18} color={t.accent} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{t.name}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 20, minHeight: 36 }}>{t.blurb}</div>

                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-1.5px" }}>${price}</span>
                    <span style={{ fontSize: 14, color: "var(--t3)", marginLeft: 4 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t4)", fontFamily: "var(--font-mono)", marginBottom: 20 }}>
                    {cycle === "yearly" && t.monthly > 0 ? `billed $${t.yearly}/yr` : t.credits}
                  </div>

                  <Link
                    href={t.id === "studio" ? "/signup?plan=studio" : "/signup"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: t.featured ? "var(--acc)" : "var(--surf2)",
                      color: t.featured ? "#070910" : "var(--t1)",
                      border: t.featured ? "none" : "1px solid var(--b1)",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      marginBottom: 24,
                    }}
                  >
                    {t.cta} <ArrowRight size={14} />
                  </Link>

                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {t.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--t2)" }}>
                        <Check size={14} color={t.accent} style={{ flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 96px" }}>
        <Reveal>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: "-1px" }}>
            Questions, <span style={{ color: "var(--acc)" }}>answered</span>.
          </h2>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <details style={{ padding: 20, borderRadius: 14, background: "var(--surf)", border: "1px solid var(--b1)" }}>
                <summary style={{ fontSize: 15, fontWeight: 600, cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {f.q}
                  <span style={{ color: "var(--acc)", fontSize: 20 }}>+</span>
                </summary>
                <p style={{ marginTop: 12, fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
