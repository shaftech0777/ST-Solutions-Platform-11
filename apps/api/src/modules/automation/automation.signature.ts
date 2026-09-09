import crypto from "crypto";

/**
 * Computes an HMAC SHA-256 signature for a payload string given a secret.
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies that a webhook signature matches the computed HMAC of the raw payload.
 * Incorporates timing-safe comparison and optional replay attack expiration window.
 */
export function verifyWebhookSignature(
  rawPayload: string,
  providedSignature: string | undefined | null,
  secret: string,
  timestampHeader?: string | null,
  maxAgeMs: number = 300000 // 5 minutes
): { isValid: boolean; reason?: string } {
  if (!secret) {
    return { isValid: false, reason: "Webhook secret is not configured on server" };
  }

  if (!providedSignature) {
    return { isValid: false, reason: "No signature header provided" };
  }

  // Verify timestamp freshness if provided
  if (timestampHeader) {
    const timestamp = new Date(timestampHeader).getTime();
    if (isNaN(timestamp)) {
      return { isValid: false, reason: "Invalid timestamp header format" };
    }
    const age = Math.abs(Date.now() - timestamp);
    if (age > maxAgeMs) {
      return { isValid: false, reason: "Webhook request expired (replay prevention)" };
    }
  }

  const expectedSignature = generateWebhookSignature(rawPayload, secret);

  try {
    const providedBuffer = Buffer.from(providedSignature.trim(), "hex");
    const expectedBuffer = Buffer.from(expectedSignature.trim(), "hex");

    if (providedBuffer.length !== expectedBuffer.length) {
      return { isValid: false, reason: "Signature length mismatch" };
    }

    const match = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
    return { isValid: match, reason: match ? undefined : "Signature mismatch" };
  } catch (err: any) {
    return { isValid: false, reason: `Verification error: ${err?.message || "unknown"}` };
  }
}
