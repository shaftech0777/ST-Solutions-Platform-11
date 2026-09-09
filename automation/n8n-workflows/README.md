# ST-Solutions Enterprise n8n Automation Engine

This directory contains production-ready, exportable n8n workflow definitions for the **ST-Solutions Platform**.

## Architectural Overview

The integration uses a **Transactional Outbox Pattern** with **Canonical HMAC-SHA256 Signatures**:

```
[Public Website / Admin Console]
              ↓
  [ST-Solutions Backend API]
              ↓
   [PostgreSQL (Outbox Log)]  ← (PENDING / PROCESSING)
              ↓
    [Secure n8n Webhook]      ← (Signed: X-ST-Signature, X-ST-Timestamp, X-ST-Delivery-Id)
              ↓
        [n8n Workflow]
              ↓
 [Email Provider / SMTP / SES]
              ↓
    [Signed Inbound Callback] → [POST /api/v1/automation/callback]
              ↓
   [PostgreSQL (Outbox Log)]  ← (DELIVERED / ACCEPTED_BY_N8N / FAILED)
```

---

## 1. Required Configuration

### A. ST-Solutions Platform (`.env`)

Configure the following variables in your platform environment:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `N8N_ENABLED` | Master feature flag for external dispatch | `true` |
| `N8N_BASE_URL` | Base URL of your n8n instance | `http://localhost:5678` or `https://n8n.yourdomain.com` |
| `N8N_CALLBACK_URL` | Backend URL where n8n posts delivery callbacks | `http://localhost:3000/api/v1/automation/callback` |
| `N8N_WEBHOOK_SECRET` | 32+ character shared secret for HMAC signing | Strong random string |
| `N8N_WEBHOOK_TIMEOUT_MS` | Network timeout for webhook requests | `5000` (5 seconds) |
| `ADMIN_NOTIFICATION_EMAIL` | Destination for high-priority operational alerts | `admin@st-solutions.com` |

> ⚠️ **Security Notice**: Never pass `N8N_WEBHOOK_SECRET` in HTTP headers or URLs. The system exclusively uses HMAC SHA-256 signatures for authentication.

### B. n8n Instance Environment Variables

In your n8n environment (Docker `.env` or system environment):

```bash
N8N_WEBHOOK_SECRET="your-32-character-secure-hmac-secret-here"
```

---

## 2. Workflows Directory & Webhook Endpoints

| Workflow File | Event Name | n8n Webhook Path |
| :--- | :--- | :--- |
| `contact-message-workflow.json` | `contact.message.received` | `POST /webhook/contact-message-received` |
| `project-inquiry-workflow.json` | `project_inquiry.created` | `POST /webhook/project-inquiry-created` |
| `member-application-workflow.json` | `member_application.*` | `POST /webhook/member-application-lifecycle` |
| `marketing-subscriber-workflow.json` | `marketing.subscriber.added` | `POST /webhook/marketing-subscriber-added` |
| `system-test-workflow.json` | `system.test.dispatched` | `POST /webhook/system-test-dispatched` |

---

## 3. How to Import Workflows into n8n

1. Open your n8n web console (`http://localhost:5678`).
2. Navigate to **Workflows** → Click **Add Workflow** (or `+`).
3. Click the **...** menu in the top right → Select **Import from File**.
4. Choose one of the JSON files in this directory (e.g., `contact-message-workflow.json`).
5. Open the **Send Email** node(s) and attach your preferred email credential (SMTP, SendGrid, Amazon SES, or Mailgun).
6. Activate the workflow by switching the toggle from **Inactive** to **Active**.

---

## 4. Canonical Security Contract

### Request Headers (Platform -> n8n)

Every outbound webhook contains:
- `X-ST-Signature`: Deterministic hex digest: `HMAC_SHA256(secret, "${timestamp}.${deliveryId}.${canonicalPayload}")`
- `X-ST-Timestamp`: ISO 8601 UTC timestamp
- `X-ST-Delivery-Id`: Unique UUID generated for this delivery
- `X-ST-Event`: Domain event identifier

### Canonical Stringification Algorithm

All JSON object keys are recursively sorted lexicographically before hashing. This guarantees that whitespace differences or key order variations never cause signature verification mismatches.

### Callback Request (n8n -> Platform)

When the email provider accepts or delivers the message, n8n sends an authenticated callback:

```http
POST /api/v1/automation/callback
Content-Type: application/json
X-ST-Signature: <hmac_hex>
X-ST-Timestamp: <iso_utc_timestamp>
X-ST-Delivery-Id: <uuid>

{
  "deliveryId": "c8b417e0-...",
  "status": "DELIVERED",
  "responseCode": 200,
  "providerMessageId": "smtp-message-id-992",
  "deliveredAt": "2026-09-08T12:00:00.000Z"
}
```

---

## 5. Failure Handling & Exponential Backoff

If n8n is unreachable or returns a non-2xx status, the platform records a failure and schedules automatic exponential retries:
1. **1st Retry**: ~30 seconds delay
2. **2nd Retry**: ~2 minutes delay
3. **3rd Retry**: ~10 minutes delay
4. **4th Retry**: ~30 minutes delay
5. **Deadletter**: Status transitions to `FAILED` if all 4 attempts are exhausted.

Administrators can monitor pending retries, inspect failure diagnostics, and manually re-trigger events from the **Admin Panel → Settings → Email & Automation** tab.
