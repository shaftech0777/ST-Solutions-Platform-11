# Database Delete Behavior

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document defines the official delete behavior strategy used throughout the ST-Solutions Platform database.

Delete rules are selected according to business requirements, data integrity, auditability, and long-term maintainability.

Every foreign key relationship must explicitly define its delete behavior.

---

# Design Principles

The platform follows these principles:

- Preserve important business records.
- Prevent accidental data loss.
- Maintain referential integrity.
- Keep audit history intact.
- Allow safe cleanup of dependent data.
- Prefer explicit behavior over database defaults.

---

# Delete Strategies

The platform uses three primary delete strategies:

- Cascade
- SetNull
- Restrict

Each strategy has a specific business purpose.

---

# Cascade

Purpose

Automatically deletes dependent records when the parent record is removed.

Used only when child data has no independent business value.

Typical Examples

- ApplicationAnswer
- ProjectUpdate
- NotificationPreference
- Session
- AIConversationMessage
- Communication child records
- RolePermission
- MemberVerification

Business Rule

If the parent record no longer exists, the child record is no longer meaningful.

---

# SetNull

Purpose

Preserves historical records while removing the relationship.

Used when historical information must remain available even if the related record is deleted.

Typical Examples

- reviewedById
- approvedById
- assignedToId
- managerId
- memberId (where optional)
- userId (optional ownership)
- createdBy (where business allows)

Business Rule

The history remains valid even when the related user or assignment is no longer available.

---

# Restrict

Purpose

Prevents deletion of important business records while dependent records exist.

Typical Examples

- PlatformVersion.createdBy
- Announcement.createdBy
- ApiKey.createdBy
- MaintenanceWindow.createdBy
- AITrainingNote.createdBy

Business Rule

Administrative ownership must never disappear while dependent records still exist.

Deletion requires manual review and cleanup.

---

# Audit Records

Audit records should never be removed automatically.

Examples

- AuditLog
- MaintenanceLog
- CommunicationLog

These records exist for:

- compliance
- investigations
- accountability
- historical reporting

Relationships generally use SetNull or Restrict rather than Cascade.

---

# Identity Records

User deletion is intentionally limited.

Before removing a user:

- active sessions should be revoked;
- ownership should be reassigned where required;
- historical records must remain accessible.

Physical deletion of user accounts should be rare.

Soft deletion or account deactivation is preferred where supported by business rules.

---

# AI Records

Conversation history should remain consistent.

Examples

- AIConversation → AIConversationMessage uses Cascade.
- AIKnowledgeFeedback may use SetNull if the related knowledge entry is removed and feedback should remain for analysis.

Business Rule

Conversation integrity is more important than preserving orphaned messages.

---

# Client & Project Records

Projects are valuable business assets.

Recommended behavior:

- Deleting a Client may cascade to dependent draft data where appropriate.
- Critical financial and historical records should be preserved or protected according to business policy.

Operational decisions should prioritize historical accuracy over aggressive cleanup.

---

# Financial Records

Financial information should not be deleted automatically.

Examples

- Payment
- MemberReward

If a related entity is removed:

- preserve payment history;
- retain approval records;
- maintain reporting accuracy.

---

# Member Records

Member performance history should remain available.

Examples

- MemberRankHistory
- ClientOwnership
- PromotionActivity

Historical business performance must not be lost because a member leaves the organization.

---

# Analytics Records

Analytics are immutable historical snapshots.

Examples

- WebsiteAnalytics
- RevenueAnalytics
- AIAnalytics
- DashboardMetric

Analytics should never be deleted through application workflows.

Retention policies should be managed separately if required.

---

# Future Relationships

Every new relationship introduced after Database Version 1.0 must explicitly define an onDelete strategy.

The default database behavior must not be relied upon.

Each relationship should be reviewed during architecture discussions.

---

# Decision Matrix

| Strategy | When to Use | Business Goal |
|-----------|-------------|---------------|
| Cascade | Child data depends entirely on parent | Automatic cleanup |
| SetNull | Relationship is optional but history is valuable | Preserve historical records |
| Restrict | Parent record is business-critical | Prevent accidental deletion |

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