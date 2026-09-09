-- CreateEnum (idempotent if already partially exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AutomationDeliveryStatus') THEN
        CREATE TYPE "AutomationDeliveryStatus" AS ENUM (
            'PENDING',
            'PROCESSING',
            'ACCEPTED_BY_N8N',
            'SENT',
            'DELIVERED',
            'FAILED',
            'RETRYING',
            'BOUNCED'
        );
    ELSE
        -- Ensure all enum values exist
        ALTER TYPE "AutomationDeliveryStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
        ALTER TYPE "AutomationDeliveryStatus" ADD VALUE IF NOT EXISTS 'ACCEPTED_BY_N8N';
        ALTER TYPE "AutomationDeliveryStatus" ADD VALUE IF NOT EXISTS 'SENT';
        ALTER TYPE "AutomationDeliveryStatus" ADD VALUE IF NOT EXISTS 'BOUNCED';
    END IF;
END $$;

-- CreateTable AutomationLog
CREATE TABLE IF NOT EXISTS "AutomationLog" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "recipient" TEXT,
    "payload" JSONB NOT NULL,
    "status" "AutomationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 4,
    "nextRetryAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "providerMsgId" TEXT,
    "failureReason" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable AutomationLog to add outbox columns if table was created previously without them
DO $$
BEGIN
    ALTER TABLE "AutomationLog" ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER NOT NULL DEFAULT 4;
    ALTER TABLE "AutomationLog" ADD COLUMN IF NOT EXISTS "nextRetryAt" TIMESTAMP(3);
    ALTER TABLE "AutomationLog" ADD COLUMN IF NOT EXISTS "lastAttemptAt" TIMESTAMP(3);
    ALTER TABLE "AutomationLog" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);
END $$;

-- CreateTable NewsletterSubscriber
CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT DEFAULT 'WEBSITE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationLog_deliveryId_key" ON "AutomationLog"("deliveryId");
CREATE INDEX IF NOT EXISTS "AutomationLog_event_idx" ON "AutomationLog"("event");
CREATE INDEX IF NOT EXISTS "AutomationLog_status_idx" ON "AutomationLog"("status");
CREATE INDEX IF NOT EXISTS "AutomationLog_createdAt_idx" ON "AutomationLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AutomationLog_recipient_idx" ON "AutomationLog"("recipient");
CREATE INDEX IF NOT EXISTS "AutomationLog_nextRetryAt_idx" ON "AutomationLog"("nextRetryAt");
CREATE INDEX IF NOT EXISTS "AutomationLog_status_nextRetryAt_idx" ON "AutomationLog"("status", "nextRetryAt");

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_isActive_idx" ON "NewsletterSubscriber"("isActive");
