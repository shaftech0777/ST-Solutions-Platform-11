import { AccountType, ClientStatus } from "@prisma/client";
import { AuthorizationError, BusinessError, ConflictError, NotFoundError } from "../../core/errors/app-error.js";
import { ERROR_CODES } from "../../core/errors/error.codes.js";
import { DOMAIN_EVENTS } from "../../core/events/domain-event.types.js";
import { eventBus } from "../../core/events/event-bus.js";
import { AuthorizationPolicy } from "../../core/security/authorization.policy.js";
import { sanitizeClientDetailResponse, sanitizeClientResponse } from "./clients.mapper.js";
import { clientsRepository as defaultClientsRepository, ClientsRepository } from "./clients.repository.js";
import {
  ClientDetailResponse,
  ClientQueryFilters,
  ClientStatistics,
  ClientSummaryResponse,
  CreateClientInput,
  UpdateClientInput,
  UpdateClientOwnershipInput,
  UpdateClientStatusInput,
} from "./clients.types.js";

/**
 * Service layer implementing business rules for Client management.
 */
export class ClientsService {
  private readonly clientsRepository: ClientsRepository;

  constructor(clientsRepository: ClientsRepository = defaultClientsRepository) {
    this.clientsRepository = clientsRepository;
  }

  /**
   * Retrieves a paginated list of clients with role-based isolation.
   */
  public async getClients(
    filters: ClientQueryFilters,
    actor?: { userId: string; accountType?: string; role?: string }
  ): Promise<{
    items: ClientSummaryResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const { data, meta } = await this.clientsRepository.findAndCount(filters);

    const filtered = data.filter((client) => {
      if (!actor) return true;
      return AuthorizationPolicy.canAccessClient(
        { userId: actor.userId, accountType: actor.accountType || "MEMBER" },
        client
      );
    });

    const sanitizedItems = filtered.map((client) => sanitizeClientResponse(client));

    return {
      items: sanitizedItems,
      pagination: {
        ...meta,
        total: sanitizedItems.length,
      },
    };
  }

  /**
   * Retrieves detailed client record by client ID with authorization enforcement.
   */
  public async getClientById(
    clientId: string,
    actor?: { userId: string; accountType?: string; role?: string }
  ): Promise<ClientDetailResponse> {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError("Client not found", ERROR_CODES.CLIENT_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanAccessClient(
        { userId: actor.userId, accountType: actor.accountType || "MEMBER" },
        client
      );
    }

    return sanitizeClientDetailResponse(client);
  }

  /**
   * Creates a new client and optionally assigns ownership in a transaction.
   */
  public async createClient(
    input: CreateClientInput,
    actor?: { userId: string; accountType?: string }
  ): Promise<ClientDetailResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const emailExists = await this.clientsRepository.existsByEmail(normalizedEmail);
    if (emailExists) {
      throw new ConflictError("A client with this email address already exists", ERROR_CODES.CLIENT_ALREADY_EXISTS);
    }

    // Auto-link Member ownership if created by a MEMBER
    let targetMemberId = input.memberId;
    let targetAssignedManagerId = input.assignedManagerId;

    if (actor?.accountType === "MEMBER" && actor?.userId && !targetMemberId) {
      const member = await this.clientsRepository.findMemberByUserId(actor.userId);
      if (member) {
        targetMemberId = member.id;
        if (!targetAssignedManagerId && member.manager?.user?.id) {
          targetAssignedManagerId = member.manager.user.id;
        }
      }
    }

    if (targetMemberId) {
      const member = await this.clientsRepository.findMemberById(targetMemberId);
      if (!member) {
        throw new NotFoundError("Assigned member not found", ERROR_CODES.CLIENT_MEMBER_NOT_FOUND);
      }
    }

    if (targetAssignedManagerId) {
      const manager = await this.clientsRepository.findManagerUserById(targetAssignedManagerId);
      if (!manager) {
        throw new NotFoundError("Assigned manager user not found", ERROR_CODES.CLIENT_OWNER_NOT_FOUND);
      }
    }

