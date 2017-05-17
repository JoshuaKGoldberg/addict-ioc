

export interface IContainer extends IRegistry {
  instances: IInstanceCache<any>;
  parentContainer: IContainer;
  settings: IContainerSettings;
  clear(): void;
  initialize(): void;
  resolve<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): T;
  resolveLazy<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactory<T>;
  resolveAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<T>;
  resolveLazyAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactoryAsync<T>;
  validateDependencies(...keys: Array<RegistrationKey>): Array<IValidationError>;
}

export interface IInstanceCache<T> extends Map<RegistrationKey, IInstanceWithConfigCache<T>> {}
export interface IInstanceWithConfigCache<T> extends Map<string, IInstanceWithInjectionArgsCache<T>> {}
export interface IInstanceWithInjectionArgsCache<T> extends Map<string, Array<T>> {}


export interface IValidationError {
  errorMessage: string;
  registrationStack: Array<IRegistration>;
  currentRegistration: IRegistration;
}

export interface IRegistrator {
  createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
  register<T>(key: RegistrationKey, type: Type<T>, settings?: IRegistrationSettings): ITypeRegistration<T>;
  registerObject(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IRegistration;
  unregister<T>(key: RegistrationKey): IRegistration | ITypeRegistration<T>;
}

export interface IRegistry extends IRegistrator {
  importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
  exportRegistrations(keysToExport: Array<RegistrationKey>): Array<IRegistrationSettings>;
  isRegistered(key: RegistrationKey): boolean;
  getRegistration<T>(key: RegistrationKey): ITypeRegistration<T>;
  getKeysByTags(...tags: Array<string>): Array<RegistrationKey>;
  getKeysByAttributes(attributes: ITags): Array<RegistrationKey>;
}

export interface ITypeRegistration<T> extends IRegistration {
  settings: ITypeRegistrationSettings<T>;
  configure(config: any): ITypeRegistration<T>;
  dependencies(...dependencies: Array<RegistrationKey>): ITypeRegistration<T>;
  singleton(isSingleton: boolean): ITypeRegistration<T>;
  injectLazy(...lazyDependencies: Array<RegistrationKey>): ITypeRegistration<T>;
  injectPromiseLazy(...lazyDependencies: Array<RegistrationKey>): ITypeRegistration<T>;
  injectInto(targetFunction: string): ITypeRegistration<T>;
  bindFunctions(...functionsToBind: Array<string>): ITypeRegistration<T>;
  owns(...dependencies: Array<RegistrationKey>): ITypeRegistration<T>;
  overwrite(originalKey: string, overwrittenKey: string): ITypeRegistration<T>;
  tags(...tags: Array<string>): ITypeRegistration<T>;
  setTag(tag: string, value: any): ITypeRegistration<T>;
}

export interface IObjectRegistration extends IRegistration {
  settings: IObjectRegistrationSettings;
  configure(config: any): IObjectRegistration;
  dependencies(...dependencies: Array<RegistrationKey>): IObjectRegistration;
  singleton(isSingleton: boolean): IObjectRegistration;
  injectLazy(...lazyDependencies: Array<RegistrationKey>): IObjectRegistration;
  injectPromiseLazy(...lazyDependencies: Array<RegistrationKey>): IObjectRegistration;
  injectInto(targetFunction: string): IObjectRegistration;
  bindFunctions(...functionsToBind: Array<string>): IObjectRegistration;
  owns(...dependencies: Array<RegistrationKey>): IObjectRegistration;
  overwrite(originalKey: string, overwrittenKey: string): IObjectRegistration;
  tags(...tags: Array<string>): IObjectRegistration;
  setTag(tag: string, value: any): IObjectRegistration;
}

export interface IFactoryRegistration extends IRegistration {
  settings: IFactoryRegistrationSettings;
  configure(config: any): IFactoryRegistration;
  dependencies(...dependencies: Array<RegistrationKey>): IFactoryRegistration;
  singleton(isSingleton: boolean): IFactoryRegistration;
  injectLazy(...lazyDependencies: Array<RegistrationKey>): IFactoryRegistration;
  injectPromiseLazy(...lazyDependencies: Array<RegistrationKey>): IFactoryRegistration;
  injectInto(targetFunction: string): IFactoryRegistration;
  bindFunctions(...functionsToBind: Array<string>): IFactoryRegistration;
  owns(...dependencies: Array<RegistrationKey>): IFactoryRegistration;
  overwrite(originalKey: string, overwrittenKey: string): IFactoryRegistration;
  tags(...tags: Array<string>): IFactoryRegistration;
  setTag(tag: string, value: any): IFactoryRegistration;
}

export interface IRegistration {
  settings: IRegistrationSettings;
}

export interface ITypeRegistrationSettings<T> extends IRegistrationSettings {
  type?: Type<T>;
}

export interface IObjectRegistrationSettings extends IRegistrationSettings {
  object?: any;
}

export interface IFactoryRegistrationSettings extends IRegistrationSettings {
  factory?: any;
}

export interface IConfigResolver {
  (config: string | any): any;
}

export type TypeConfig = string | any | IConfigResolver;

export interface IContainerSettings extends IRegistrationSettings {
  containerRegistrationKey: RegistrationKey,
  circularDependencyCanIncludeSingleton: boolean,
  circularDependencyCanIncludeLazy: boolean,
}

export interface IRegistrationSettings {
  defaults?: IRegistrationSettings;
  resolver?: ITypeResolver;
  key?: RegistrationKey;
  object?: any;
  factory?: any;
  isFactory?: boolean;
  module?: string;
  isObject?: boolean;
  dependencies?: Array<RegistrationKey>;
  ownedDependencies?: Array<RegistrationKey>;
  tags?: ITags;
  config?: TypeConfig;
  isSingleton?: boolean;
  wantsInjection?: boolean;
  injectInto?: string;
  bindFunctions?: boolean;
  functionsToBind?: Array<string>;
  lazyDependencies?: Array<string>;
  lazyPromiseDependencies?: Array<string>;
  overwrittenKeys?: IOverwrittenKeys;
  // autoCreateMissingSubscribers?: boolean;
  // subscriptions?: IHookSubscriptions;

}

export interface IOverwrittenKeys {
  [originalKey: string]: string;
}

export interface ITypeResolver {
  resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T>;
  resolveTypeAsync<T>(container: IContainer, registration: ITypeRegistration<T>): Promise<Type<T>>;
  resolveObject(container: IContainer, registration: IRegistration): any;
  resolveObjectAsync(container: IContainer, registration: IRegistration): Promise<any>;
  resolveFactory(container: IContainer, registration: IRegistration): any;
  resolveFactoryAsync(container: IContainer, registration: IRegistration): Promise<any>;
  createInstance<T>(container: IContainer, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
  createObject<T>(container: IContainer, object: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
  createFactory<T>(container: IContainer, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
  resolveConfig(config: TypeConfig): any;
}

export interface IResolutionContext {
  registration: IRegistration;
  history: Array<IRegistration>;
  owners: IDependencyOwners;
  isDependencyOwned: boolean;
}

export interface IDependencyOwners {
  [ownedDependencyKey: string]: ITypeRegistration<any>;
}

export interface IFactory<T> {
  (injectionArgs?: Array<any>, runtimeConfig?: any): T;
}

export interface IFactoryAsync<T> {
  (injectionArgs?: Array<any>, runtimeConfig?: any): Promise<T>;
}

export type RegistrationKey = string;

export interface ITags {
  [tag: string]: any;
}

export interface Type<T> {
  new (...args: any[]): T;
}