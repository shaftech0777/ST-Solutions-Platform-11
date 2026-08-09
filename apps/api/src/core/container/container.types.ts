export type ServiceLifetime = "singleton" | "transient";

export type ServiceIdentifier<T = unknown> = string | symbol;

export type FactoryFunction<T> = (container: ContainerInterface) => T;

export type ModuleRegisterFunction = (container: ContainerInterface) => void;

export interface ModuleDefinition {
  readonly name: string;
  readonly register: ModuleRegisterFunction;
}

export interface ContainerRegistration<T> {
  readonly identifier: ServiceIdentifier<T>;
  readonly factory: FactoryFunction<T>;
  readonly lifetime: ServiceLifetime;
  instance?: T;
}

export interface ContainerInterface {
  register<T>(
    identifier: ServiceIdentifier<T>,
    factory: FactoryFunction<T>,
    lifetime?: ServiceLifetime
  ): void;
  registerValue<T>(identifier: ServiceIdentifier<T>, value: T): void;
  registerModule(module: ModuleDefinition): void;
  resolve<T>(identifier: ServiceIdentifier<T>): T;
  has(identifier: ServiceIdentifier): boolean;
}

