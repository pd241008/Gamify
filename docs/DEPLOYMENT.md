# 🌍 Gamify Pipeline — Deployment Strategy
**Vercel · GitHub Actions · Multi-Cloud Architecture**

---

## 📌 Overview

The Gamify pipeline relies on a distributed multi-cloud setup. The infrastructure is stateless, fully serverless, and isolated into two core deployments: the Edge Frontend and the Background Worker.

---

## 🚀 Frontend Deployment (Vercel)

**Status:** ✅ Ready

The Next.js frontend is designed to be hosted on Vercel for native Edge computing capabilities and seamless integration with Turbopack.

### Prerequisites
- Create a Vercel Project and link it to your GitHub Repository.
- Configure the Root Directory to `frontend`.

### Environment Variables
Configure the following in the Vercel Dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `API_BASE_URL` (Set this to your production Next.js domain)

---

## ⚙️ Backend Worker Deployment (GitHub Actions)

**Status:** 🚧 Pending Workflow Setup

The Go backend logic is executed seamlessly via a GitHub Actions Cron Job, acting as a serverless worker container.

### Prerequisites
- Add your secrets to the GitHub Repository (`Settings > Secrets and variables > Actions`).

### Environment Variables
Configure the following Repository Secrets:
- `PANDASCORE_TOKEN`
- `ASTRA_DB_ID`
- `ASTRA_DB_REGION`
- `ASTRA_DB_TOKEN`
- `ASTRA_KEYSPACE`
- `QSTASH_TOKEN`
- `DISCORD_WEBHOOK_URL`

### Execution
When configured, the `.github/workflows/ingest.yml` script will trigger automatically (e.g. every 5 minutes), downloading the Go module dependencies, compiling the worker, and pushing new matches directly into the Astra database and QStash event broker.

---

## 🗄️ Database Provisioning

- **DataStax Astra**: Create a Vector database instance. Generate a Token (with Database Administrator roles) to use for your application secrets.
- **Upstash Redis**: Create a new Redis database for the frontend Edge Rate Limiting.
- **Upstash QStash**: Create a QStash account and generate an API key for routing Discord webhooks securely.
