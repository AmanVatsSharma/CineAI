import type { Brand, CheckRequest, CheckResponse, Finding, GuardianReport } from "@cineai/domain-types";

/**
 * Demo-mode subset of the Python Brand Guardian (apps/agents/src/brands/guardian.py):
 * banned words, preferred terms, required disclaimers, exclamation overuse.
 * Channel limits and visual-prompt checks only run against the real service.
 */

const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const termRe = (t: string) => new RegExp(`(?<!\\w)${esc(t)}(?!\\w)`, "i");
const termReG = (t: string) => new RegExp(`(?<!\\w)${esc(t)}(?!\\w)`, "gi");

function report(findings: Finding[]): GuardianReport {
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  return { passed: errors === 0, score: Math.max(0, 100 - 25 * errors - 8 * warnings), findings };
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:])\s*([.!?])/g, "$2")
    .trim();
}

function checkText(brand: Brand, text: string): GuardianReport {
  const v = brand.voice;
  const findings: Finding[] = [];
  for (const word of [...v.bannedWords, ...brand.competitors]) {
    const m = termRe(word).exec(text);
    if (!m) continue;
    const competitor = brand.competitors.includes(word);
    findings.push({
      code: competitor ? "competitor_mention" : "banned_word",
      severity: "error",
      message: competitor
        ? `Competitor "${m[0]}" must not appear in brand copy.`
        : `"${m[0]}" is banned by the brand voice guide.`,
      excerpt: m[0],
      suggestion: competitor ? "Remove the competitor reference." : "Remove it or rephrase.",
    });
  }
  for (const [avoid, use] of Object.entries(v.preferredTerms)) {
    const m = termRe(avoid).exec(text);
    if (m) {
      findings.push({
        code: "preferred_term", severity: "warning", excerpt: m[0],
        message: `Brand prefers "${use}" over "${m[0]}".`, suggestion: `Use "${use}".`,
      });
    }
  }
  for (const rule of v.disclaimers) {
    const triggered = rule.triggerTerms.some((t) => termRe(t).test(text));
    if (triggered && !text.toLowerCase().includes(rule.text.toLowerCase())) {
      findings.push({
        code: "missing_disclaimer", severity: "error", excerpt: null,
        message: "Required disclaimer is missing.", suggestion: `Add: "${rule.text}"`,
      });
    }
  }
  if ((text.match(/!/g) ?? []).length > v.maxExclamations) {
    findings.push({
      code: "exclamation_overuse", severity: "warning", excerpt: null,
      message: `More than ${v.maxExclamations} exclamation mark(s); brand tone is measured.`,
      suggestion: "Replace extras with full stops.",
    });
  }
  return report(findings);
}

function revise(brand: Brand, input: string): string {
  const v = brand.voice;
  let text = input;
  for (const [avoid, use] of Object.entries(v.preferredTerms)) {
    text = text.replace(termReG(avoid), (m) => (/^[A-Z]/.test(m) ? use[0].toUpperCase() + use.slice(1) : use));
  }
  for (const word of [...v.bannedWords, ...brand.competitors]) text = text.replace(termReG(word), "");
  text = tidy(text);
  let bangs = 0;
  text = text.replace(/!+/g, () => (++bangs <= v.maxExclamations ? "!" : "."));
  for (const rule of v.disclaimers) {
    const triggered = rule.triggerTerms.some((t) => termRe(t).test(text));
    if (triggered && !text.toLowerCase().includes(rule.text.toLowerCase())) text = `${text} ${rule.text}`;
  }
  return tidy(text);
}

export function mockCheck(brand: Brand, req: CheckRequest): CheckResponse {
  if (req.text == null && req.visualPrompt == null) throw new Error("Provide text and/or visualPrompt");
  return {
    textReport: req.text != null ? checkText(brand, req.text) : null,
    revisedText: req.text != null ? revise(brand, req.text) : null,
    visualReport:
      req.visualPrompt != null
        ? report(
            brand.visual.avoidVisuals
              .filter((t) => termRe(t).test(req.visualPrompt as string))
              .map((t) => ({
                code: "avoid_visual", severity: "error" as const, excerpt: t,
                message: `"${t}" is on the brand's do-not-show list.`, suggestion: "Remove it from the prompt.",
              }))
          )
        : null,
  };
}
