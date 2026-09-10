import crypto from "crypto";

/**
 * Deterministic JSON stringifier that sorts all object keys recursively.
 * Ensures that both the backend and n8n compute HMAC signatures over the EXACT same bytes
 * regardless of key ordering or whitespace discrepancies.
 */
export function canonicalStringify(data: any): string {
  if (data === null || typeof data !== "object") {
    return JSON.stringify(data);
  }
  if (Array.isArray(data)) {
    return "[" + data.map((item) => canonicalStringify(item)).join(",") + "]";
  }
  const keys = Object.keys(data).sort();
  const pairs = keys
    .filter((k) => data[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${canonicalStringify(data[k])}`);
  return "{" + pairs.join(",") + "}";
}

/**
 * Builds the canonical message string to sign.
 * Scheme: `${timestamp}.${deliveryId}.${canonicalPayload}`
 *
 * Ensures that both object payloads and JSON stringified payloads
 * are parsed and canonically sorted by key recursively.
 */
export function buildStringToSign(timestamp: string, deliveryId: string, payload: any): string {
  let parsed = payload;
  if (typeof payload === "string") {
    try {
      parsed = JSON.parse(payload);
    } catch {
      parsed = payload;
    }
  }
  const canonicalPayload = canonicalStringify(parsed);
  return `${timestamp}.${deliveryId}.${canonicalPayload}`;
}

/**
 * Computes a canonical HMAC SHA-256 signature for a payload, timestamp, and delivery ID.
 */
export function generateCanonicalSignature(
  timestamp: string,
  deliveryId: string,
  payload: any,
  secret: string
): string {
  if (!secret) return "";
  const stringToSign = buildStringToSign(timestamp, deliveryId, payload);
  return crypto.createHmac("sha256", secret).update(stringToSign, "utf8").digest("hex");
}

/**
 * Backward-compatible raw signature generator.
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export interface SignatureVerificationResult {
  isValid: boolean;
  code?: string;
  reason?: string;
}

/**
 * Verifies that an inbound webhook callback adheres to the canonical signing contract.
 *
 * Requirements enforced:
 * 1. HMAC-SHA256 calculation
 * 2. Constant-time comparison (crypto.timingSafeEqual)
 * 3. Mandatory signature (X-ST-Signature)
 * 4. Mandatory timestamp (X-ST-Timestamp)
 * 5. Mandatory delivery ID (X-ST-Delivery-Id)
 * 6. Timestamp freshness validation (default 5 minutes)
 * 7. Rejection of malformed signatures, stale timestamps, or missing authentication metadata.
 */
export function verifyCanonicalWebhookSignature(params: {
  rawPayload: any;
  signature: string | undefined | null;
  timestamp: string | undefined | null;
  deliveryId: string | undefined | null;
  secret: string;
  maxAgeMs?: number;
}): SignatureVerificationResult {
  const { rawPayload, signature, timestamp, deliveryId, secret, maxAgeMs = 300000 } = params;

  if (!secret) {
    return {
      isValid: false,
      code: "MISSING_SERVER_SECRET",
      reason: "Webhook secret is not configured on server",
    };
  }

  if (!signature || typeof signature !== "string" || !signature.trim()) {
    return {
      isValid: false,
      code: "MISSING_SIGNATURE",
      reason: "Mandatory signature header (X-ST-Signature) is missing or empty",
    };
  }

  if (!timestamp || typeof timestamp !== "string" || !timestamp.trim()) {
    return {
      isValid: false,
      code: "MISSING_TIMESTAMP",
      reason: "Mandatory timestamp header (X-ST-Timestamp) is missing or empty",
    };
  }

  if (!deliveryId || typeof deliveryId !== "string" || !deliveryId.trim()) {
    return {
      isValid: false,
      code: "MISSING_DELIVERY_ID",
      reason: "Mandatory delivery ID header (X-ST-Delivery-Id) is missing or empty",
    };
  }

  // Verify timestamp freshness
  const parsedTime = new Date(timestamp).getTime();
  if (isNaN(parsedTime)) {
    return {
      isValid: false,
      code: "MALFORMED_TIMESTAMP",
      reason: "Invalid timestamp header format (must be ISO8601 or unix parseable)",
    };
  }

  const age = Math.abs(Date.now() - parsedTime);
  if (age > maxAgeMs) {
    return {
      isValid: false,
      code: "STALE_TIMESTAMP",
      reason: `Webhook timestamp expired (age ${Math.round(age / 1000)}s exceeds ${Math.round(maxAgeMs / 1000)}s window)`,
    };
  }

  // Calculate canonical signature
  const expectedCanonical = generateCanonicalSignature(timestamp, deliveryId, rawPayload, secret);
  // Also calculate fallback signatures in case caller signed raw body string directly
  const rawString = typeof rawPayload === "string" ? rawPayload : JSON.stringify(rawPayload);
  const expectedRawWithPrefix = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${deliveryId}.${rawString}`, "utf8")
    .digest("hex");
  const expectedRaw = generateWebhookSignature(rawString, secret);

  try {
    const cleanProvided = signature.trim().toLowerCase();
    const providedBuffer = Buffer.from(cleanProvided, "hex");
    const canonicalBuffer = Buffer.from(expectedCanonical.toLowerCase(), "hex");

    if (providedBuffer.length === canonicalBuffer.length) {
      if (crypto.timingSafeEqual(providedBuffer, canonicalBuffer)) {
        return { isValid: true };
      }
    }

    // Fallback comparison for prefixed raw body signing
    const rawWithPrefixBuffer = Buffer.from(expectedRawWithPrefix.toLowerCase(), "hex");
    if (providedBuffer.length === rawWithPrefixBuffer.length) {
      if (crypto.timingSafeEqual(providedBuffer, rawWithPrefixBuffer)) {
        return { isValid: true };
      }
    }

    // Fallback comparison for raw body signing
    const rawBuffer = Buffer.from(expectedRaw.toLowerCase(), "hex");
    if (providedBuffer.length === rawBuffer.length) {
      if (crypto.timingSafeEqual(providedBuffer, rawBuffer)) {
        return { isValid: true };
      }
    }

    return {
      isValid: false,
      code: "SIGNATURE_MISMATCH",
      reason: "HMAC signature verification failed (calculated digest does not match provided signature)",
    };
  } catch (err: any) {
    return {
      isValid: false,
      code: "VERIFICATION_ERROR",
      reason: `Verification execution error: ${err?.message || "unknown"}`,
    };
  }
}

/**
 * Legacy wrapper for backward compatibility.
 */
export function verifyWebhookSignature(
  rawPayload: string,
  providedSignature: string | undefined | null,
  secret: string,
  timestampHeader?: string | null,
  maxAgeMs: number = 300000
): { isValid: boolean; reason?: string } {
  const result = verifyCanonicalWebhookSignature({
    rawPayload,
    signature: providedSignature,
    timestamp: timestampHeader || new Date().toISOString(),
    deliveryId: "legacy-delivery",
    secret,
    maxAgeMs,
  });

  return {
    isValid: result.isValid,
    reason: result.reason,
  };
}
