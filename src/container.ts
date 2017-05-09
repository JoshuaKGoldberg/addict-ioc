import {IContainer, RegistrationKey, IRegistration, ITypeResolver, IContainerSettings, IResolutionContext, ITypeRegistrationSettings, ITypeRegistration, Type, IFactory} from './interfaces';
import {TypeRegistration} from './type_registration';
import {Registry} from './registry';
import {ResolutionContext} from './resolution_context';
import {DefaultSettings} from './default_settings';
import {getPropertyDescriptor} from './utils';

import * as hash from 'object-hash';
import * as merge from 'deepmerge';

const hashOptions = {
  respectFunctionProperties: false,
  respectType: true,
  unorderedArrays: true
};

export interface IInstanceCache<T> extends Map<RegistrationKey, IInstanceWithConfigCache<T>> {}
export interface IInstanceWithConfigCache<T> extends Map<string, IInstanceWithInjectionArgsCache<T>> {}
export interface IInstanceWithInjectionArgsCache<T> extends Map<string, Array<T>> {}

export class Container extends Registry implements IContainer {

  public instances: IInstanceCache<any>;
  public parentContainer: IContainer;
  public settings: IContainerSettings;

  constructor(parentContainer?: IContainer, settings: IContainerSettings = DefaultSettings) {
    super(settings);
    
    this.parentContainer = parentContainer;
    this.settings = settings;

    this.initialize();
  }

  public clear(): void {
    super.clear();
    this.initialize();
  }

  public initialize(): void {
    this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<any>>();
    this.registerObject(this.settings.containerRegistrationKey, this);
  }

