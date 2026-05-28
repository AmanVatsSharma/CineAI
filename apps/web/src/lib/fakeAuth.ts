const KEY = "cineai.session";

export interface Session {
  token: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "studio";
  createdAt: string;
}

function fakeJwt(email: string) {
  const payload = btoa(JSON.stringify({ sub: email, iat: Date.now() }));
  return `demo.${payload}.${Math.random().toString(36).slice(2, 10)}`;
}

export async function fakeLogin(email: string, _password: string): Promise<Session> {
  await new Promise((r) => setTimeout(r, 800));
  const name = email.split("@")[0].replace(/[.\-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "User";
  const session: Session = {
    token: fakeJwt(email),
    name,
    email,
    plan: "pro",
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export async function fakeSignup(name: string, email: string, password: string): Promise<Session> {
  await new Promise((r) => setTimeout(r, 1000));
  const session: Session = {
    token: fakeJwt(email),
    name: name || email.split("@")[0],
    email,
    plan: "pro",
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
