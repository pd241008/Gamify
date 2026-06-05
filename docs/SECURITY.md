# 🛡️ Gamify Pipeline — Security Threat Model
**IP + Auth Fingerprinting · Webhook Verification · Data Isolation**

---

## 📌 Overview

The Gamify pipeline uses an advanced edge-first security model. By isolating heavy compute on backend Cron workers, the public-facing API acts purely as a routing layer, guarded by deep fingerprinting protocols.

---

## 🔐 Multi-Tenant Authentication & Route Protection

**Status:** ✅ Implemented

- We leverage **Clerk** to handle user identities safely.
- No direct authentication state is handled by our backend servers.
- Both `/matches` and `/settings` routes are locked behind `auth.protect()` server-side to guarantee users cannot sniff data payloads without valid session tokens.

---

## 🛑 Upstash Edge Rate Limiting

**Status:** ✅ Implemented

Next.js `middleware.ts` acts as the first line of defense to prevent DDOS and database exhaustion attacks.
- We utilize an **Upstash Redis** sliding window algorithm (`20 requests per 10 seconds`).
- The rate limiter generates a dynamic identity fingerprint: `IP_ADDRESS + CLERK_USER_ID`. 
- If a user is not authenticated, the script isolates them purely by IP. If they are authenticated, their specific user account is bounded.
- This entirely protects the Astra DB instance from automated scraping bots and prevents unexpected bandwidth billing overages.

---

## 🤝 2-Way Webhook Handshake Verification

**Status:** ✅ Implemented

To ensure malicious actors cannot spoof Discord notifications or internal triggers:
- Upstash QStash requires cryptographic signature verification on all webhook ingestion endpoints (`/api/webhook`).
- Every payload receives an `Upstash-Signature` header that our Next.js API validates using the private `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY`.
- Invalid webhook invocations are instantly dropped with HTTP 400 Bad Request.

---

## 🔒 Private Environment Keys

**Status:** ✅ Implemented

- Sensitive keys (`CLERK_SECRET_KEY`, `API_BASE_URL`) do not use the `NEXT_PUBLIC_` prefix, guaranteeing they are never bundled with the client JavaScript files and run exclusively on the Vercel edge node.
