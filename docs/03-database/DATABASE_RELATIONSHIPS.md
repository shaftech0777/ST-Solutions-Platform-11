# Database Relationships

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Overview

This document defines the relationships between database models used by the ST-Solutions Platform.

Each relationship has been intentionally designed to maintain data integrity, improve performance, and preserve business history.

Deletion behaviors (`Cascade`, `Restrict`, and `SetNull`) are chosen according to business requirements rather than convenience.

---

# Relationship Types

The database uses three primary relationship types.

## One-to-One (1:1)

A single record is associated with exactly one record in another table.

Examples:

- User ↔ UserProfile
- User ↔ NotificationPreference
- Client ↔ ClientOwnership

---

## One-to-Many (1:N)

One parent record owns multiple child records.

Examples:

- Client → Projects
- Project → ProjectUpdates
- AIConversation → AIConversationMessages
- MemberApplication → ApplicationAnswers

---

## Many-to-Many (N:N)

Implemented using junction tables.

Examples:

- Role ↔ Permission
- RolePermission

---

# Identity & Authentication

## User → UserProfile

Relationship

One-to-One

Delete Rule

Cascade

Reason

A profile has no meaning without its user account.

---

## User → Session

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Removing a user automatically removes all active sessions.

---

## User → AuditLog

Relationship

One-to-Many

Delete Rule

SetNull

Reason

Audit history must remain even if the user account is removed.

---

## User → Role

Relationship

Many-to-One

Delete Rule

SetNull

Reason

Historical user records should remain valid if a role changes.

---

## Role → Permission

Relationship

Many-to-Many

Implementation

RolePermission

Delete Rule

Cascade

Reason

Removing a role or permission automatically removes obsolete mappings.

---

# Recruitment

## MemberApplication → ApplicationAnswer

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Answers cannot exist without their application.

---

## MemberApplication → MemberVerification

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Verification belongs exclusively to an application.

---

## MemberApplication → MemberProfile

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Profiles created from an application become invalid if the application is removed before approval.

---

## User → MemberVerification

Relationship

One-to-Many

Delete Rule

SetNull

Reason

Verification history should survive reviewer account removal.

---

# Organization

## Rank → Member

Relationship

One-to-Many

Delete Rule

Restrict

Reason

Ranks should not be deleted while members still reference them.

---

## Member → Member

Relationship

Self Reference

Delete Rule

SetNull

Reason

If a manager leaves, members remain assigned but without a manager until reassignment.

---

## Member → MemberReward

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Rewards belong to the member lifecycle.

---

## Member → ClientOwnership

Relationship

One-to-One

Delete Rule

Restrict

Reason

Client ownership history must never be lost.

---

# Client Management

## Client → Project

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Projects cannot exist without a client.

---

## Client → Payment

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Payments belong to a client.

---

## Client → CommunicationLog

Relationship

One-to-Many

Delete Rule

SetNull

Reason

Communication history should remain even if a client record is archived.

---

# Project Management

## Project → ProjectUpdate

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Updates are part of a project's lifecycle.

---

## Project → Payment

Relationship

One-to-Many

Delete Rule

SetNull

Reason

Financial history may remain even if project references are adjusted.

---

# Communication

## User → Notification

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Notifications are personal and should be removed with the user account.

---

## User → NotificationPreference

Relationship

One-to-One

Delete Rule

Cascade

Reason

Preferences have no purpose without the owning user.

---

## ContactMessage → CommunicationLog

Relationship

One-to-Many

Delete Rule

SetNull

Reason

Communication logs remain as permanent history.

---

## Announcement → User

Relationship

Many-to-One

Delete Rule

Restrict

Reason

Published announcements must preserve author information.

---

# Artificial Intelligence

## AIKnowledgeCategory → AIKnowledge

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Knowledge items depend on their category.

---

## AIConversation → AIConversationMessage

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Messages cannot exist without a conversation.

---

## AIConversation → AIIntent

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Detected intents belong to one conversation.

---

## AIConversation → AIRecommendation

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Recommendations are generated within a conversation.

---

## AIKnowledge → AIKnowledgeFeedback

Relationship

One-to-Many

Delete Rule

SetNull

Reason

Feedback history should remain even if knowledge entries evolve.

---

# Analytics

## Member → MemberAnalytics

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Performance analytics belong to the member profile.

---

## User → ManagerAnalytics

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Management analytics are tied to manager accounts.

---

# Platform Administration

## User → ApiKey

Relationship

One-to-Many

Delete Rule

Restrict

Reason

API keys must always retain ownership records.

---

## WebhookEndpoint → WebhookLog

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Webhook execution logs belong to the configured endpoint.

---

## PlatformVersion → Changelog

Relationship

One-to-Many

Delete Rule

Cascade

Reason

Changelog entries belong to a specific release version.

---

## User → MaintenanceLog

Relationship

One-to-Many

Delete Rule

Restrict

Reason

Administrative maintenance history must remain permanently.

---

# Relationship Design Principles

The relationship strategy follows these rules:

- Child records are removed only when they have no independent business value.
- Historical records are preserved whenever possible.
- Administrative history is never silently lost.
- Financial and audit information is protected.
- Optional ownership uses `SetNull` rather than deletion.
- Security-sensitive records preserve accountability.
- Business integrity takes priority over storage optimization.

---

# Approval

Architecture Review

Completed

Relationship Review

Completed

Schema Validation

Passed

Status

Approved

Database Version

1.0 (Frozen)

---

End of Document