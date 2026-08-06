# Database Architecture Overview

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Purpose

This document provides a high-level overview of the ST-Solutions Platform database architecture.

It explains:

- Database organization.
- Domain separation.
- Core business modules.
- Data flow between systems.
- Scalability approach.
- Future expansion strategy.

---

# Database Technology

Database Engine:

PostgreSQL

ORM:

Prisma ORM

Architecture Style:

Domain-driven relational architecture.

---

# Architecture Philosophy

The ST-Solutions database is designed around business domains.

Each domain owns its own responsibilities while maintaining controlled relationships with other domains.

The architecture prioritizes:

- Scalability
- Data integrity
- Security
- Maintainability
- Business flexibility

---

# High-Level Database Layers

The database is divided into eight major layers.

---

# 1. Identity & Access Layer

Purpose:

Controls users, authentication, authorization, and security identity.

Main Entities:

- User
- Role
- Permission
- RolePermission
- UserProfile
- Session
- AuditLog

Responsibilities:

- Account management.
- Role-based access control.
- Authentication sessions.
- Security auditing.

---

# 2. Recruitment & Membership Layer

Purpose:

Manages member onboarding and organization structure.

Main Entities:

- MemberApplication
- ApplicationQuestion
- ApplicationAnswer
- MemberVerification
- MemberProfile
- Member
- Rank
- MemberRankHistory

Responsibilities:

- Applicant screening.
- Verification process.
- Member lifecycle.
- Rank management.
- Performance tracking.

---

# 3. Client & Project Management Layer

Purpose:

Handles customer relationships and project delivery.

Main Entities:

- Client
- ClientRequest
- ClientOwnership
- Project
- ProjectUpdate

Responsibilities:

- Lead management.
- Client onboarding.
- Project execution.
- Progress tracking.
- Ownership management.

---

# 4. Financial Management Layer

Purpose:

Controls financial records.

Main Entities:

- Payment
- MemberReward
- RevenueAnalytics

Responsibilities:

- Payment tracking.
- Reward management.
- Revenue reporting.

Financial records are treated as sensitive business data.

---

# 5. Business Content Layer

Purpose:

Controls public website information.

Main Entities:

- CompanyProfile
- ServiceCategory
- Service
- PortfolioCategory
- PortfolioProject
- FAQ
- SocialLink
- SEOSettings
- WebsiteSettings

Responsibilities:

- Website content.
- Service catalog.
- Portfolio management.
- SEO configuration.

---

# 6. Communication Layer

Purpose:

Manages all communication workflows.

Main Entities:

- ContactMessage
- EmailTemplate
- WhatsAppTemplate
- Notification
- NotificationPreference
- Announcement
- CommunicationLog

Responsibilities:

- Customer communication.
- Internal notifications.
- Automated messaging.
- Communication history.

---

# 7. AI Intelligence Layer

Purpose:

Provides the central AI knowledge and conversation system.

Main Entities:

- AIKnowledgeCategory
- AIKnowledge
- AIConversation
- AIConversationMessage
- AIIntent
- AIRecommendation
- AIQuickReply
- AIKnowledgeFeedback
- AITrainingNote
- SupportedLanguage

Responsibilities:

- AI assistant knowledge.
- Visitor conversations.
- Intent detection.
- Recommendations.
- Multilingual support.
- Continuous improvement.

---

# 8. Analytics & Administration Layer

Purpose:

Provides monitoring, reporting, and platform control.

Main Entities:

Analytics:

- VisitorSession
- WebsiteAnalytics
- AIAnalytics
- ClientAnalytics
- MemberAnalytics
- ManagerAnalytics
- RevenueAnalytics
- DashboardMetric

Administration:

- SystemConfiguration
- FeatureFlag
- MaintenanceWindow
- BackupHistory
- ApiKey
- WebhookEndpoint
- WebhookLog
- PlatformVersion
- Changelog
- ScheduledTask
- MaintenanceLog

Responsibilities:

- Business intelligence.
- System monitoring.
- Feature control.
- Platform operations.

---

# Data Flow Overview

## Visitor Flow

Visitor

↓

Website

↓

AI Assistant / Contact Request

↓

ClientRequest

↓

Client

↓

Project

↓

Payment

---

## Member Flow

Applicant

↓

MemberApplication

↓

Verification

↓

Approval

↓

MemberProfile

↓

Member

↓

Rank Growth

---

## AI Flow

Visitor Message

↓

Language Detection

↓

Intent Detection

↓

Knowledge Retrieval

↓

AI Response

↓

Feedback

↓

Knowledge Improvement

---

## Project Flow

Client Request

↓

Discussion

↓

Confirmed Project

↓

Assigned Manager

↓

Assigned Member

↓

Project Updates

↓

Completion

---

# Relationship Strategy

The database uses:

## One-to-One Relationships

Examples:

- User ↔ UserProfile
- User ↔ Client
- User ↔ NotificationPreference

Purpose:

Separate optional profile data from core identity.

---

## One-to-Many Relationships

Examples:

- Client → Projects
- Project → Updates
- User → Sessions
- AIConversation → Messages

Purpose:

Represent ownership and lifecycle relationships.

---

## Many-to-Many Relationships

Example:

- Role ↔ Permission

Implemented using:

RolePermission

Purpose:

Flexible authorization management.

---

# Security Architecture

Security is implemented through:

- Password hashing.
- JWT authentication.
- RBAC permissions.
- Audit logging.
- Secret hashing.
- Controlled access.

Sensitive data is never stored in plaintext.

---

# Scalability Strategy

The architecture supports future growth through:

- Modular domain separation.
- Independent service boundaries.
- Clear ownership of data.
- Indexed query patterns.
- Expandable AI layer.
- Analytics aggregation.

---

# Future Expansion Areas

Possible future modules:

- CRM System
- ERP System
- Invoice Management
- AI Automation Engine
- Workflow Automation
- Mobile Applications
- Partner Marketplace
- Advanced Business Intelligence

---

# Database Version Status

Current Version:

Database Schema v1.0

Status:

FROZEN

Future changes require:

- New migration.
- Documentation update.
- Architecture review.

---

# Approval

Architecture Review

Completed

Database Review

Completed

Security Review

Completed

Status

Approved

Database Version

1.0 (Frozen)

---

End of Document