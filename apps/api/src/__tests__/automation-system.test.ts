import test from "node:test";
import assert from "node:assert/strict";
import {
  generateWebhookSignature,
  verifyWebhookSignature,
} from "../modules/automation/automation.signature.js";
import { automationService } from "../modules/automation/automation.service.js";
import { automationRepository } from "../modules/automation/automation.repository.js";
import { eventBus } from "../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../core/events/domain-event.types.js";
import { registerAutomationEventListeners } from "../modules/automation/automation.listener.js";

test("ST-Solutions n8n Automation & Security Test Suite", async (t) => {
  const secret = "test-secret-32-chars-long-security-check";

  await t.test("HMAC SHA-256 Signatures: accurately sign and verify payload with timing safety", () => {
    const payload = JSON.stringify({
      eventId: "evt-12345",
      eventName: "contact.message.received",
      data: { email: "visitor@example.com" },
    });

    const signature = generateWebhookSignature(payload, secret);
    assert.ok(signature, "Signature should be generated");
    assert.strictEqual(typeof signature, "string");
    assert.strictEqual(signature.length, 64, "SHA-256 hex string should be 64 characters");

    // Verification succeeds with matching secret
    const result = verifyWebhookSignature(payload, signature, secret);
    assert.strictEqual(result.isValid, true, "Signature should verify successfully");

    // Verification fails with tampered payload
    const tamperedResult = verifyWebhookSignature(payload + "tampered", signature, secret);
    assert.strictEqual(tamperedResult.isValid, false, "Tampered payload should fail verification");

    // Verification fails with wrong secret
    const wrongSecretResult = verifyWebhookSignature(payload, signature, "wrong-secret");
    assert.strictEqual(wrongSecretResult.isValid, false, "Wrong secret should fail verification");
  });

  await t.test("Automation Repository: persists outbox records and updates status", async () => {
    const uniqueDeliveryId = "test-delivery-" + Date.now();
    const record = await automationRepository.createLog({
      deliveryId: uniqueDeliveryId,
      eventName: "contact.message.received",
      recipient: "test@domain.com",
      status: "PENDING",
      payload: { test: true },
      retryCount: 0,
      maxRetries: 3,
    });

    assert.ok(record);
    assert.strictEqual(record.deliveryId, uniqueDeliveryId);
    assert.strictEqual(record.status, "PENDING");

    const found = await automationRepository.findByDeliveryId(uniqueDeliveryId);
    assert.ok(found);
    assert.strictEqual(found.deliveryId, uniqueDeliveryId);

    const updated = await automationRepository.updateStatus(uniqueDeliveryId, {
      status: "DELIVERED",
      responseCode: 200,
      deliveredAt: new Date(),
    });

    assert.ok(updated);
    assert.strictEqual(updated.status, "DELIVERED");
    assert.strictEqual(updated.responseCode, 200);
  });

  await t.test("EventBus Integration: registers listeners and triggers outbox persistence", async () => {
    registerAutomationEventListeners(eventBus, automationService);

    const testEmail = `jane-${Date.now()}@company.com`;

    // Publish test domain event
    await eventBus.publish({
      name: DOMAIN_EVENTS.CONTACT_MESSAGE_RECEIVED,
      eventName: DOMAIN_EVENTS.CONTACT_MESSAGE_RECEIVED,
      timestamp: new Date().toISOString(),
      entityId: "msg-test-1",
      payload: {
        id: "msg-test-1",
        fullName: "Jane Doe",
        email: testEmail,
        subject: "Enterprise Architecture Inquiry",
        message: "We need custom microservice architecture design.",
        submissionTime: new Date().toISOString(),
      },
    });

    // Allow setImmediate event loop cycle to process outbox persistence
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Verify outbox log exists
    const logs = await automationRepository.listLogs(1, 10);
    assert.ok(logs.items.length > 0);
    const contactLog = logs.items.find(
      (l: any) => (l.event === "contact.message.received" || l.eventName === "contact.message.received") && l.recipient === testEmail
    );
    assert.ok(contactLog, "Expected contact.message.received log to be persisted");
  });
});
