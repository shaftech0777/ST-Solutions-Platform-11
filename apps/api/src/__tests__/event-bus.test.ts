import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../core/events/event-bus.js";
import { DOMAIN_EVENTS } from "../core/events/domain-event.types.js";

describe("Domain Event Bus & Asynchronous Handlers", () => {
  it("should publish and receive domain events", async () => {
    const bus = new EventBus();
    let eventReceived = false;
    let receivedPayload: any = null;

    bus.subscribe(DOMAIN_EVENTS.PROJECT_CREATED, (event) => {
      eventReceived = true;
      receivedPayload = event.payload;
    });

    await bus.publish({
      eventName: DOMAIN_EVENTS.PROJECT_CREATED,
      entityType: "PROJECT",
      entityId: "proj-100",
      actorId: "user-1",
      timestamp: new Date(),
      payload: {
        projectId: "proj-100",
        title: "Test Project",
        clientId: "client-1",
      },
    });

    assert.equal(eventReceived, true);
    assert.equal(receivedPayload.projectId, "proj-100");
    assert.equal(receivedPayload.title, "Test Project");
  });

  it("should handle error in subscriber without crashing event bus", async () => {
    const bus = new EventBus();
    let secondHandlerExecuted = false;

    bus.subscribe(DOMAIN_EVENTS.PAYMENT_SUBMITTED, () => {
      throw new Error("Subscriber crash test");
    });

    bus.subscribe(DOMAIN_EVENTS.PAYMENT_SUBMITTED, () => {
      secondHandlerExecuted = true;
    });

    await bus.publish({
      eventName: DOMAIN_EVENTS.PAYMENT_SUBMITTED,
      entityType: "PAYMENT",
      entityId: "pay-1",
      timestamp: new Date(),
      payload: { paymentId: "pay-1", amount: 500 },
    });

    assert.equal(secondHandlerExecuted, true);
  });
});