  public resolve<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): T {
    const registration = super.getRegistration<T>(key);
    const resolutionContext: IResolutionContext<T> = new ResolutionContext<T>(registration);
    return this._resolve<T>(registration, resolutionContext, injectionArgs, config);
  }

  public load<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): Promise<T> {
    
  }

  private _mergeArguments(existingArgs: Array<any> = [], newArgs: Array<any> = []): Array<any> {

    const finalArgs = [];

    Array.prototype.push.apply(finalArgs, existingArgs);
    Array.prototype.push.apply(finalArgs, newArgs);

    return finalArgs;
  }

  private _mergeConfigs(existingConfig: any, newConfig: any): any {
    
    if (!existingConfig) {
      return newConfig;
    }

    if (!newConfig) {
      return existingConfig;
    }

    return merge(existingConfig, newConfig);
  }

  private _resolve<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): T {

    return this._resolveInstance<T>(registration, resolutionContext, injectionArgs, config);
  }

  private _resolveLazy<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): IFactory<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): T => {

      const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);

      return this._resolveInstance<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
    };
  }

  private _resolveConfig<T>(registration: IRegistration, config: any): any {
    const resolver = this._getResolver(registration);
    return resolver.resolveConfig(config);
  }

  private _resolveInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T>, injectionArgs?: Array<any>, config?: any): T {
    
    const registrationConfig = this._resolveConfig(registration, registration.settings.config);
    const runtimeConfig = this._resolveConfig(registration, config);

    const configUsed = this._mergeConfigs(registrationConfig, runtimeConfig);

    if (registration.settings.isSingleton) {
      return this._getInstance(registration, resolutionContext, injectionArgs, configUsed);
    }

    return this._getNewInstance(registration, resolutionContext, injectionArgs, configUsed);
  }

  private _getInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): T {

    const instances = this._getCachedInstances<T>(registration, injectionArgs, config);

    if (instances.length === 0) {

      return this._getNewInstance(registration, resolutionContext, injectionArgs, config);
    }

    return instances[0];
  }

  private _getNewInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T>, injectionArgs: Array<any> = [], config?: any): T {

    this._validateResolutionContext(resolutionContext);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const instance = this._createInstance(registration, dependencies, injectionArgs);
    
    this._configureInstance(instance, config);

    // this._callSubscribers(registration, 'newInstance', instance);

    // this._bindFunctionsToInstance(registration, instance);

    this._cacheInstance(registration, instance, injectionArgs, config);

    return instance;
  }

  private _getNewInstanceResolutionContext<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T>): IResolutionContext<T> {

    const newResolutionContext = this._cloneResolutionContext(resolutionContext);
    
    const ownedDependencies = registration.settings.ownedDependencies || [];

    ownedDependencies.forEach((ownedDependency) => {
      newResolutionContext.owners[ownedDependency] = registration;
    });

    return newResolutionContext;
  }

  private _cloneResolutionContext<T>(resolutionContext: IResolutionContext<T>): IResolutionContext<T> {
    // throw new Error('not implemented');
    return Object.assign({}, resolutionContext);
  }

  private _validateResolutionContext<T>(resolutionContext: IResolutionContext<T>): void {
    // throw new Error('not implemented');
  }

  private _resolveDependencies<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T>): Array<any> {

    const resolvedDependencies = [];

    resolutionContext.history.push(registration);

    const dependencies = registration.settings.dependencies || [];

    dependencies.forEach((dependency) => {

      const resolvedDependency = this._resolveDependency(registration, dependency, resolutionContext);

      resolvedDependencies.push(resolvedDependency);
    });

    return resolvedDependencies;
  }

  private _resolveDependency<T>(registration: ITypeRegistration<T>, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext<T>): any {
    
    const newResolutionContext = this._getNewInstanceResolutionContext(registration, resolutionContext);
    
    const dependencyRegistration = super.getRegistration(dependencyKey);

    const isDependencyLazy = this._isDependencyLazy(registration, dependencyKey);

    if (isDependencyLazy) {

      return this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    return this._resolveInstance(dependencyRegistration, newResolutionContext, undefined, undefined);
  }

  private _isDependencyLazy<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {
    if (!registration.settings.lazyDependencies) {
      return false;
    }
    return registration.settings.lazyDependencies.length === 0 || registration.settings.lazyDependencies.indexOf(dependencyKey) >= 0;
  }
  
  private _createInstance<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver = this._getResolver(registration);
    const type = resolver.resolveType(this, registration);
    const instance = resolver.createInstance(this, registration, dependencies, injectionArgs);
    return instance;
  }

  private _getResolver<T>(registration: IRegistration): ITypeResolver {
    return registration.settings.resolver || this.settings.resolver;;
  }

  private _configureInstance(instance: any, config: any): void {

    if (!config) {
      return;
    }

    const configPropertyDescriptor = getPropertyDescriptor(instance, 'config');

    if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
      const instancePrototype = Object.getPrototypeOf(instance);

      throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
    }

    instance.config = config;
  }

  private _getCachedInstances<T>(registration: IRegistration, injectionArgs: Array<any>, config: any): Array<T> {

    const key = registration.settings.key;

    if (!this.instances) {
      this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<T>>();
    }

    const allInstances = this.instances.get(key);
    if (!allInstances) {
      return [];
    }

    const configHash = this._hashConfig(config);

    const configInstances = allInstances.get(configHash);

    if (!configInstances) {
      return [];
    }

    const injectionArgsHash = this._hashInjectionArgs(injectionArgs);

    const argumentInstances = configInstances.get(injectionArgsHash);

    if (!argumentInstances) {
      return [];
    }

    return argumentInstances;
  }

  private _cacheInstance<T>(registration: IRegistration, instance: any, injectionArgs: Array<any>, config: any): void {

    const key = registration.settings.key;

    if (!this.instances) {
      this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<T>>();
    }

    let allInstances = this.instances.get(key);

    if (!allInstances) {
      allInstances = new Map<string, IInstanceWithInjectionArgsCache<any>>();
      this.instances.set(key, allInstances);
    }

    const configHash = this._hashConfig(config);

    let configInstances = allInstances.get(configHash);

    if (!configInstances) {
      configInstances = new Map<string, Array<T>>();
      allInstances.set(configHash, configInstances);
    }

    const injectionArgsHash = this._hashInjectionArgs(injectionArgs);

    let argumentInstances = configInstances.get(injectionArgsHash);

    if (!argumentInstances) {
      argumentInstances = [];
      configInstances.set(injectionArgsHash, argumentInstances);
    }

    argumentInstances.push(instance);
  }

  private _hashConfig(config: any): string {
    return this._hashObject(config);
  }

  private _hashInjectionArgs(injectionArgs: Array<any>): string {
    return this._hashObject(injectionArgs);
  }

  private _hashObject(object: any): string {
    if (typeof object === 'undefined') {
      return undefined;
    }
    return hash(object, hashOptions);
  }



}