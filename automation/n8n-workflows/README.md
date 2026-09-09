# ST-Solutions Production n8n Automation & Email Notification Architecture

This directory contains production-ready n8n workflow blueprints, webhook signature verification nodes, and operational documentation for the **ST-Solutions Enterprise Platform**.

---

## 1. Architectural Overview

```
[ Visitor / Client / Applicant ]
               │
               ▼
[ ST-Solutions Express/TypeScript API ] ──(Persist)──► [ PostgreSQL ]
               │                                      (Single Source of Truth)
               │ (HMAC-SHA256 Signed Outbox Dispatch)
               ▼
[ n8n Webhook Ingestion Engine ]
   ├── Signature & Timestamp Validation (HMAC-SHA256)
   ├── Routing Switch (Event Name)
   ├── Email Notification Dispatchers:
   │     ├── Admin Alerts (Internal Team)
   │     └── Client/Applicant Confirmations (External)
   └── Status Callback -> POST /api/v1/automation/callback
```

### Core Security Guarantees
1. **Frontend Isolation**: The frontend **never** connects directly to n8n.
2. **Authoritative Persistence**: PostgreSQL is the single source of truth. All submissions are saved in the database before external triggers occur.
3. **Resilience & Non-Blocking Execution**: n8n latency, network dropouts, or worker downtime **never** block visitor responses.
4. **Cryptographic Integrity**: Every outbound payload includes an `X-ST-Signature` HMAC-SHA256 header.
5. **Replay Protection**: The platform checks `X-ST-Timestamp` with an expiration window.

---

## 2. Environment Variables Configuration

In `apps/api/.env` (or production environment variables):

```env
# n8n Automation & Webhook Integration
N8N_BASE_URL="http://localhost:5678"
N8N_WEBHOOK_SECRET="your-32-character-secure-hmac-secret-here"
N8N_WEBHOOK_TIMEOUT_MS=5000
N8N_ENABLED=true
ADMIN_NOTIFICATION_EMAIL="admin@st-solutions.com"
```

---

## 3. Supported Domain Automation Events

| Event Name | Source Trigger | n8n Actions |
|---|---|---|
| `contact.message.received` | `POST /api/v1/contact`<br>`POST /api/v1/client-requests` | 1. Admin Alert Email<br>2. Customer Confirmation Email |
| `project_inquiry.created` | `POST /api/v1/public/project-inquiries` | 1. Urgent Lead Alert to Admin<br>2. Client Project Receipt & Next Steps |
| `member_application.submitted` | `POST /api/v1/applicants` | 1. Hiring Team Alert<br>2. Candidate Receipt Confirmation |
| `member_application.approved` | `POST /api/v1/applicants/:id/approve` | Candidate Onboarding & Welcome Email |
| `member_application.rejected` | `POST /api/v1/applicants/:id/reject` | Polite, Respectful Status Update |
| `marketing.subscriber.added` | `POST /api/v1/newsletter/subscribe` | Welcome & Newsletter Subscription Confirmation |
| `system.test.dispatched` | `POST /api/v1/automation/test` | End-to-End Connectivity Verification Ping |

---

## 4. Inbound Callback Endpoint

Once n8n completes delivery or catches a bounce, it reports back to:
- `POST /api/v1/automation/callback` (or `/api/v1/webhooks/n8n`)

### Callback Payload Format
```json
{
  "deliveryId": "uuid-from-x-st-delivery-id",
  "status": "DELIVERED",
  "providerMessageId": "smtp_msg_12345",
  "responseCode": 200,
  "deliveredAt": "2026-09-08T12:00:00.000Z"
}
```

---

## 5. Admin API Endpoints

- `GET /api/v1/automation/status` — Retrieves configuration health and delivery stats.
- `GET /api/v1/automation/logs` — Paginated delivery audit logs.
- `POST /api/v1/automation/test` — Dispatches a live test event to n8n.
