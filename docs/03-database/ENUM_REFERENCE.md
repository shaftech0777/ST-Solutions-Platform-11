# Enum Reference

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document defines every enum used throughout the ST-Solutions Platform database.

Enums standardize business values, improve data consistency, reduce invalid states, and simplify application logic.

Applications should always use these enum values instead of custom strings.

---

# UserStatus

Purpose

Defines the operational state of a user account.

Values

- ACTIVE
- INACTIVE
- SUSPENDED
- PENDING

Used In

- User

---

# AccountType

Purpose

Defines the type of platform account.

Values

- ADMIN
- SUB_ADMIN
- MANAGER
- MEMBER
- CLIENT

Used In

- User

---

# ApplicationStatus

Purpose

Tracks the lifecycle of a member application.

Values

- PENDING
- UNDER_REVIEW
- APPROVED
- REJECTED
- MORE_INFORMATION_REQUIRED

Used In

- MemberApplication

---

# VerificationStatus

Purpose

Stores verification progress.

Values

- NOT_VERIFIED
- VERIFIED
- FAILED

Used In

- MemberApplication

---

# MemberStatus

Purpose

Defines the current status of a member.

Values

- ACTIVE
- INACTIVE
- SUSPENDED
- REMOVED

Used In

- Member

---

# RankChangeReason

Purpose

Records why a member's rank changed.

Values

- PROMOTION
- DEMOTION
- PERFORMANCE
- ADMIN_DECISION
- MANUAL

Used In

- MemberRankHistory

---

# RewardType

Purpose

Categorizes rewards.

Values

- CLIENT_REFERRAL
- SOCIAL_MEDIA
- MONTHLY_BONUS
- SPECIAL_REWARD

Used In

- MemberReward

---

# RewardStatus

Purpose

Tracks reward approval and payment.

Values

- PENDING
- APPROVED
- REJECTED
- PAID

Used In

- MemberReward

---

# ClientStatus

Purpose

Tracks client lifecycle.

Values

- LEAD
- CONTACTED
- CONFIRMED
- ACTIVE
- COMPLETED
- INACTIVE

Used In

- Client

---

# ProjectStatus

Purpose

Tracks project progress.

Values

- PENDING
- DISCUSSION
- CONFIRMED
- IN_PROGRESS
- REVIEW
- COMPLETED
- CANCELLED

Used In

- Project

---

# PaymentStatus

Purpose

Tracks payment processing.

Values

- PENDING
- SUBMITTED
- APPROVED
- REJECTED

Used In

- Payment

---

# ServiceStatus

Purpose

Controls service visibility.

Values

- ACTIVE
- INACTIVE

Used In

- Service

---

# PortfolioStatus

Purpose

Defines portfolio publication state.

Values

- DRAFT
- PUBLISHED
- ARCHIVED

Used In

- PortfolioProject

---

# FAQStatus

Purpose

Controls FAQ visibility.

Values

- ACTIVE
- INACTIVE

Used In

- FAQ

---

# NotificationType

Purpose

Categorizes notifications.

Values

- SYSTEM
- MEMBER
- CLIENT
- PROJECT
- PAYMENT
- APPLICATION
- AI
- GENERAL

Used In

- Notification

---

# NotificationStatus

Purpose

Tracks notification state.

Values

- UNREAD
- READ
- ARCHIVED

Used In

- Notification

---

# EmailTemplateType

Purpose

Defines supported email templates.

Values

- APPLICATION_APPROVED
- APPLICATION_REJECTED
- MORE_INFORMATION
- CLIENT_WELCOME
- CLIENT_ACCOUNT_CREATED
- PROJECT_CREATED
- PROJECT_UPDATED
- PAYMENT_RECEIVED
- PAYMENT_APPROVED
- GENERAL

Used In

- EmailTemplate

---

# ContactMessageStatus

Purpose

Tracks support request progress.

Values

- NEW
- IN_PROGRESS
- RESOLVED
- CLOSED

Used In

- ContactMessage

---

# AnnouncementAudience

Purpose

Controls announcement visibility.

Values

- ALL
- MEMBERS
- MANAGERS
- CLIENTS

Used In

- Announcement

---

# AnnouncementStatus

Purpose

Tracks announcement publication state.

Values

- DRAFT
- PUBLISHED
- ARCHIVED

Used In

- Announcement

---

# AIConversationStatus

Purpose

Tracks AI conversation lifecycle.

Values

- ACTIVE
- CLOSED
- ARCHIVED
- ESCALATED

Used In

- AIConversation

---

# AISenderType

Purpose

Identifies the sender of a message.

Values

- USER
- AI
- SYSTEM

Used In

- AIConversationMessage

---

# AnalyticsPeriod

Purpose

Defines analytics aggregation periods.

Values

- DAILY
- WEEKLY
- MONTHLY
- YEARLY

Used In

- WebsiteAnalytics
- AIAnalytics
- ClientAnalytics
- MemberAnalytics
- ManagerAnalytics
- RevenueAnalytics

---

# VisitorDevice

Purpose

Identifies visitor device category.

Values

- DESKTOP
- MOBILE
- TABLET
- UNKNOWN

Used In

- VisitorSession

---

# TrafficSource

Purpose

Tracks visitor acquisition source.

Values

- DIRECT
- GOOGLE
- SOCIAL_MEDIA
- WHATSAPP
- EMAIL
- REFERRAL
- OTHER

Used In

- VisitorSession

---

# FeatureFlagStatus

Purpose

Controls platform feature availability.

Values

- ENABLED
- DISABLED

Used In

- FeatureFlag

---

# MaintenanceStatus

Purpose

Tracks maintenance lifecycle.

Values

- SCHEDULED
- ACTIVE
- COMPLETED
- CANCELLED

Used In

- MaintenanceWindow

---

# BackupStatus

Purpose

Tracks backup execution.

Values

- PENDING
- SUCCESS
- FAILED

Used In

- BackupHistory

---

# ApiKeyStatus

Purpose

Tracks API key validity.

Values

- ACTIVE
- REVOKED
- EXPIRED

Used In

- ApiKey

---

# WebhookStatus

Purpose

Controls webhook availability.

Values

- ACTIVE
- INACTIVE

Used In

- WebhookEndpoint

---

# TaskStatus

Purpose

Tracks scheduled task execution.

Values

- PENDING
- RUNNING
- COMPLETED
- FAILED

Used In

- ScheduledTask

---

# Enum Design Principles

All enums follow these rules:

- Values are written in uppercase.
- Values remain stable across versions.
- Enums represent business states, not UI labels.
- New values require architecture review.
- Existing values should not be renamed after release.

---

# Approval

Architecture Review

Completed

Database Review

Completed

Status

Approved

Database Version

1.0 (Frozen)

---

End of Document