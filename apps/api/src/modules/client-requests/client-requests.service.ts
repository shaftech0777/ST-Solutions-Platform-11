import { ClientStatus } from "@prisma/client";
import { BusinessError, ConflictError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { eventBus } from "../../core/events/event-bus.js";
import { sanitizeClientRequestResponse } from "./client-requests.mapper.js";
import {
  clientRequestsRepository as defaultClientRequestsRepository,
  ClientRequestsRepository,
} from "./client-requests.repository.js";
import {
  ClientRequestQueryFilters,
  ClientRequestResponse,
  ClientRequestStatistics,
  ClientRequestStatus,
  ConvertClientRequestInput,
  CreateClientRequestInput,
  UpdateClientRequestInput,
  UpdateClientRequestStatusInput,
} from "./client-requests.types.js";

/**
 * Business logic layer managing Client Request & Lead Intake operations.
 */
export class ClientRequestsService {
  private readonly clientRequestsRepository: ClientRequestsRepository;

  constructor(clientRequestsRepository: ClientRequestsRepository = defaultClientRequestsRepository) {
    this.clientRequestsRepository = clientRequestsRepository;
  }

  /**
   * Retrieves paginated list of client requests with filtering.
   */
  public async getClientRequests(filters: ClientRequestQueryFilters): Promise<{
    items: ClientRequestResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const { data, meta } = await this.clientRequestsRepository.findAndCount(filters);
    const sanitizedItems = data.map((request) => sanitizeClientRequestResponse(request));

    return {
      items: sanitizedItems,
      pagination: meta,
    };
  }

  /**
   * Retrieves detailed client request record by ID.
   */
  public async getClientRequestById(requestId: string): Promise<ClientRequestResponse> {
    const request = await this.clientRequestsRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Client request not found", ERROR_CODES.CLIENT_REQUEST_NOT_FOUND);
    }

    return sanitizeClientRequestResponse(request);
  }

  /**
   * Creates a new client request / lead intake submission.
   */
  public async createClientRequest(input: CreateClientRequestInput): Promise<ClientRequestResponse> {
    const status = input.status || ClientRequestStatus.PENDING;

    const created = await this.clientRequestsRepository.create({
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phoneNumber: input.phoneNumber?.trim() || null,
      whatsappNumber: input.whatsappNumber?.trim() || null,
      message: input.message.trim(),
      country: input.country?.trim() || null,
      status,
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.CLIENT_REQUEST_CREATED,
      entityType: "CLIENT_REQUEST",
      entityId: created.id,
      timestamp: new Date(),
      payload: {
        requestId: created.id,
        fullName: created.fullName,
        email: created.email,
        companyName: null,
      },
    });

    return sanitizeClientRequestResponse(created);
  }

  /**
   * Updates an existing client request.
   */
  public async updateClientRequest(
    requestId: string,
    input: UpdateClientRequestInput
  ): Promise<ClientRequestResponse> {
    const existing = await this.clientRequestsRepository.findById(requestId);
    if (!existing) {
      throw new NotFoundError("Client request not found", ERROR_CODES.CLIENT_REQUEST_NOT_FOUND);
    }

    const updateData: any = {};

    if (input.fullName !== undefined) updateData.fullName = input.fullName.trim();
    if (input.email !== undefined) updateData.email = input.email.trim().toLowerCase();
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber?.trim() || null;
    if (input.whatsappNumber !== undefined) updateData.whatsappNumber = input.whatsappNumber?.trim() || null;
    if (input.message !== undefined) updateData.message = input.message.trim();
    if (input.country !== undefined) updateData.country = input.country?.trim() || null;
    if (input.status !== undefined) updateData.status = input.status.trim().toUpperCase();

    const updated = await this.clientRequestsRepository.update(requestId, updateData);
    return sanitizeClientRequestResponse(updated);
  }

  /**
   * Managed status transition for client requests.
   */
  public async updateClientRequestStatus(
    requestId: string,
    input: UpdateClientRequestStatusInput
  ): Promise<ClientRequestResponse> {
    const request = await this.clientRequestsRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Client request not found", ERROR_CODES.CLIENT_REQUEST_NOT_FOUND);
    }

    const currentStatus = request.status.toUpperCase();
    const newStatus = input.status.trim().toUpperCase();

    if (currentStatus === newStatus) {
      return sanitizeClientRequestResponse(request);
    }

    const allowedTransitions: Record<string, string[]> = {
      [ClientRequestStatus.PENDING]: [
        ClientRequestStatus.IN_REVIEW,
        ClientRequestStatus.CONTACTED,
        ClientRequestStatus.CONVERTED,
        ClientRequestStatus.REJECTED,
        ClientRequestStatus.ARCHIVED,
      ],
      [ClientRequestStatus.IN_REVIEW]: [
        ClientRequestStatus.CONTACTED,
        ClientRequestStatus.CONVERTED,
        ClientRequestStatus.REJECTED,
        ClientRequestStatus.ARCHIVED,
        ClientRequestStatus.PENDING,
      ],
      [ClientRequestStatus.CONTACTED]: [
        ClientRequestStatus.CONVERTED,
        ClientRequestStatus.REJECTED,
        ClientRequestStatus.ARCHIVED,
        ClientRequestStatus.IN_REVIEW,
        ClientRequestStatus.PENDING,
      ],
      [ClientRequestStatus.CONVERTED]: [
        ClientRequestStatus.ARCHIVED,
        ClientRequestStatus.CONTACTED,
      ],
      [ClientRequestStatus.REJECTED]: [
        ClientRequestStatus.PENDING,
        ClientRequestStatus.IN_REVIEW,
        ClientRequestStatus.CONTACTED,
        ClientRequestStatus.ARCHIVED,
      ],
      [ClientRequestStatus.ARCHIVED]: [
        ClientRequestStatus.PENDING,
        ClientRequestStatus.IN_REVIEW,
        ClientRequestStatus.CONTACTED,
        ClientRequestStatus.REJECTED,
      ],
    };

    const transitions = allowedTransitions[currentStatus] || [
      ClientRequestStatus.PENDING,
      ClientRequestStatus.IN_REVIEW,
      ClientRequestStatus.CONTACTED,
      ClientRequestStatus.CONVERTED,
      ClientRequestStatus.REJECTED,
      ClientRequestStatus.ARCHIVED,
    ];

    if (!transitions.includes(newStatus)) {
      throw new BusinessError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        ERROR_CODES.CLIENT_REQUEST_STATUS_TRANSITION_INVALID
      );
    }

    const updated = await this.clientRequestsRepository.update(requestId, {
      status: newStatus,
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.CLIENT_REQUEST_STATUS_CHANGED,
      entityType: "CLIENT_REQUEST",
      entityId: requestId,
      timestamp: new Date(),
      payload: {
        requestId,
        fullName: updated.fullName,
        previousStatus: currentStatus,
        newStatus,
      },
    });

    return sanitizeClientRequestResponse(updated);
  }

  /**
   * Converts a ClientRequest / Lead into a full Client record.
   */
  public async convertToClient(
    requestId: string,
    input?: ConvertClientRequestInput
  ): Promise<{ request: ClientRequestResponse; client: any }> {
    const request = await this.clientRequestsRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Client request not found", ERROR_CODES.CLIENT_REQUEST_NOT_FOUND);
    }

    if (request.status.toUpperCase() === ClientRequestStatus.CONVERTED) {
      throw new ConflictError(
        "Client request has already been converted to a client",
        ERROR_CODES.CLIENT_REQUEST_ALREADY_CONVERTED
      );
    }

    const existingClient = await this.clientRequestsRepository.findClientByEmail(request.email);

    const converted = await this.clientRequestsRepository.withTransaction(async (tx) => {
      let clientRecord = existingClient;

      if (!clientRecord) {
        clientRecord = await this.clientRequestsRepository.createClient(
          {
            fullName: request.fullName,
            email: request.email.toLowerCase(),
            phoneNumber: request.phoneNumber || "N/A",
            whatsappNumber: request.whatsappNumber || null,
            country: request.country || null,
            companyName: input?.companyName?.trim() || null,
            city: input?.city?.trim() || null,
            address: input?.address?.trim() || null,
            businessType: input?.businessType?.trim() || null,
            businessDescription: input?.businessDescription?.trim() || request.message || null,
            clientStatus: ClientStatus.LEAD,
          },
          tx
        );
      }

      const updatedRequest = await this.clientRequestsRepository.update(
        requestId,
        { status: ClientRequestStatus.CONVERTED },
        tx
      );

      const result = {
        request: sanitizeClientRequestResponse(updatedRequest),
        client: {
          id: clientRecord.id,
          fullName: clientRecord.fullName,
          email: clientRecord.email,
          phoneNumber: clientRecord.phoneNumber,
          companyName: clientRecord.companyName,
          clientStatus: clientRecord.clientStatus,
          createdAt: clientRecord.createdAt,
        },
      };

      return result;
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.CLIENT_REQUEST_CONVERTED,
      entityType: "CLIENT_REQUEST",
      entityId: requestId,
      timestamp: new Date(),
      payload: {
        requestId,
        clientId: converted.client.id,
        companyName: converted.client.companyName || converted.client.fullName,
      },
    });

    return converted;
  }

  /**
   * Deletes a client request record by ID.
   */
  public async deleteClientRequest(requestId: string): Promise<void> {
    const request = await this.clientRequestsRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError("Client request not found", ERROR_CODES.CLIENT_REQUEST_NOT_FOUND);
    }

    await this.clientRequestsRepository.delete(requestId);
  }

  /**
   * Computes aggregate statistics for client requests.
   */
  public async getStatistics(): Promise<ClientRequestStatistics> {
    return this.clientRequestsRepository.getStatistics();
  }
}

export const clientRequestsService = new ClientRequestsService();
