import {
  ContainerInterface,
  ContainerRegistration,
  FactoryFunction,
  ModuleDefinition,
  ServiceIdentifier,
  ServiceLifetime,
} from "./container.types.js";
import { TOKENS } from "./container.tokens.js";
import { config } from "../../config/index.js";
import { Logger } from "../logger/index.js";
import { databaseService, prisma } from "../../database/index.js";
import { jwtService, passwordService } from "../security/index.js";
import { authRepository, authService, authController } from "../../modules/auth/index.js";
import { usersRepository, usersService, usersController } from "../../modules/users/index.js";
import { rolesRepository, rolesService, rolesController } from "../../modules/roles/index.js";
import { permissionsRepository, permissionsService, permissionsController } from "../../modules/permissions/index.js";
import { applicantsRepository, applicantsService, applicantsController } from "../../modules/applicants/index.js";
import { membersRepository, membersService, membersController } from "../../modules/members/index.js";
import { clientsRepository, clientsService, clientsController } from "../../modules/clients/index.js";
import { clientRequestsRepository, clientRequestsService, clientRequestsController } from "../../modules/client-requests/index.js";
import { projectsRepository, projectsService, projectsController } from "../../modules/projects/index.js";
import { paymentsRepository, paymentsService, paymentsController } from "../../modules/payments/index.js";
import { settingsRepository, settingsService, settingsController } from "../../modules/settings/index.js";
import { auditRepository, auditService, auditController } from "../../modules/audit/index.js";
import {
  NotificationsRepository,
  NotificationsService,
  NotificationsController,
  registerNotificationHandlers,
} from "../../modules/notifications/index.js";
import { eventBus } from "../events/event-bus.js";

/**
 * Lightweight, strongly typed Dependency Injection Container.
 */
export class Container implements ContainerInterface {
  private readonly registrations = new Map<ServiceIdentifier, ContainerRegistration<unknown>>();

  /**
   * Registers a dependency with a factory function and lifecycle specification.
   */
  public register<T>(
    identifier: ServiceIdentifier<T>,
    factory: FactoryFunction<T>,
    lifetime: ServiceLifetime = "singleton"
  ): void {
    this.registrations.set(identifier, {
      identifier,
      factory: factory as FactoryFunction<unknown>,
      lifetime,
    });
  }

  /**
   * Registers a static value instance as a singleton dependency.
   */
  public registerValue<T>(identifier: ServiceIdentifier<T>, value: T): void {
    this.registrations.set(identifier, {
      identifier,
      factory: () => value,
      lifetime: "singleton",
      instance: value,
    });
  }

  /**
   * Registers a feature module with the container.
   */
  public registerModule(module: ModuleDefinition): void {
    module.register(this);
  }

  /**
   * Resolves a registered dependency instance by identifier token.
   */
  public resolve<T>(identifier: ServiceIdentifier<T>): T {
    const registration = this.registrations.get(identifier);

    if (!registration) {
      const name = typeof identifier === "symbol" ? identifier.description ?? String(identifier) : String(identifier);
      throw new Error(`DependencyInjectionError: No provider registered for token '${name}'`);
    }

    if (registration.lifetime === "singleton") {
      if (registration.instance === undefined) {
        registration.instance = registration.factory(this);
      }
      return registration.instance as T;
    }

    return registration.factory(this) as T;
  }

  /**
   * Checks whether a dependency token is registered in the container.
   */
  public has(identifier: ServiceIdentifier): boolean {
    return this.registrations.has(identifier);
  }
}

/**
 * Instantiates and configures default Application DI Container with core singletons.
 */
export function createApplicationContainer(): Container {
  const containerInstance = new Container();

  // Register Core Infrastructure Singletons
  containerInstance.registerValue(TOKENS.Config, config);
  containerInstance.registerValue(TOKENS.Logger, Logger);
  containerInstance.registerValue(TOKENS.PrismaClient, prisma);
  containerInstance.registerValue(TOKENS.DatabaseService, databaseService);
  containerInstance.registerValue(TOKENS.JwtService, jwtService);
  containerInstance.registerValue(TOKENS.PasswordService, passwordService);
  containerInstance.registerValue(TOKENS.AuthRepository, authRepository);
  containerInstance.registerValue(TOKENS.AuthService, authService);
  containerInstance.registerValue(TOKENS.AuthController, authController);
  containerInstance.registerValue(TOKENS.UsersRepository, usersRepository);
  containerInstance.registerValue(TOKENS.UsersService, usersService);
  containerInstance.registerValue(TOKENS.UsersController, usersController);
  containerInstance.registerValue(TOKENS.RolesRepository, rolesRepository);
  containerInstance.registerValue(TOKENS.RolesService, rolesService);
  containerInstance.registerValue(TOKENS.RolesController, rolesController);
  containerInstance.registerValue(TOKENS.PermissionsRepository, permissionsRepository);
  containerInstance.registerValue(TOKENS.PermissionsService, permissionsService);
  containerInstance.registerValue(TOKENS.PermissionsController, permissionsController);
  containerInstance.registerValue(TOKENS.ApplicantsRepository, applicantsRepository);
  containerInstance.registerValue(TOKENS.ApplicantsService, applicantsService);
  containerInstance.registerValue(TOKENS.ApplicantsController, applicantsController);
  containerInstance.registerValue(TOKENS.MembersRepository, membersRepository);
  containerInstance.registerValue(TOKENS.MembersService, membersService);
  containerInstance.registerValue(TOKENS.MembersController, membersController);
  containerInstance.registerValue(TOKENS.ClientsRepository, clientsRepository);
  containerInstance.registerValue(TOKENS.ClientsService, clientsService);
  containerInstance.registerValue(TOKENS.ClientsController, clientsController);
  containerInstance.registerValue(TOKENS.ClientRequestsRepository, clientRequestsRepository);
  containerInstance.registerValue(TOKENS.ClientRequestsService, clientRequestsService);
  containerInstance.registerValue(TOKENS.ClientRequestsController, clientRequestsController);
  containerInstance.registerValue(TOKENS.ProjectsRepository, projectsRepository);
  containerInstance.registerValue(TOKENS.ProjectsService, projectsService);
  containerInstance.registerValue(TOKENS.ProjectsController, projectsController);
  containerInstance.registerValue(TOKENS.PaymentsRepository, paymentsRepository);
  containerInstance.registerValue(TOKENS.PaymentsService, paymentsService);
  containerInstance.registerValue(TOKENS.PaymentsController, paymentsController);
  containerInstance.registerValue(TOKENS.SettingsRepository, settingsRepository);
  containerInstance.registerValue(TOKENS.SettingsService, settingsService);
  containerInstance.registerValue(TOKENS.SettingsController, settingsController);
  containerInstance.registerValue(TOKENS.AuditRepository, auditRepository);
  containerInstance.registerValue(TOKENS.AuditService, auditService);
  containerInstance.registerValue(TOKENS.AuditController, auditController);

  // Register Notifications & Event Bus
  const notificationsRepository = new NotificationsRepository(prisma);
  const notificationsService = new NotificationsService(notificationsRepository);
  const notificationsController = new NotificationsController(notificationsService);

  registerNotificationHandlers(eventBus, notificationsService, prisma);

  containerInstance.registerValue(TOKENS.EventBus, eventBus);
  containerInstance.registerValue(TOKENS.NotificationsRepository, notificationsRepository);
  containerInstance.registerValue(TOKENS.NotificationsService, notificationsService);
  containerInstance.registerValue(TOKENS.NotificationsController, notificationsController);

  return containerInstance;
}

/**
 * Global Application Container Instance.
 */
export const container: Container = createApplicationContainer();
