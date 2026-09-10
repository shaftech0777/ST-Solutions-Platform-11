import { AccountType, PaymentStatus, Prisma } from "@prisma/client";
import { BusinessError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { eventBus } from "../../core/events/event-bus.js";
import { clientsRepository } from "../clients/clients.repository.js";
import { sanitizePaymentResponse } from "./payments.mapper.js";
import { paymentsRepository as defaultPaymentsRepository, PaymentsRepository } from "./payments.repository.js";
import {
  CreatePaymentInput,
  PaymentQueryFilters,
  PaymentResponse,
  PaymentStatistics,
  UpdatePaymentInput,
  UpdatePaymentStatusInput,
} from "./payments.types.js";

/**
 * Business logic layer managing Payment & Financial operations.
 */
export class PaymentsService {
  private readonly paymentsRepository: PaymentsRepository;

  constructor(paymentsRepository: PaymentsRepository = defaultPaymentsRepository) {
    this.paymentsRepository = paymentsRepository;
  }

  /**
   * Retrieves paginated list of payments with filtering.
   */
  public async getPayments(
    filters: PaymentQueryFilters,
    actor?: { userId: string; accountType?: string }
  ): Promise<{
    items: PaymentResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const effectiveFilters: PaymentQueryFilters = { ...filters };

    // Force client queries to the authenticated client's database identity (Prevent IDOR)
    if (actor && actor.accountType === AccountType.CLIENT) {
      const clientRecord = await clientsRepository.findByUserId(actor.userId);
      if (!clientRecord) {
        throw new NotFoundError(
          "Client record not found for authenticated account",
          ERROR_CODES.PAYMENT_CLIENT_NOT_FOUND
        );
      }
      effectiveFilters.clientId = clientRecord.id;
    }

    const { data, meta } = await this.paymentsRepository.findAndCount(effectiveFilters);
    const sanitizedItems = data.map((payment) => sanitizePaymentResponse(payment));

    return {
      items: sanitizedItems,
      pagination: meta,
    };
  }

  /**
   * Retrieves detailed payment record by ID.
   */
  public async getPaymentById(
    paymentId: string,
    actor?: { userId: string; accountType?: string }
  ): Promise<PaymentResponse> {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundError("Payment record not found", ERROR_CODES.PAYMENT_NOT_FOUND);
    }

    // IDOR protection: Clients can only access their own payment records
    if (actor && actor.accountType === AccountType.CLIENT) {
      const clientRecord = await clientsRepository.findByUserId(actor.userId);
      if (!clientRecord || payment.clientId !== clientRecord.id) {
        throw new NotFoundError("Payment record not found", ERROR_CODES.PAYMENT_NOT_FOUND);
      }
    }

    return sanitizePaymentResponse(payment);
  }

  /**
   * Creates a new payment entry with relationship validation.
   */
  public async createPayment(
    input: CreatePaymentInput,
    actor: { userId: string; accountType?: string }
  ): Promise<PaymentResponse> {
    const client = await this.paymentsRepository.findClientById(input.clientId);
    if (!client) {
      throw new NotFoundError("Client not found", ERROR_CODES.PAYMENT_CLIENT_NOT_FOUND);
    }

    if (input.projectId) {
      const project = await this.paymentsRepository.findProjectById(input.projectId);
      if (!project) {
        throw new NotFoundError("Project not found", ERROR_CODES.PAYMENT_PROJECT_NOT_FOUND);
      }
      if (project.clientId !== input.clientId) {
        throw new BusinessError(
          "Project does not belong to the specified client",
          ERROR_CODES.BUSINESS_RULE_VIOLATION
        );
      }
    }

    const decimalAmount = new Prisma.Decimal(new Prisma.Decimal(input.amount).toFixed(2));
    if (decimalAmount.isNegative() || decimalAmount.isZero()) {
      throw new BusinessError("Payment amount must be greater than zero", ERROR_CODES.VALIDATION_INVALID_INPUT);
    }

    const initialStatus = input.paymentStatus || PaymentStatus.PENDING;
    const submittedAt =
      input.submittedAt ? new Date(input.submittedAt) : initialStatus === PaymentStatus.SUBMITTED ? new Date() : null;
    const approvedAt =
      input.approvedAt ? new Date(input.approvedAt) : initialStatus === PaymentStatus.APPROVED ? new Date() : null;
    const approvedById =
      input.approvedById ? input.approvedById : initialStatus === PaymentStatus.APPROVED ? actor.userId : null;

    const createdPayment = await this.paymentsRepository.create({
      amount: decimalAmount,
      currency: input.currency?.toUpperCase() || "USD",
      paymentMethod: input.paymentMethod?.trim() || null,
      transactionReference: input.transactionReference?.trim() || null,
      paymentStatus: initialStatus,
      approvalNotes: input.approvalNotes?.trim() || null,
      submittedAt,
      approvedAt,
      client: { connect: { id: input.clientId } },
      project: input.projectId ? { connect: { id: input.projectId } } : undefined,
      approvedBy: approvedById ? { connect: { id: approvedById } } : undefined,
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.PAYMENT_CREATED,
      entityType: "PAYMENT",
      entityId: createdPayment.id,
      actorId: actor.userId,
      timestamp: new Date(),
      payload: {
        paymentId: createdPayment.id,
        amount: Number(createdPayment.amount),
        currency: createdPayment.currency,
        status: createdPayment.paymentStatus,
        clientId: client.id,
        clientName: client.fullName,
        clientEmail: client.email,
        projectId: input.projectId || null,
        projectTitle: createdPayment.project?.title || null,
        transactionReference: createdPayment.transactionReference,
        paymentMethod: createdPayment.paymentMethod,
      },
    });

    return sanitizePaymentResponse(createdPayment);
  }

  /**
   * Updates an existing payment record.
   */
  public async updatePayment(
    paymentId: string,
    input: UpdatePaymentInput,
    _actor?: { userId: string; accountType?: string }
  ): Promise<PaymentResponse> {
    const existingPayment = await this.paymentsRepository.findById(paymentId);
    if (!existingPayment) {
      throw new NotFoundError("Payment record not found", ERROR_CODES.PAYMENT_NOT_FOUND);
    }

    const updateData: any = {};

    if (input.amount !== undefined) {
      const decimalAmount = new Prisma.Decimal(new Prisma.Decimal(input.amount).toFixed(2));
      if (decimalAmount.isNegative() || decimalAmount.isZero()) {
        throw new BusinessError("Payment amount must be greater than zero", ERROR_CODES.VALIDATION_INVALID_INPUT);
      }
      updateData.amount = decimalAmount;
    }
    if (input.currency !== undefined) updateData.currency = input.currency.toUpperCase();
    if (input.paymentMethod !== undefined) updateData.paymentMethod = input.paymentMethod?.trim() || null;
    if (input.transactionReference !== undefined)
      updateData.transactionReference = input.transactionReference?.trim() || null;
    if (input.approvalNotes !== undefined) updateData.approvalNotes = input.approvalNotes?.trim() || null;
    if (input.submittedAt !== undefined)
      updateData.submittedAt = input.submittedAt ? new Date(input.submittedAt) : null;

    const targetClientId = input.clientId || existingPayment.clientId;

    if (input.clientId !== undefined && input.clientId !== existingPayment.clientId) {
      const client = await this.paymentsRepository.findClientById(input.clientId);
      if (!client) {
        throw new NotFoundError("Client not found", ERROR_CODES.PAYMENT_CLIENT_NOT_FOUND);
      }
      updateData.client = { connect: { id: input.clientId } };
    }

    if (input.projectId !== undefined) {
      if (input.projectId === null) {
        updateData.project = { disconnect: true };
      } else {
        const project = await this.paymentsRepository.findProjectById(input.projectId);
        if (!project) {
          throw new NotFoundError("Project not found", ERROR_CODES.PAYMENT_PROJECT_NOT_FOUND);
        }
        if (project.clientId !== targetClientId) {
          throw new BusinessError(
            "Project does not belong to the specified client",
            ERROR_CODES.BUSINESS_RULE_VIOLATION
          );
        }
        updateData.project = { connect: { id: input.projectId } };
      }
    }

    const updatedPayment = await this.paymentsRepository.update(paymentId, updateData);

    return sanitizePaymentResponse(updatedPayment);
  }

  /**
   * Managed transition of payment status.
   */
  public async updatePaymentStatus(
    paymentId: string,
    input: UpdatePaymentStatusInput,
    actor: { userId: string; accountType?: string }
  ): Promise<PaymentResponse> {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundError("Payment record not found", ERROR_CODES.PAYMENT_NOT_FOUND);
    }

    const currentStatus = payment.paymentStatus;
    const newStatus = input.paymentStatus;

    if (currentStatus === newStatus && !input.approvalNotes) {
      return sanitizePaymentResponse(payment);
    }

    const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.SUBMITTED, PaymentStatus.APPROVED, PaymentStatus.REJECTED],
      [PaymentStatus.SUBMITTED]: [PaymentStatus.APPROVED, PaymentStatus.REJECTED, PaymentStatus.PENDING],
      [PaymentStatus.APPROVED]: [PaymentStatus.REJECTED],
      [PaymentStatus.REJECTED]: [PaymentStatus.PENDING, PaymentStatus.SUBMITTED],
    };

    if (currentStatus !== newStatus && !allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BusinessError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        ERROR_CODES.PAYMENT_STATUS_TRANSITION_INVALID
      );
    }

    const updateData: any = { paymentStatus: newStatus };

    if (input.approvalNotes !== undefined) {
      updateData.approvalNotes = input.approvalNotes.trim() || null;
    }

    if (newStatus === PaymentStatus.APPROVED) {
      updateData.approvedAt = new Date();
      updateData.approvedBy = { connect: { id: actor.userId } };
    } else if (newStatus === PaymentStatus.SUBMITTED) {
      if (!payment.submittedAt) {
        updateData.submittedAt = new Date();
      }
    }

    const updatedPayment = await this.paymentsRepository.update(paymentId, updateData);

    if (newStatus === PaymentStatus.SUBMITTED) {
      await eventBus.publish({
        eventName: DOMAIN_EVENTS.PAYMENT_SUBMITTED,
        entityType: "PAYMENT",
        entityId: paymentId,
        actorId: actor.userId,
        timestamp: new Date(),
        payload: {
          paymentId,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          clientId: updatedPayment.clientId,
          clientName: updatedPayment.client?.fullName || null,
          clientEmail: updatedPayment.client?.email || null,
          projectId: updatedPayment.projectId,
          projectTitle: updatedPayment.project?.title || null,
          transactionReference: updatedPayment.transactionReference,
          submittedByUserId: actor.userId,
        },
      });
    } else if (newStatus === PaymentStatus.APPROVED) {
      await eventBus.publish({
        eventName: DOMAIN_EVENTS.PAYMENT_APPROVED,
        entityType: "PAYMENT",
        entityId: paymentId,
        actorId: actor.userId,
        timestamp: new Date(),
        payload: {
          paymentId,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          clientId: updatedPayment.clientId,
          clientName: updatedPayment.client?.fullName || null,
          clientEmail: updatedPayment.client?.email || null,
          projectId: updatedPayment.projectId,
          projectTitle: updatedPayment.project?.title || null,
          transactionReference: updatedPayment.transactionReference,
          approvalNotes: updatedPayment.approvalNotes,
          approvedByUserId: actor.userId,
        },
      });
    } else if (newStatus === PaymentStatus.REJECTED) {
      await eventBus.publish({
        eventName: DOMAIN_EVENTS.PAYMENT_REJECTED,
        entityType: "PAYMENT",
        entityId: paymentId,
        actorId: actor.userId,
        timestamp: new Date(),
        payload: {
          paymentId,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          clientId: updatedPayment.clientId,
          clientName: updatedPayment.client?.fullName || null,
          clientEmail: updatedPayment.client?.email || null,
          projectId: updatedPayment.projectId,
          projectTitle: updatedPayment.project?.title || null,
          transactionReference: updatedPayment.transactionReference,
          rejectionReason: input.approvalNotes || "Payment rejected",
          rejectedByUserId: actor.userId,
          reason: input.approvalNotes,
        },
      });
    }

    return sanitizePaymentResponse(updatedPayment);
  }

  /**
   * Deletes a payment record by ID.
   */
  public async deletePayment(paymentId: string): Promise<void> {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundError("Payment record not found", ERROR_CODES.PAYMENT_NOT_FOUND);
    }

    await this.paymentsRepository.delete(paymentId);
  }

  /**
   * Computes aggregate payment & financial statistics.
   */
  public async getStatistics(): Promise<PaymentStatistics> {
    return this.paymentsRepository.getStatistics();
  }
}

export const paymentsService = new PaymentsService();
