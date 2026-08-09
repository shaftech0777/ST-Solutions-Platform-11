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

  return containerInstance;
}

/**
 * Global Application Container Instance.
 */
export const container: Container = createApplicationContainer();
