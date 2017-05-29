

export interface IContainer<T extends IInstanceWrapper<any>> extends IRegistry {
  instances: IInstanceCache<any, T>;
  parentContainer: IContainer<any>;
  settings: IContainerSettings;
  clear(): void;
  initialize(): void;
  resolve<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): T;
  resolveLazy<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactory<T>;
  resolveAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<T>;
  resolveLazyAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactoryAsync<T>;
  validateDependencies(...keys: Array<RegistrationKey>): Array<IValidationError>;
}

// export interface IInstanceCache<T> extends Map<RegistrationKey, IInstanceWithConfigCache<T>> {}
// export interface IInstanceWithConfigCache<T> extends Map<string, IInstanceWithInjectionArgsCache<T>> {}
// export interface IInstanceWithInjectionArgsCache<T> extends Map<string, Array<T>> {}

export interface IInstanceCache<T, U extends IInstanceWrapper<T>> {
  [key: string]: {
    [configHash: string]: {
      [injectionArgsHash: string]: Array<T>;
    }
  }
}

export interface IInstanceLookup<T extends IInstanceWrapper<any>> {
  [instanceId: string]: T;
}


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
  getRegistration<T>(key: RegistrationKey): IRegistration;
  getKeysByTags(...tags: Array<string>): Array<RegistrationKey>;
  getKeysByAttributes(attributes: ITags): Array<RegistrationKey>;
}

export interface ISpecializedRegistration<T extends IRegistration, U extends IRegistrationSettings> extends IRegistration {
  settings: U;
  configure(config: any): ISpecializedRegistration<T,U>;
  dependencies(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<T,U>;
  singleton(isSingleton: boolean): ISpecializedRegistration<T,U>;
  transient(isTransient: boolean): ISpecializedRegistration<T,U>;
  injectLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<T,U>;
  injectPromiseLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<T,U>;
  injectInto(targetFunction: string): ISpecializedRegistration<T,U>;
  bindFunctions(...functionsToBind: Array<string>): ISpecializedRegistration<T,U>;
  owns(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<T,U>;
  overwrite(originalKey: string, overwrittenKey: string): ISpecializedRegistration<T,U>;
  tags(...tags: Array<string>): ISpecializedRegistration<T,U>;
  setTag(tag: string, value: any): ISpecializedRegistration<T,U>;
}

export interface ITypeRegistration<T> extends ISpecializedRegistration<ITypeRegistration<T>, ITypeRegistrationSettings<T>> {}
export interface IObjectRegistration<T> extends ISpecializedRegistration<IObjectRegistration<T>, IObjectRegistrationSettings> {}
export interface IFactoryRegistration<T> extends ISpecializedRegistration<IFactoryRegistration<T>, IFactoryRegistrationSettings> {}

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
  resolver?: IResolver<any, IInstanceWrapper<any>>;
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
  wantsLazyInjection?: boolean;
  lazyDependencies?: Array<string>;
  wantsPromiseLazyInjection?: boolean;
  lazyPromiseDependencies?: Array<string>;
  overwrittenKeys?: IOverwrittenKeys;
  conventionCalls?: Array<string>;
  // autoCreateMissingSubscribers?: boolean;
  // subscriptions?: IHookSubscriptions;

}

export interface IOverwrittenKeys {
  [originalKey: string]: string;
}

export interface IResolver<T, U extends IInstanceWrapper<any>> {
  resolveType<T>(container: IContainer<U>, registration: ITypeRegistration<T>): Type<T>;
  resolveTypeAsync<T>(container: IContainer<U>, registration: ITypeRegistration<T>): Promise<Type<T>>;
  resolveObject(container: IContainer<U>, registration: IRegistration): any;
  resolveObjectAsync(container: IContainer<U>, registration: IRegistration): Promise<any>;
  resolveFactory(container: IContainer<U>, registration: IRegistration): any;
  resolveFactoryAsync(container: IContainer<U>, registration: IRegistration): Promise<any>;
  createInstance<T>(container: IContainer<U>, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
  createObject<T>(container: IContainer<U>, object: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
  createFactory<T>(container: IContainer<U>, type: any, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
  resolveConfig(config: TypeConfig): any;
  hash(anything: any): string;
  hashType<T>(type: Type<T>): string;
  hashObject(object: any): string;
  hashFactory(factory: any): string;
  hashConfig(config: any): string;
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
export interface IInvocationContext {
  [conventionCall: string]: string;
}

export interface IInstanceWrapper<T> {
  id?: InstanceId;
  ownedBy?: InstanceId;
  instance?: T;
  ownedInstances: Array<InstanceId>;
  registration: IRegistration;
}

export interface IInvocationWrapper<T> extends IInstanceWrapper<T> {
  invocations: IInvocationContext;
}

export type InstanceId = string;

export interface IResolutionContext<T, U extends IInstanceWrapper<T>> {
  currentResolution: U;
  instanceLookup: IInstanceLookup<U>;
  instanceResolutionOrder: Array<InstanceId>;
}

export interface IInvocationResolutionContext<T> extends IResolutionContext<T, IInvocationWrapper<T>> {
  invocations: Array<T>;
}