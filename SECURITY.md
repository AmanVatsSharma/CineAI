# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CineAI, please report it responsibly.

**Do not** open a public GitHub Issue for security vulnerabilities.

Instead, email us at **security@cineai.studio** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

We aim to acknowledge reports within 24 hours and provide a timeline for remediation. We follow a coordinated disclosure process and will credit researchers who report valid vulnerabilities (unless anonymity is requested).

## Security Scans

This repository has automated secret scanning and dependency vulnerability scanning enabled via GitHub:
- **Secret scanning** — detects accidental secret commits and blocks pushes containing credentials
- **Dependency review** — runs on every PR and flags vulnerable dependencies before merge
- **CodeQL** — static analysis for security vulnerabilities in the TypeScript and Python codebases

## Security Best Practices for Contributions

When contributing code:
- Never commit secrets, API keys, or credentials — use environment variables
- All API keys referenced in the codebase must be placeholder values (e.g., `YOUR_API_KEY`)
- Use the `.env.example` pattern for required environment variables
- Auth middleware and token handling is currently a stub — real implementation must follow OWASP guidelines before production use

## Authentication & Sessions

Currently implemented as a **mock** (`libs/api-client/src/mock-client.ts`). Before Phase 3 ships:
- Real auth must use a proven provider (Clerk or Auth.js as planned)
- JWT sessions must use `httpOnly`, `secure`, `sameSite` cookies
- CSRF protection is required for all mutating endpoints
- Rate limiting must be enforced per-user, not per-IP
