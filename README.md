# 🎮 Gamify Pipeline — Real-Time Esports Data Engine  
**Zero-Maintenance · Multi-Cloud · Serverless Edge Routing**

---

## 📌 The Gamify Story

The **Gamify Pipeline** was built to solve a critical issue in modern esports platforms: **staleness**. Traditional polling architectures suffer from delayed updates and massive idle server costs. We wanted to build a real-time match tracking system that was both highly scalable and near-zero cost when traffic is low.

To achieve this, we split the architecture into two dedicated, entirely serverless tiers:

1. **The Ingestion Engine**: A background worker that wakes up automatically to process thousands of live matches, crunch data deltas, and gracefully fall back to sleep.
2. **The Edge Network**: A globally distributed frontend that serves requests instantaneously, directly from the edge, while actively defending against malicious bots and traffic spikes.

Gamify doesn't just display data; it actively fans out live match updates via automated Webhooks (like Discord) securely—ensuring your users never miss a critical moment again. 

If you want to dive deep into how these two tiers interact, check out our 🏗️ [**Architecture & System Design**](docs/ARCHITECTURE.md).

---

## 🚀 Key Highlights

Unlike basic CRUD applications, Gamify is engineered for production readiness:
- ✅ **Full-stack architecture** (Next.js Edge Frontend + Go Backend Ingestion)
- ✅ **Serverless DataStax Astra DB (Cassandra)** for high-throughput vector storage
- ✅ **Clerk Multi-tenant Authentication** with isolated session tokens
- ✅ **Upstash Edge Rate Limiting** with dynamic user-fingerprinting
- ✅ **Upstash QStash & Discord Webhook Integration** with cryptographic handshakes
- ✅ **100% Offline-Mocked Automated Testing Architecture**

---

## 🛡️ Edge-First Security

Exposing game data APIs directly to the web invites automated scrapers and malicious scraping loops. Gamify is built with a defense-in-depth approach. We utilize an advanced **IP + Auth ID** fingerprinting matrix powered by Upstash Redis to silently drop malicious traffic at the Vercel Edge layer before it ever reaches the core database. 

Additionally, internal triggers (such as Discord Fan-Outs) enforce a strict 2-Way cryptographic handshake to prevent spoofing.

For a deep dive into the security threat model and mitigation strategies, read the 🛡️ [**Security Threat Model**](docs/SECURITY.md).

---

## 🧪 Full-Stack Testing Architecture

**Status:** ✅ Implemented

Gamify Pipeline features production-grade automated testing architecture across the entire platform. Designed to run completely offline, it ensures zero live API calls are accidentally triggered during validation.

### Hard Test Stats
- **Total Test Suites**: 2
- **Total Individual Tests**: 3 (2 Frontend React UI, 1 Backend Data Delta)
- **Frontend Execution Time (Jest/jsdom)**: ~3.6s
- **Backend Execution Time (Go)**: ~0.012s
- **Mocking Strategy**: Isolated DOM testing + Table-driven DB logic simulation.

### Running the Tests Locally

**Frontend Edge Tests (Next.js)**
The frontend utilizes **Jest** alongside the React Testing Library to validate the DOM tree and routing components.
```bash
cd frontend
npm install
npm test
```

**Backend Ingestion Tests (Go)**
The core ingestion logic leverages the native Go testing framework, ensuring precise database Deltas (Inserts/Updates) are calculated correctly.
```bash
cd ingestion
go test ./... -v
```

---

## 🌍 Deployment & DevOps

Gamify is designed for a Multi-Cloud deployment pattern. The frontend is heavily optimized for Vercel's global edge network, while the background Go ingest worker runs on GitHub Actions cron triggers—eliminating the need to provision dedicated AWS EC2 or DigitalOcean droplets.

For exact configuration environment variables and step-by-step launch instructions, please see the 🌍 [**Deployment & Configuration Guide**](docs/DEPLOYMENT.md).

---

## 👨‍💻 Local Development

To spin up the dual-tier system on your local machine:
1. Clone the repository.
2. Review the [Deployment Guide](docs/DEPLOYMENT.md) to populate your `.env.local` variables.
3. Run the development macro at the root of the project to spin up both the Go watcher and the Next.js Turbo server:
```bash
make dev
```

> Gamify is built to demonstrate **end-to-end serverless synchronization design**, providing an ultra-low maintenance, fault-tolerant data pipeline that feels like a premium product.