    const createdClient = await this.clientsRepository.withTransaction(async (tx) => {
      const clientRecord = await this.clientsRepository.create(
        {
          fullName: input.fullName.trim(),
          email: normalizedEmail,
          phoneNumber: input.phoneNumber.trim(),
          companyName: input.companyName?.trim() || null,
          whatsappNumber: input.whatsappNumber?.trim() || null,
          country: input.country?.trim() || null,
          city: input.city?.trim() || null,
          address: input.address?.trim() || null,
          businessType: input.businessType?.trim() || null,
          businessDescription: input.businessDescription?.trim() || null,
          clientStatus: input.clientStatus || ClientStatus.LEAD,
          createdBy: actor?.userId ? { connect: { id: actor.userId } } : undefined,
          owner: (actor?.accountType === "MEMBER" && actor?.userId) ? { connect: { id: actor.userId } } : undefined,
          supervisor: (actor?.accountType === "MANAGER" && actor?.userId) ? { connect: { id: actor.userId } } : undefined,
        },
        tx
      );

      if (targetMemberId) {
        await this.clientsRepository.upsertOwnership(
          clientRecord.id,
          targetMemberId,
          targetAssignedManagerId,
          input.notes,
          tx
        );
      }

      return this.clientsRepository.findById(clientRecord.id, tx);
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.CLIENT_CREATED,
      entityType: "CLIENT",
      entityId: createdClient!.id,
      actorId: actor?.userId,
      timestamp: new Date(),
      payload: {
        clientId: createdClient!.id,
        companyName: createdClient!.companyName || createdClient!.fullName,
        email: createdClient!.email,
        fullName: createdClient!.fullName,
        memberId: input.memberId,
        assignedManagerId: input.assignedManagerId,
      },
    });

