import {defaultSettings} from './default_settings';
import { IContainer, IContainerSettings, IFactory, IFactoryAsync, IFactoryRegistration, IInstanceCache, IInstanceLookup,
  IInstanceWrapper, IObjectRegistration, IRegistration, IRegistrationSettings, IRegistry, IResolutionContext, IResolver,
  ITypeRegistration, ITypeRegistrationSettings, IValidationResults, RegistrationKey, Type } from './interfaces';
import {Registration} from './registration';
import {Registry} from './registry';
import {getPropertyDescriptor} from './utils';

// tslint:disable:no-console

import * as uuid from 'node-uuid';

export class Container<U extends IInstanceWrapper<any> = IInstanceWrapper<any>> extends Registry implements IContainer<U> {

  public instances: IInstanceCache<any, U> = {};
  public settings: IContainerSettings;
  public parentContainer: IContainer<any>;

  constructor(settings: IContainerSettings = defaultSettings, parentContainer?: IContainer<any>, parentRegistry?: IRegistry) {
    super(settings, parentRegistry);

    this.parentContainer = parentContainer;
    this.settings = Object.assign(Object.assign({}, defaultSettings), settings);

    this.initialize();
  }

  public initialize(): void {
    // this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<any>>();
    super.initialize();

    this.instances = {};

    this.settings = this._mergeSettings(defaultSettings, this.settings) as IContainerSettings;

    this.registerObject(this.settings.containerRegistrationKey, this);
  }

  public clear(): void {
    super.clear();
    this.initialize();
  }

  protected _orderDependencies(registration: IRegistration, results: IValidationResults, nest: Array<RegistrationKey> = []): void {

    for (const dependencyKey of registration.settings.dependencies) {

      if (results.order.indexOf(dependencyKey) !== -1) {
        return;
      }

      const dependency: IRegistration = this.getRegistration(dependencyKey);

      if (!dependency) {
        results.missing.push(dependencyKey);
      } else if (nest.indexOf(dependencyKey) > -1) {
        nest.push(dependencyKey);
        // TODO: circular breaks
        results.recursive.push(nest.slice(0));
        nest.pop();
      } else if (dependency.settings.dependencies.length) {
        nest.push(dependencyKey);
        this._orderDependencies(dependency, results, nest);
        nest.pop();
      }
      results.order.push(dependencyKey);
    }
  }

  public validateDependencies(...keys: Array<RegistrationKey>): Array<string> {

    const validationKeys: Array<string> = keys.length > 0 ? keys : this.getRegistrationKeys();
    const errors: Array<string> = [];

    for (const key of validationKeys) {

      const registration: IRegistration = this.getRegistration(key);

      const results: any = {
        order: [],
        missing: [],
        recursive: [],
      };

      errors.concat(this._valDependencies(registration, results));
      if (results.missing.length > 0) {
        for (const miss of results.missing) {
          errors.push(`registration for key "${miss}" is missing`);
        }
      }
      if (results.recursive.length > 0) {
        for (const recurs of results.recursive) {
          errors.push(`recursive dependency detected: ` + recurs.join(' -> '));
        }
      }
    }

    if (errors.length > 0) {
      console.log('.................');
      console.log(errors);
      console.log('.................');
      throw new Error('validation failed');
    }
    return errors;
  }

  protected _valDependencies(registration: IRegistration, results: IValidationResults, nest: Array<IRegistration> = []): Array<string> {

    const errors: Array<string> = [];

    errors.concat(this._validateOverwrittenKeys(registration));

    for (let dependencyKey of registration.settings.dependencies) {

      dependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);

      if (results.order.indexOf(dependencyKey) !== -1) {
        return;
      }

      const dependency: IRegistration = this.getRegistration(dependencyKey);

      if (!dependency) {
        results.missing.push(dependencyKey);
      } else if (nest.indexOf(dependency) > -1) {

        if (!this._historyHasCircularBreak(nest, dependency)) {
          nest.push(dependency);
          results.recursive.push(nest.slice(0).map((recursiveRegistration: IRegistration) => recursiveRegistration.settings.key));
          nest.pop();
        }

      } else if (dependency.settings.dependencies.length) {
        nest.push(dependency);
        errors.concat(this._valDependencies(dependency, results, nest));
        nest.pop();
      }
      results.order.push(dependencyKey);
    }

