# Database Schema

Document Version: 1.0

Database Version: 1.0 (Frozen)

Project: ST-Solutions Platform

Status: Approved

Last Updated: 2026-08-04

---

# Overview

This document provides the official reference for the ST-Solutions Platform database schema.

The schema has been designed using PostgreSQL with Prisma ORM and follows enterprise-grade architectural principles.

Every model has a clearly defined responsibility, strong referential integrity, optimized indexing, and future scalability.

The schema is officially frozen as Version 1.0.

---

# Database Technology

Database Engine

PostgreSQL

ORM

Prisma ORM

Primary Keys

UUID

Timestamp Standard

UTC

Naming Convention

Models

PascalCase

Fields

camelCase

Enums

UPPERCASE

---

# Database Architecture

The database is divided into logical business domains.

Each domain represents a separate responsibility inside the platform.

---

## Domain 01

Identity & Authentication

Purpose

Platform authentication and account management.

Contains

• User

• UserProfile

• Session

• Role

• Permission

• RolePermission

• AuditLog

---

## Domain 02

Recruitment

Purpose

Managing member applications and verification.

Contains

• MemberApplication

• ApplicationQuestion

• ApplicationAnswer

• MemberVerification

• MemberProfile

---

## Domain 03

Organization

Purpose

Managing internal organization hierarchy.

Contains

• Rank

• Member

• MemberRankHistory

• MemberReward

• ClientOwnership

• PromotionActivity

---

## Domain 04

Client Management

Purpose

Managing clients and business relationships.

Contains

• Client

• ClientRequest

---

## Domain 05

Project Management

Purpose

Managing projects and project progress.

Contains

• Project

• ProjectUpdate

---

## Domain 06

Payment Management

Purpose

Tracking project payments.

Contains

• Payment

---

## Domain 07

Business Configuration

Purpose

Managing company information and public website content.

Contains

• CompanyProfile

• OfficeLocation

• BankAccount

• ServiceCategory

• Service

• PortfolioCategory

• PortfolioProject

• FAQ

• SocialLink

• SEOSettings

• WebsiteSettings

---

## Domain 08

Communication

Purpose

Managing all communication channels.

Contains

• ContactMessage

• EmailTemplate

• Notification

• NotificationPreference

• Announcement

• WhatsAppTemplate

• CommunicationLog

---

## Domain 09

Artificial Intelligence

Purpose

Powering the ST-Solutions AI Assistant.

Contains

• AIKnowledgeCategory

• AIKnowledge

• AIConversation

• AIConversationMessage

• AIIntent

• AIRecommendation

• AIQuickReply

• AIKnowledgeFeedback

• AITrainingNote

• SupportedLanguage

---

## Domain 10

Analytics

Purpose

Business intelligence and reporting.

Contains

• VisitorSession

• WebsiteAnalytics

• AIAnalytics

• ClientAnalytics

• MemberAnalytics

• ManagerAnalytics

• RevenueAnalytics

• DashboardMetric

---

## Domain 11

Platform Administration

Purpose

Managing platform configuration.

Contains

• SystemConfiguration

• FeatureFlag

• MaintenanceWindow

• BackupHistory

• ApiKey

• WebhookEndpoint

• WebhookLog

• PlatformVersion

• Changelog

• ScheduledTask

• MaintenanceLog

---

# Database Statistics

Architecture Version

1.0

Database Status

Frozen

Primary Database

PostgreSQL

ORM

Prisma

Primary Key Type

UUID

Business Domains

11

Database Models

60+

Enums

20+

Relationship Types

One-to-One

One-to-Many

Many-to-Many

---

# Design Principles

The schema follows these principles:

• High cohesion

• Low coupling

• Data normalization

• Strong referential integrity

• Optimized indexing

• Security-first design

• Enterprise scalability

• Business-driven architecture

• Future extensibility

---

# Change Policy

Database Schema Version 1.0 is frozen.

Future schema modifications require:

• Architecture review

• Documentation updates

• Business justification

• Approval before implementation

---

# Approval

Architecture Review

Completed

Database Review

Completed

Schema Validation

Passed

Schema Freeze

Approved

Status

Production Ready

---

End of Document