    return sanitizeClientDetailResponse(createdClient!);
  }

  /**
   * Updates existing client profile information.
   */
  public async updateClient(
    clientId: string,
    input: UpdateClientInput,
    actor?: { userId: string; accountType?: string }
  ): Promise<ClientDetailResponse> {
    const existingClient = await this.clientsRepository.findById(clientId);
    if (!existingClient) {
      throw new NotFoundError("Client not found", ERROR_CODES.CLIENT_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanAccessClient(
        { userId: actor.userId, accountType: actor.accountType || "MEMBER" },
        existingClient
      );
    }

    const updateData: any = {};

    if (input.fullName !== undefined) updateData.fullName = input.fullName.trim();
    if (input.companyName !== undefined) updateData.companyName = input.companyName?.trim() || null;
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber.trim();
    if (input.whatsappNumber !== undefined) updateData.whatsappNumber = input.whatsappNumber?.trim() || null;
    if (input.country !== undefined) updateData.country = input.country?.trim() || null;
    if (input.city !== undefined) updateData.city = input.city?.trim() || null;
    if (input.address !== undefined) updateData.address = input.address?.trim() || null;
    if (input.profileImage !== undefined) updateData.profileImage = input.profileImage || null;
    if (input.businessType !== undefined) updateData.businessType = input.businessType?.trim() || null;
    if (input.businessDescription !== undefined) updateData.businessDescription = input.businessDescription?.trim() || null;

    if (input.email !== undefined) {
      const normalizedEmail = input.email.trim().toLowerCase();
      if (normalizedEmail !== existingClient.email.toLowerCase()) {
        const emailExists = await this.clientsRepository.existsByEmail(normalizedEmail, clientId);
        if (emailExists) {
          throw new ConflictError("A client with this email address already exists", ERROR_CODES.CLIENT_ALREADY_EXISTS);
        }
        updateData.email = normalizedEmail;
      }
    }

    const updatedClient = await this.clientsRepository.update(clientId, updateData);
    return sanitizeClientDetailResponse(updatedClient);
  }

  /**
   * Managed transition of client status.
   */
  public async updateClientStatus(
    clientId: string,
    input: UpdateClientStatusInput,
    actor?: { userId: string; accountType?: string }
  ): Promise<ClientDetailResponse> {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError("Client not found", ERROR_CODES.CLIENT_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanAccessClient(
        { userId: actor.userId, accountType: actor.accountType || "MEMBER" },
        client
      );
    }

    const currentStatus = client.clientStatus;
    const newStatus = input.clientStatus;

    if (currentStatus === newStatus) {
      return sanitizeClientDetailResponse(client);
    }

    const allowedTransitions: Record<ClientStatus, ClientStatus[]> = {
      [ClientStatus.LEAD]: [ClientStatus.CONTACTED, ClientStatus.CONFIRMED, ClientStatus.INACTIVE],
      [ClientStatus.CONTACTED]: [ClientStatus.CONFIRMED, ClientStatus.ACTIVE, ClientStatus.INACTIVE, ClientStatus.LEAD],
      [ClientStatus.CONFIRMED]: [ClientStatus.ACTIVE, ClientStatus.COMPLETED, ClientStatus.INACTIVE],
      [ClientStatus.ACTIVE]: [ClientStatus.COMPLETED, ClientStatus.INACTIVE, ClientStatus.CONFIRMED],
      [ClientStatus.COMPLETED]: [ClientStatus.ACTIVE, ClientStatus.INACTIVE],
      [ClientStatus.INACTIVE]: [ClientStatus.LEAD, ClientStatus.CONTACTED, ClientStatus.CONFIRMED, ClientStatus.ACTIVE],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BusinessError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        ERROR_CODES.CLIENT_STATUS_TRANSITION_INVALID
      );
    }

    const updatedClient = await this.clientsRepository.update(clientId, {
      clientStatus: newStatus,
    });

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.CLIENT_STATUS_CHANGED,
      entityType: "CLIENT",
      entityId: clientId,
      actorId: actor?.userId,
      timestamp: new Date(),
      payload: {
        clientId,
        companyName: updatedClient.companyName || updatedClient.fullName,
        previousStatus: currentStatus,
        newStatus,
        memberId: updatedClient.ownership?.memberId,
        assignedManagerId: updatedClient.ownership?.assignedManagerId,
      },
    });

    return sanitizeClientDetailResponse(updatedClient);
  }

  /**
   * Assigns or changes client ownership to member and manager.
   */
  public async updateClientOwnership(
    clientId: string,
    input: UpdateClientOwnershipInput,
    actor?: { userId: string; accountType?: string }
  ): Promise<ClientDetailResponse> {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError("Client not found", ERROR_CODES.CLIENT_NOT_FOUND);
    }

    // Only Admin, Sub-Admin, or Manager can reassign ownership
    if (actor && actor.accountType === "MEMBER") {
      throw new AuthorizationError(
        "Members cannot reassign client ownership",
        ERROR_CODES.FORBIDDEN_RESOURCE_ACCESS
      );
    }

    const member = await this.clientsRepository.findMemberById(input.memberId);
    if (!member) {
      throw new NotFoundError("Assigned member not found", ERROR_CODES.CLIENT_MEMBER_NOT_FOUND);
    }

    if (input.assignedManagerId) {
      const manager = await this.clientsRepository.findManagerUserById(input.assignedManagerId);
      if (!manager) {
        throw new NotFoundError("Assigned manager user not found", ERROR_CODES.CLIENT_OWNER_NOT_FOUND);
      }
    }

    await this.clientsRepository.upsertOwnership(
      clientId,
      input.memberId,
      input.assignedManagerId,
      input.notes
    );

    const updatedClient = await this.clientsRepository.findById(clientId);

    await eventBus.publish({
      eventName: DOMAIN_EVENTS.CLIENT_OWNERSHIP_CHANGED,
      entityType: "CLIENT",
      entityId: clientId,
      actorId: actor?.userId,
      timestamp: new Date(),
      payload: {
        clientId,
        companyName: updatedClient!.companyName || updatedClient!.fullName,
        previousMemberId: client.ownership?.memberId,
        newMemberId: input.memberId,
        assignedManagerId: input.assignedManagerId,
      },
    });

    return sanitizeClientDetailResponse(updatedClient!);
  }

  /**
   * Retrieves communication logs for a client with authorization check.
   */
  public async getCommunications(
    clientId: string,
    actor?: { userId: string; accountType?: string; role?: string }
  ) {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError("Client not found", ERROR_CODES.CLIENT_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanAccessClient(
        { userId: actor.userId, accountType: actor.accountType || "MEMBER" },
        client
      );
    }

    const logs = await this.clientsRepository.findCommunicationsByClientId(clientId);
    return logs.map((l) => ({
      id: l.id,
      clientId: l.clientId,
      userId: l.userId,
      senderName: l.user?.profile?.fullName || (l.userId ? "Team Member" : "System / Client"),
      senderRole: l.user?.role?.name || l.user?.accountType || "MEMBER",
      type: l.type,
      destination: l.destination,
      subject: l.subject,
      content: l.content,
      success: l.success,
      createdAt: l.createdAt,
    }));
  }

  /**
   * Creates a new communication entry between Member/Manager and Client.
   */
  public async createCommunication(
    clientId: string,
    input: {
      type?: string;
      destination?: string;
      subject?: string | null;
      content: string;
    },
    actor?: { userId: string; accountType?: string; role?: string }
  ) {
    const client = await this.clientsRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError("Client not found", ERROR_CODES.CLIENT_NOT_FOUND);
    }

    if (actor) {
      AuthorizationPolicy.enforceCanAccessClient(
        { userId: actor.userId, accountType: actor.accountType || "MEMBER" },
        client
      );
    }

    const log = await this.clientsRepository.createCommunication({
      clientId,
      userId: actor?.userId || null,
      type: input.type || "MESSAGE",
      destination: input.destination || client.email,
      subject: input.subject || null,
      content: input.content.trim(),
      success: true,
    });

    return {
      id: log.id,
      clientId: log.clientId,
      userId: log.userId,
      senderName: log.user?.profile?.fullName || "Team Member",
      senderRole: log.user?.role?.name || log.user?.accountType || "MEMBER",
      type: log.type,
      destination: log.destination,
      subject: log.subject,
      content: log.content,
      success: log.success,
      createdAt: log.createdAt,
    };
  }

  /**
   * Computes client statistics.
   */
  public async getStatistics(): Promise<ClientStatistics> {
    return this.clientsRepository.getStatistics();
  }
}

export const clientsService = new ClientsService();
