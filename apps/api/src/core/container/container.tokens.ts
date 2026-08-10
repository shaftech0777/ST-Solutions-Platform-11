/**
 * Strongly typed dependency injection tokens for infrastructure, core components, and domain modules.
 */
export const TOKENS = {
  // Infrastructure & Core
  Config: Symbol.for("Config"),
  Logger: Symbol.for("Logger"),
  PrismaClient: Symbol.for("PrismaClient"),
  DatabaseService: Symbol.for("DatabaseService"),
  JwtService: Symbol.for("JwtService"),
  PasswordService: Symbol.for("PasswordService"),

  // Repositories
  UsersRepository: Symbol.for("UsersRepository"),
  AuthRepository: Symbol.for("AuthRepository"),
  RolesRepository: Symbol.for("RolesRepository"),
  PermissionsRepository: Symbol.for("PermissionsRepository"),
  MembersRepository: Symbol.for("MembersRepository"),
  ApplicantsRepository: Symbol.for("ApplicantsRepository"),
  ManagersRepository: Symbol.for("ManagersRepository"),
  ClientsRepository: Symbol.for("ClientsRepository"),
  ProjectsRepository: Symbol.for("ProjectsRepository"),
  PaymentsRepository: Symbol.for("PaymentsRepository"),
  NotificationsRepository: Symbol.for("NotificationsRepository"),
  SettingsRepository: Symbol.for("SettingsRepository"),
  AuditRepository: Symbol.for("AuditRepository"),

  // Services
  UsersService: Symbol.for("UsersService"),
  AuthService: Symbol.for("AuthService"),
  RolesService: Symbol.for("RolesService"),
  PermissionsService: Symbol.for("PermissionsService"),
  MembersService: Symbol.for("MembersService"),
  ApplicantsService: Symbol.for("ApplicantsService"),
  ManagersService: Symbol.for("ManagersService"),
  ClientsService: Symbol.for("ClientsService"),
  ProjectsService: Symbol.for("ProjectsService"),
  PaymentsService: Symbol.for("PaymentsService"),
  NotificationsService: Symbol.for("NotificationsService"),
  SettingsService: Symbol.for("SettingsService"),
  AuditService: Symbol.for("AuditService"),
  AiService: Symbol.for("AiService"),

  // Controllers
  UsersController: Symbol.for("UsersController"),
  AuthController: Symbol.for("AuthController"),
  RolesController: Symbol.for("RolesController"),
  PermissionsController: Symbol.for("PermissionsController"),
  ApplicantsController: Symbol.for("ApplicantsController"),
  MembersController: Symbol.for("MembersController"),
} as const;

export type TokenName = keyof typeof TOKENS;
