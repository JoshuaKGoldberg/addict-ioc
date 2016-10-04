import * as path from 'path';
export declare interface IDependencyInjectionContainerConfig {
  registrationDefaults: TypeRegistrationSettings;
  injectContainerKey: string;
  circularDependencyCanIncludeSingleton: boolean;
  circularDependencyCanIncludeLazy: boolean;
}
export declare interface IProvideConfig {
  get(config: string): any;
}
export declare interface ITypeRegistrationSettings {
  defaults: TypeRegistrationSettings;
  key: any;
  type: any;
  isFactory: boolean;
  isRequire: boolean;
  dependencies: string | string[];
  tags: any;
  config: any;
  isSingleton: boolean;
  wantsInjection: boolean;
  injectInto: string;
  isLazy: boolean;
  bindFunctions: boolean;
  functionsToBind: string | string[];
  lazyKeys: string | string[];
  overwrittenKeys: string | string[];
  autoCreateMissingSubscribers: boolean;
  autoCreateMissingRegistrations: boolean;
  isRequire: boolean;
}
export declare class TypeRegistrationSettings implements ITypeRegistrationSettings {
  constructor(defaults: TypeRegistrationSettings, key: any, type: any, isFactory: boolean, isRequire: boolean);
  defaults: any;
  key: any;
  type: any;
  isFactory: any;
  dependencies: any;
  tags: any;
  subscriptions: any;
  config: any;
  isSingleton: any;
  wantsInjection: any;
  injectInto: any;
  isLazy: any;
  bindFunctions: any;
  functionsToBind: any;
  lazyKeys: any;
  overwrittenKeys: any;
  autoCreateMissingSubscribers: any;
  autoCreateMissingRegistrations: any;
  isRequire: any;
}
export declare class TypeRegistration {
  constructor(defaults: TypeRegistrationSettings, key: any, type: any, isFactory: boolean, isRequire: boolean);
  settings: any;
  dependencies(): any;
  configure(config: any): any;
  singleton(isSingleton: boolean): any;
  noInjection(injectionDisabled: boolean): any;
  injectInto(targetFunction: string): any;
  injectLazy(): any;
  onNewInstance(key: any, targetFunction: string): any;
  bindFunctions(): any;
  tags(tagOrTags: string | string[]): any;
  setAttribute(tag: string, value: any): any;
  overwrite(originalKey: any, overwrittenKey: any): any;
}
export declare function create(options: any): any;
export declare class DependencyInjectionContainer {
  constructor(config: IDependencyInjectionContainerConfig);
  clear(): any;
  config: any;
  registrations: any;
  instances: any;
  externalConfigProvider: IProvideConfig;
  setRequire(rootPath: string): any;
  setConfigProvider(getConfigCallback: IProvideConfig): any;
  setDefaults(registrationDefaults: ITypeRegistrationSettings): any;
  register(key: any, type: any): TypeRegistration;
  unregister(key: any): any;
  registerFactory(key: any, factoryMethod: any): any;
  registerObject(key: any, object: any): any;
  require(moduleName: string): any;
  resolve(key: any, injectionArgs: Array<any>, config: any): any;
  resolveDependencies(key: any): any;
  validateDependencies(optionalKey: any): any;
  getKeysByTags(): any;
  getKeysByAttributes(attributes: Array<any>): any;
  isRegistered(key: any): any;
}