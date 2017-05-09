export interface IContainer extends IRegistry {
  settings: IContainerSettings;
}

export interface IRegistrator {
  register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T>;
  unregister<T>(key: RegistrationKey): IRegistration|ITypeRegistration<T>;
}

export interface IRegistry extends IRegistrator {
  exportRegistrations(keysToExport: Array<RegistrationKey>): Array<IRegistrationSettings>;
  importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
}

export interface ITypeRegistration<T> extends IRegistration {
  settings: ITypeRegistrationSettings<T>;
  configure(config: any): ITypeRegistration<T>;
  dependencies(...dependencies: Array<RegistrationKey>): ITypeRegistration<T>;
  // owns(...dependencies: Array<RegistrationKey>): IRegistration;
  // tags(...tags: Array<Tag>): IRegistration;
}

export interface IRegistration {
  settings: IRegistrationSettings;
}

export interface ITypeRegistrationSettings<T> extends IRegistrationSettings {
  type?: Type<T>;
}

export interface IConfigResolver {
  (config: string | any): any;
}

export type TypeConfig = string | any | IConfigResolver;

export interface IContainerSettings extends IRegistrationSettings {
  containerRegistrationKey: RegistrationKey,
}

export interface IRegistrationSettings {
  defaults?: IRegistrationSettings;
  resolver?: ITypeResolver;
  key?: RegistrationKey;
  isFactory?: boolean;
  module?: string;
  // isObject?: boolean;
  dependencies?: Array<RegistrationKey>;
  ownedDependencies?: Array<RegistrationKey>;
  // tags?: Array<Tag>;
  config?: TypeConfig;
  isSingleton?: boolean;
  wantsInjection?: boolean;
  injectInto?: string;
  // isLazy?: boolean;
  // bindFunctions?: boolean;
  // functionsToBind?: Array<string>;
  lazyDependencies?: Array<string>;
  // overwrittenKeys?: any;
  // autoCreateMissingSubscribers?: boolean;
  // subscriptions?: IHookSubscriptions;

}

export interface ITypeResolver {
  resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T>;
  createInstance<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
  resolveConfig(config: TypeConfig): any;
}

export interface IResolutionContext<T> {
  registration: IRegistration;
  history: Array<ITypeRegistration<any>>;
  owners: IDependencyOwners;
}

export interface IDependencyOwners {
  [ownedDependencyKey: string]: ITypeRegistration<any>;
}

export interface IFactory<T> {
  (injectionArgs?: Array<any>, runtimeConfig?: any): T;
}

export type RegistrationKey = string;
export type Tag = string|symbol;

export interface Type<T> {
  new (...args: any[]): T;
}