    return errors;
  }

  protected _createNewResolutionContext<T>(registration: IRegistration): IResolutionContext<T, U> {

    const id: string = this._createInstanceId();

    const currentResolution: U = {
        id: id,
        registration: registration,
        ownedInstances: [],
    } as U;

    const resolutionContext: IResolutionContext<T, U> = {
      currentResolution: currentResolution,
      instanceLookup: {},
      instanceResolutionOrder: [],
    };

    resolutionContext.instanceLookup[id] = currentResolution;

    return resolutionContext;
  }

  public resolve<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): T {

    const registration: IRegistration = this.getRegistration(key);

    if (!registration) {
      throw new Error(`registration for key "${key}" not found`);
    }

    const resolutionContext: IResolutionContext<T, U> = this._createNewResolutionContext<T>(registration);

    return this._resolve<T>(registration, resolutionContext, injectionArgs, config);
  }

  public resolveAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const registration: IRegistration = this.getRegistration(key);

    if (!registration) {
      throw new Error(`registration for key "${key}" not found`);
    }

    const resolutionContext: IResolutionContext<T, U> = this._createNewResolutionContext(registration);

    return this._resolveAsync<T>(registration, resolutionContext, injectionArgs, config);
  }

  protected _resolve<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): T {

    if (registration.settings.isObject) {
      return this._resolveObject(registration as IObjectRegistration<T>, resolutionContext, injectionArgs, config);
    }

    if (registration.settings.isFactory) {
      return this._resolveFactory(registration as IFactoryRegistration<T>, resolutionContext, injectionArgs, config);
    }

    return this._resolveTypeInstance<T>(registration as ITypeRegistration<T>, resolutionContext, injectionArgs, config);
  }

  protected async _resolveAsync<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    if (registration.settings.isObject) {
      return await this._resolveObjectAsync<T>(registration as IObjectRegistration<T>, resolutionContext, injectionArgs, config);
    }

    if (registration.settings.isFactory) {
      return await this._resolveFactoryAsync<T>(registration as IFactoryRegistration<T>, resolutionContext, injectionArgs, config);
    }

    return await this._resolveTypeInstanceAsync<T>(registration as ITypeRegistration<T>, resolutionContext, injectionArgs, config);
  }

  public resolveLazy<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): IFactory<T> {

    const registration: IRegistration = this.getRegistration(key);

    if (!registration) {
      throw new Error(`registration for key "${key}" not found`);
    }

    const resolutionContext: IResolutionContext<T, U> = this._createNewResolutionContext(registration);
    return this._resolveLazy<T>(registration, resolutionContext, injectionArgs, config);
  }

  public resolveLazyAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {

    const registration: IRegistration = this.getRegistration(key);

    if (!registration) {
      throw new Error(`registration for key "${key}" not found`);
    }

    const resolutionContext: IResolutionContext<T, U> = this._createNewResolutionContext(registration);
    return this._resolveLazyAsync<T>(registration, resolutionContext, injectionArgs, config);
  }

  protected _resolveLazy<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): IFactory<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): T => {

      const injectionArgsUsed: Array<any> = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed: any = this._mergeConfigs(config, lazyConfig);

      return this._resolve<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
    };
  }

  protected _resolveLazyAsync<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): Promise<T> => {

      const injectionArgsUsed: Array<any> = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed: any = this._mergeConfigs(config, lazyConfig);

      return this._resolveAsync<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
    };
  }

  protected _resolveObject<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    const dependencies: Array<any> = this._resolveDependencies(registration, resolutionContext);

    const object: T = this._createObject<T>(registration, dependencies, injectionArgs);

    this._configureInstance(object, registration, configUsed);

    return object;
  }

  protected async _resolveObjectAsync<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<any> {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    const dependencies: Array<any> = this._resolveDependencies(registration, resolutionContext);

    const object: T = await this._createObjectAsync<T>(registration, dependencies, injectionArgs);

    this._configureInstance(object, registration, configUsed);

    return object;
  }

  protected _resolveFactory<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    const dependencies: Array<any> = this._resolveDependencies(registration, resolutionContext);

    const factory: T = this._createFactory<T>(registration, dependencies, injectionArgs);

    this._configureInstance(factory, registration, configUsed);

    return factory;
  }

  protected async _resolveFactoryAsync<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T> {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    const dependencies: Array<any> = this._resolveDependencies(registration, resolutionContext);

    const factory: T = await this._createFactoryAsync<T>(registration, dependencies, injectionArgs);

    this._configureInstance(factory, registration, configUsed);

    return factory;
  }

  protected _resolveTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    if (registration.settings.isSingleton) {
      return this._getTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
    }

    return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
  }

  protected async _resolveTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T> {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    if (registration.settings.isSingleton) {
      return await this._getTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
    }

    return await this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
  }

  protected _getTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): T {

    const instances: Array<T> = this._getCachedInstances<T>(registration, injectionArgs, config);

    if (instances.length === 0) {

      return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, config);
    }

    return instances[0];
  }

  protected async _getTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const instances: Array<T>  = this._getCachedInstances<T>(registration, injectionArgs, config);

    if (instances.length === 0) {

      return await this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, config);
    }

    return instances[0];
  }

  protected _getNewTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): T {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    this._validateResolutionContext(registration, resolutionContext);

    const dependencies: Array<any> = this._resolveDependencies(registration, resolutionContext);

    const instance: T = this._createType<T>(registration, dependencies, injectionArgs);

    this._configureInstance(instance, registration, configUsed);

    this._cacheInstance(registration, resolutionContext, instance, injectionArgs, config);

    return instance;
  }

  protected async _getNewTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const configUsed: any = this._mergeRegistrationConfig(registration, config);

    this._validateResolutionContext(registration, resolutionContext);

    const dependencies: Array<any> = await this._resolveDependenciesAsync(registration, resolutionContext);

    const instance: T = await this._createType<T>(registration, dependencies, injectionArgs);

    this._configureInstance(instance, registration, configUsed);

    this._cacheInstance(registration, resolutionContext, instance, injectionArgs, config);

    return instance;
  }

  protected _validateResolutionContext<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>): void {

    // TODO: redo runtime validation
    // const historyIndex = resolutionContext.history.indexOf(resolutionContext.currentResolution.id);

    // if (historyIndex === 0) {
    //   return;
    // }

    // further validation
  }

  protected _resolveDependencies<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>): Array<any> {

    const resolvedDependencies: Array<any> = [];

    const dependencies: Array<string> = registration.settings.dependencies || [];

    for (const dependencyKey of dependencies) {

      const resolvedDependency: any = this._resolveDependency(registration, dependencyKey, resolutionContext);

      resolvedDependencies.push(resolvedDependency);
    }

    return resolvedDependencies;
  }

  protected async _resolveDependenciesAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>): Promise<Array<any>> {

    const resolvedDependencies: Array<any> = [];

    const dependencies: Array<string> = registration.settings.dependencies || [];

    for (const dependencyKey of dependencies) {

      const resolvedDependency: any = await this._resolveDependencyAsync(registration, dependencyKey, resolutionContext);

      resolvedDependencies.push(resolvedDependency);
    }

    return resolvedDependencies;
  }

  protected _resolveDependency<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext<T, U>): any {

    const newResolutionContext: IResolutionContext<any, U> = this._createChildResolutionContext(registration, resolutionContext);

    const overwrittenDependencyKey: string = this._getDependencyKeyOverwritten(registration, dependencyKey);

    const dependencyRegistration: IRegistration = this.getRegistration(overwrittenDependencyKey);

    newResolutionContext.currentResolution.registration = dependencyRegistration;

    if (!dependencyRegistration) {
      throw new Error(`dependency "${overwrittenDependencyKey}" of key "${registration.settings.key}" is missing`);
    }

    const isOwned: boolean = this._isDependencyOwned(registration, overwrittenDependencyKey);
    if (isOwned) {
      newResolutionContext.currentResolution.ownedBy = resolutionContext.currentResolution.id;
      resolutionContext.currentResolution.ownedInstances.push(newResolutionContext.currentResolution.id);
    }

    if (this._isDependencyLazy(registration, overwrittenDependencyKey)) {
      return this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    if (this._isDependencyLazyAsync(registration, overwrittenDependencyKey)) {
      return this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    return this._resolve(dependencyRegistration, newResolutionContext, undefined, undefined);
  }

  protected async _resolveDependencyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext<T, U>): Promise<any> {

    const newResolutionContext: IResolutionContext<any, U> = this._createChildResolutionContext(registration, resolutionContext);

    const overwrittenDependencyKey: string = this._getDependencyKeyOverwritten(registration, dependencyKey);

    const dependencyRegistration: IRegistration = this.getRegistration(dependencyKey);

    newResolutionContext.currentResolution.registration = dependencyRegistration;

    if (this._isDependencyLazy(registration, dependencyKey)) {
      return await this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    if (this._isDependencyLazyAsync(registration, dependencyKey)) {
      return await this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    const isOwned: boolean = this._isDependencyOwned(registration, overwrittenDependencyKey);
    if (isOwned) {
      newResolutionContext.currentResolution.ownedBy = resolutionContext.currentResolution.id;
      resolutionContext.currentResolution.ownedInstances.push(newResolutionContext.currentResolution.id);
    }

    return await this._resolveAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
  }

  protected _createObject<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver: IResolver<T, U> = this._getResolver(registration);
    const object: any = resolver.resolveObject(this, registration);
    const createdObject: T = resolver.createObject(this, object, registration, dependencies, injectionArgs);
    return createdObject;
  }

  protected async _createObjectAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any> {
    const resolver: IResolver<T, U> = this._getResolver(registration);
    const object: any = await resolver.resolveObjectAsync(this, registration);
    const createdObject: T = resolver.createObject(this, object, registration, dependencies, injectionArgs);
    return createdObject;
  }

  protected _createFactory<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver: IResolver<T, U> = this._getResolver(registration);
    const type: any = resolver.resolveFactory(this, registration);
    const factory: T = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
    return factory;
  }

  protected async _createFactoryAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any> {
    const resolver: IResolver<T, U> = this._getResolver(registration);
    const type: any = await resolver.resolveFactoryAsync(this, registration);
    const factory: T = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
    return factory;
  }

  protected _createType<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver: IResolver<T, U> = this._getResolver(registration);
    const type: any = resolver.resolveType(this, registration);
    const factory: T = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
    return factory;
  }

  protected async _createTypeAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<T> {
    const resolver: IResolver<T, U> = this._getResolver(registration);
    const type: any = await resolver.resolveTypeAsync(this, registration);
    const instance: T = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
    return instance;
  }

  protected _getResolver<T>(registration: IRegistration): IResolver<T, U> {
    return registration.settings.resolver || this.settings.resolver;
  }

  protected _configureInstance<T>(instance: T, registration: IRegistration, runtimeConfig?: any): void {

    if (!registration.settings.config && !runtimeConfig) {
      return;
    }

    const configPropertyDescriptor: PropertyDescriptor = getPropertyDescriptor(instance, 'config');

    if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
      const instancePrototype: any = Object.getPrototypeOf(instance);

      throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
    }

    const resolver: IResolver<T, U> = this._getResolver(registration);
    const resolvedConfig: any = resolver.resolveConfig(registration.settings.config);

    const resultConfig: any = runtimeConfig ? this._mergeConfigs(resolvedConfig, runtimeConfig) : resolvedConfig;

    (instance as any).config = resultConfig;
  }

  protected _getCachedInstances<T>(registration: IRegistration, injectionArgs: Array<any>, config: any): Array<T> {

    const key: string = registration.settings.key;
    const resolver: IResolver<T, U> = this._getResolver(registration);

    if (!this.instances) {
      // this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<T>>();
      this.instances = {};
    }

    const allInstances: any = this.instances[key];
    if (!allInstances) {
      return [];
    }

    const configHash: string = resolver.hashConfig(config);

    const configInstances: any = allInstances[configHash];

    if (!configInstances) {
      return [];
    }

    const injectionArgsHash: string = resolver.hash(injectionArgs);

    const argumentInstances: Array<any> = configInstances[injectionArgsHash];

    if (!argumentInstances) {
      return [];
    }

    return argumentInstances;
  }

  protected _createInstanceId(): string {
    return uuid.v4();
  }

  protected _cacheInstance<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, instance: any, injectionArgs: Array<any>, config: any): void {

    const key: string = registration.settings.key;

    // const instanceId = resolutionContext.cu.currentId;

    // const instanceWrapper =  {
    //   id: instanceId,
    //   registration: registration,
    //   instance: instance
    // };

    if (!resolutionContext.instanceLookup) {
      resolutionContext.instanceLookup = {};
    }

    resolutionContext.currentResolution.instance = instance;
    resolutionContext.instanceResolutionOrder.push(resolutionContext.currentResolution.id);

    if (!registration.settings.isSingleton) {
      return;
    }

    const resolver: IResolver<T, U> = this._getResolver(registration);

    if (!this.instances) {
      this.instances = {};
    }

    let allInstances: any = this.instances[key];

    if (!allInstances) {
      allInstances = this.instances[key] = {};
    }

    const configHash: string = resolver.hashConfig(config);

    let configInstances: any = allInstances[configHash];

    if (!configInstances) {
      configInstances = allInstances[configHash] = {};
    }

    const injectionArgsHash: string = resolver.hash(injectionArgs);

    let argumentInstances: any = configInstances[injectionArgsHash];

    if (!argumentInstances) {
      argumentInstances = configInstances[injectionArgsHash] = [];
    }

    argumentInstances.push(instance);
  }

  public validateDependencies2(...keys: Array<RegistrationKey>): Array<string> {
    const validationKeys: Array<string> = keys.length > 0 ? keys : this.getRegistrationKeys();
    const errors: Array<string> = this._validateDependencies(validationKeys);
    if (errors.length > 0) {
      console.log('.................');
      console.log(errors);
      console.log('.................');
      throw new Error('validation failed');
    }
    return errors;
  }

  protected _validateDependencies(keys: Array<RegistrationKey>, history: Array<IRegistration> = []): Array<string> {

    const errors: Array<string> = [];

    for (const key of keys) {
      const registration: IRegistration = this.getRegistration(key);

      if (!registration) {

        errors.push(`registration for key '${key}' is missing.`);

        return;
      }

      if (history.indexOf(registration) > 0) {

        errors.push(`circular dependency on key '${registration.settings.key}' detected.`);

        return;
      }

      history.push(registration);

      if (!registration.settings.dependencies) {
        return;
      }

      for (const dependencyKey of registration.settings.dependencies) {
        const deepErrors: Array<string> = this._validateDependency(registration, dependencyKey, history);
        Array.prototype.push.apply(errors, deepErrors);
      }

    }

    return errors;
  }

  protected _validateDependency(registration: IRegistration, dependencyKey: RegistrationKey, history: Array<IRegistration>): Array<string> {

    const newRegistrationHistory: Array<IRegistration> = [];
    Array.prototype.push.apply(newRegistrationHistory, history);

    const errors: Array<string> = [];

    const dependencyKeyOverwritten: string = this._getDependencyKeyOverwritten(registration, dependencyKey);
    const dependency: IRegistration = this.getRegistration(dependencyKeyOverwritten);

    if (!dependency) {

      errors.push(`dependency '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`);

    } else {

      const overwrittenKeyValidationErrors: Array<string> = this._validateOverwrittenKeys(dependency);
      Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);

      if (dependency.settings.dependencies) {

        const circularBreakFound: boolean = this._historyHasCircularBreak(newRegistrationHistory, dependency);

        if (!circularBreakFound) {
          const deepErrors: Array<string> = this._validateDependencies(dependency.settings.dependencies, newRegistrationHistory);
          Array.prototype.push.apply(errors, deepErrors);
        }
      }
    }

    return errors;
  }

  protected _historyHasCircularBreak(history: Array<IRegistration>, dependency: IRegistration): boolean {

    return history.some((parentRegistration: IRegistration) => {

      const parentSettings: IRegistrationSettings = parentRegistration.settings;

      if (this.settings.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
        return true;
      }

      if (this.settings.circularDependencyCanIncludeLazy && parentSettings.wantsLazyInjection) {

        if (parentSettings.wantsLazyInjection ||
          parentSettings.lazyDependencies.indexOf(dependency.settings.key) >= 0) {

          return true;
        }
        if (parentSettings.wantsLazyInjectionAsync ||
          parentSettings.lazyDependenciesAsync.indexOf(dependency.settings.key) >= 0) {

          return true;
        }
      }
    });
  }

  protected _validateOverwrittenKeys(registration: IRegistration): Array<string> {

    const overwrittenKeys: Array<string> = Object.keys(registration.settings.overwrittenKeys);

    const errors: Array<string> = [];

    for (const overwrittenKey of overwrittenKeys) {
      const keyErrors: Array<string> = this._validateOverwrittenKey(registration, overwrittenKey);
      Array.prototype.push.apply(errors, keyErrors);
    }

    return errors;
  }

  protected _validateOverwrittenKey(registration: IRegistration, overwrittenKey: RegistrationKey): Array<string> {

    const errors: Array<string> = [];

    if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
      const errorMessage: string = `No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`;
      errors.push(errorMessage);
    }

    const overwrittenKeyValue: string = registration.settings.overwrittenKeys[overwrittenKey];
    const overwrittenKeyRegistration: IRegistration = this.getRegistration(overwrittenKeyValue);

    if (!overwrittenKeyRegistration) {
      const errorMessage: string = `Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`;
      errors.push(errorMessage);
    }

    return errors;
  }

  protected _mergeArguments(existingArgs: Array<any> = [], newArgs: Array<any> = []): Array<any> {

    const finalArgs: Array<any> = [];

    Array.prototype.push.apply(finalArgs, existingArgs);
    Array.prototype.push.apply(finalArgs, newArgs);

    return finalArgs;
  }

  protected _mergeConfigs(existingConfig: any, newConfig: any): any {

    if (!existingConfig) {
      return newConfig;
    }

    if (!newConfig) {
      return existingConfig;
    }

    return { ...existingConfig, ...newConfig };
  }

  protected _mergeRegistrationConfig<T>(registration: ITypeRegistration<T>, config?: any): any {

    const registrationConfig: any = this._resolveConfig(registration, registration.settings.config);
    const runtimeConfig: any = this._resolveConfig(registration, config);

    const configUsed: any = this._mergeConfigs(registrationConfig, runtimeConfig);

    return configUsed;
  }

  protected _resolveConfig<T>(registration: IRegistration, config: any): any {
    const resolver: IResolver<T, U> = this._getResolver(registration);
    return resolver.resolveConfig(config);
  }

  protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>): IResolutionContext<T, U> {

    const newResolutionContext: IResolutionContext<T, U> = this._cloneResolutionContext(resolutionContext);

    const id: string = this._createInstanceId();

    newResolutionContext.currentResolution = <U> {
      id: id,
    };

    resolutionContext.instanceLookup[id] = newResolutionContext.currentResolution;

    const ownedDependencies: Array<string> = registration.settings.ownedDependencies || [];

    // TODO: checken was hiermit is
    // ownedDependencies.forEach((ownedDependency) => {
    //   newResolutionContext.owners[ownedDependency] = registration as ITypeRegistration<T>;
    // });

    return newResolutionContext;
  }

  protected _cloneResolutionContext<T>(resolutionContext: IResolutionContext<T, U>): IResolutionContext<T, U> {
    return Object.assign({}, resolutionContext);
  }

  protected _isDependencyLazy<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {

    if (!registration.settings.wantsLazyInjection) {
      return false;
    }

    return registration.settings.lazyDependencies.length === 0 || registration.settings.lazyDependencies.indexOf(dependencyKey) >= 0;
  }

  protected _isDependencyLazyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {

    if (!registration.settings.wantsLazyInjectionAsync) {
      return false;
    }

    return registration.settings.lazyDependenciesAsync.length === 0 || registration.settings.lazyDependenciesAsync.indexOf(dependencyKey) >= 0;
  }

  protected _isDependencyOwned<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {
    // TODO: apply to graph
    if (!registration.settings.ownedDependencies) {
      return false;
    }

    return registration.settings.ownedDependencies.length !== 0 && registration.settings.ownedDependencies.indexOf(dependencyKey) >= 0;
  }

  protected _getDependencyKeyOverwritten(registration: IRegistration, dependencyKey: RegistrationKey): string {

    let finalDependencyKey: string = dependencyKey;

    if (registration.settings.overwrittenKeys[dependencyKey]) {

      finalDependencyKey = registration.settings.overwrittenKeys[dependencyKey];
    }

    return finalDependencyKey;
  }

}
