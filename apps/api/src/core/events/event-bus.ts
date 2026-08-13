import { DomainEvent, EventHandler } from "./domain-event.types.js";

/**
 * Lightweight, resilient in-memory Event Bus / Event Dispatcher for platform domain events.
 * Guarantees non-blocking, safe execution so handler failures never rollback core business operations.
 */
export class EventBus {
  private static instance: EventBus;
  private readonly handlers: Map<string, EventHandler[]> = new Map();

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Registers a domain event listener.
   */
  public subscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventName) || [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  /**
   * Publishes a domain event asynchronously to all registered listeners.
   * Catches and suppresses errors internally to maintain system resilience.
   */
  public async publish<T = any>(event: DomainEvent<T>): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName) || [];
    if (eventHandlers.length === 0) {
      return;
    }

    // Execute handlers concurrently inside non-blocking try-catch wrappers
    await Promise.allSettled(
      eventHandlers.map(async (handler) => {
        try {
          await handler(event);
        } catch {
          // Intentionally suppress handler execution exceptions to protect primary transaction
        }
      })
    );
  }
}

export const eventBus = EventBus.getInstance();
export const domainEventBus = eventBus;

