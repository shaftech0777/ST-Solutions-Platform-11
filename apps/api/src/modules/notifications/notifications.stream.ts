import { Response } from "express";
import { NotificationResponse } from "./notifications.types.js";

/**
 * Manages active Server-Sent Events (SSE) connections for real-time notification delivery.
 * Features:
 * - Connection isolation per user ID.
 * - Automatic periodic keepalive heartbeats (compatible with Render & Vercel proxy timeouts).
 * - Graceful connection cleanup on disconnect.
 * - Broadcasts real-time notifications and unread counter synchronization.
 */
export class NotificationStreamManager {
  private userConnections: Map<string, Set<Response>> = new Map();
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Keepalive ping every 25 seconds
    this.keepAliveInterval = setInterval(() => {
      this.sendKeepAlive();
    }, 25000);

    // Prevent interval from blocking process termination
    if (this.keepAliveInterval.unref) {
      this.keepAliveInterval.unref();
    }
  }

  /**
   * Registers a new SSE connection for an authenticated user.
   */
  public addConnection(userId: string, res: Response): void {
    if (!userId || !res) return;

    // Configure headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    let userConns = this.userConnections.get(userId);
    if (!userConns) {
      userConns = new Set<Response>();
      this.userConnections.set(userId, userConns);
    }
    userConns.add(res);

    // Send initial handshake
    this.writeEvent(res, "connected", {
      status: "connected",
      userId,
      timestamp: new Date().toISOString(),
    });

    const cleanup = () => {
      const conns = this.userConnections.get(userId);
      if (conns) {
        conns.delete(res);
        if (conns.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    };

    res.on("close", cleanup);
    res.on("finish", cleanup);
    res.on("error", cleanup);
  }

  /**
   * Broadcasts a notification object to a specific user's active SSE connections.
   */
  public broadcastNotification(userId: string, notification: NotificationResponse): void {
    const userConns = this.userConnections.get(userId);
    if (!userConns || userConns.size === 0) return;

    for (const res of userConns) {
      this.writeEvent(res, "notification", notification);
    }
  }

  /**
   * Broadcasts an unread count update to a specific user's active SSE connections.
   */
  public broadcastUnreadCount(userId: string, unreadCount: number): void {
    const userConns = this.userConnections.get(userId);
    if (!userConns || userConns.size === 0) return;

    for (const res of userConns) {
      this.writeEvent(res, "unread_count", { unreadCount });
    }
  }

  /**
   * Sends a lightweight keepalive heartbeat to all open SSE streams.
   */
  private sendKeepAlive(): void {
    for (const [, conns] of this.userConnections.entries()) {
      for (const res of conns) {
        try {
          res.write(": keepalive\n\n");
        } catch {
          // Connection likely severed; handled on close
        }
      }
    }
  }

  /**
   * Formats and writes an SSE event packet.
   */
  private writeEvent(res: Response, eventName: string, data: any): void {
    try {
      res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch {
      // Ignore write errors
    }
  }

  /**
   * Total count of active SSE streams across all users.
   */
  public getActiveConnectionCount(): number {
    let count = 0;
    for (const conns of this.userConnections.values()) {
      count += conns.size;
    }
    return count;
  }
}

export const notificationStreamManager = new NotificationStreamManager();
