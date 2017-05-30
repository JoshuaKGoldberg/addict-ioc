import { IRegistry, IFactoryRegistration, IObjectRegistration, IInstanceCache, IContainer, RegistrationKey, IRegistration, IResolver, IContainerSettings, IResolutionContext, ITypeRegistrationSettings, ITypeRegistration, Type, IFactory, IFactoryAsync, IValidationError, IInstanceLookup, IInstanceWrapper } from './interfaces';
import {Registration} from './registration';
import {Registry} from './registry';
// import {ResolutionContext} from './resolution_context';
import {DefaultSettings} from './default_settings';
import {getPropertyDescriptor} from './utils';

import * as uuid from 'node-uuid';

export class Container<U extends IInstanceWrapper<any>> extends Registry implements IContainer<U> {

  public instances: IInstanceCache<any, U> = {};
  public settings: IContainerSettings;
  public parentContainer: IContainer<any>;

  constructor(settings: IContainerSettings = DefaultSettings, parentContainer?: IContainer<any>, parentRegistry?: IRegistry) {
    super(settings, parentRegistry);
    
    this.parentContainer = parentContainer;
    this.settings = Object.assign(Object.assign({}, DefaultSettings), settings);

    this.initialize();
  }

  public initialize(): void {
    // this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<any>>();
    super.initialize();

    this.instances = {};

    this.settings = this._mergeSettings(DefaultSettings, this.settings) as IContainerSettings;

    this.registerObject(this.settings.containerRegistrationKey, this);
  }

  public clear(): void {
    super.clear();
    this.initialize();
  }





  protected _orderDependencies(registration: IRegistration, results: Array<RegistrationKey>, missing: Array<RegistrationKey>, recursive: Array<Array<RegistrationKey>>, nest: Array<RegistrationKey> = []): void {
    
    for (let dependencyKey of registration.settings.dependencies) {

      dependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);

      if (results.indexOf(dependencyKey) !== -1) {
        return;
      }

      const dependency = this.getRegistration(dependencyKey);

      if (!dependency) {
        missing.push(dependencyKey);
      } else if (nest.indexOf(dependencyKey) > -1) {
        nest.push(dependencyKey);
        // TODO: circular breaks
        recursive.push(nest.slice(0));
        nest.pop();
      } else if (dependency.settings.dependencies.length) {
        nest.push(dependencyKey);
        this._orderDependencies(dependency, results, missing, recursive, nest);
        nest.pop();
      }
      results.push(dependencyKey);
    }
  }


  protected _createNewResolutionContext<T>(registration: IRegistration): IResolutionContext<T, U> {

    const id = this._createInstanceId();

    const currentResolution = {
        id: id,
        registration: registration,
        ownedInstances: []
      } as U;

    const resolutionContext = {
      currentResolution: currentResolution,
      instanceLookup: {},
      instanceResolutionOrder: []
    } as IResolutionContext<T, U>;

    resolutionContext.instanceLookup[id] = currentResolution;

    return resolutionContext;
  }


  public resolve<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): T {
    
    const registration = this.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);

    return this._resolve<T>(registration, resolutionContext, injectionArgs, config);
  }

  public resolveAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): Promise<T> {
    
    const registration = this.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);

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
    const registration = this.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);
    return this._resolveLazy<T>(registration, resolutionContext, injectionArgs, config);
  }

  public resolveLazyAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {
    const registration = this.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);
    return this._resolveLazyAsync<T>(registration, resolutionContext, injectionArgs, config);
  }

  protected _resolveLazy<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): IFactory<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): T => {

      const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);

      return this._resolve<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
    };
  }

  protected _resolveLazyAsync<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): Promise<T> => {

      const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);

      return this._resolveAsync<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
    };
  }

  protected _resolveObject<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const object = this._createObject<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(object, registration, configUsed);

    return object;
  }  

  protected async _resolveObjectAsync<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<any> {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const object = await this._createObjectAsync<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(object, registration, configUsed);

    return object;
  }  

  protected _resolveFactory<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const factory = this._createFactory<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(factory, registration, configUsed);

    return factory;
  }  

  protected async _resolveFactoryAsync<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T> {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const factory = this._createFactoryAsync<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(factory, registration, configUsed);

    return factory;
  }  

  protected _resolveTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): T {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    if (registration.settings.isSingleton) {
      return this._getTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
    }

    return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, configUsed);
  }

  protected async _resolveTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs?: Array<any>, config?: any): Promise<T> {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    if (registration.settings.isSingleton) {
      return await this._getTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
    }

    return await this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
  }

  protected _getTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): T {

    const instances = this._getCachedInstances<T>(registration, injectionArgs, config);

    if (instances.length === 0) {

      return this._getNewTypeInstance(registration, resolutionContext, injectionArgs, config);
    }

    return instances[0];
  }

  protected async _getTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const instances = this._getCachedInstances<T>(registration, injectionArgs, config);

    if (instances.length === 0) {

      return await this._getNewTypeInstanceAsync(registration, resolutionContext, injectionArgs, config);
    }

    return instances[0];
  }

  protected _getNewTypeInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): T {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    this._validateResolutionContext(registration, resolutionContext);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const instance = this._createType(registration, dependencies, injectionArgs);
    
    this._configureInstance(instance, registration, configUsed);

    this._cacheInstance(registration, resolutionContext, instance, injectionArgs, config);

    return instance;
  }

  protected async _getNewTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    this._validateResolutionContext(registration, resolutionContext);

    const dependencies = await this._resolveDependenciesAsync(registration, resolutionContext);

    const instance = await this._createType(registration, dependencies, injectionArgs);
    
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

    const resolvedDependencies = [];

    const dependencies = registration.settings.dependencies || [];

    for (const dependencyKey of dependencies) {

      const resolvedDependency = this._resolveDependency(registration, dependencyKey, resolutionContext);

      resolvedDependencies.push(resolvedDependency);
    }

    return resolvedDependencies;
  }

  protected async _resolveDependenciesAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext<T, U>): Promise<Array<any>> {

    const resolvedDependencies = [];

    const dependencies = registration.settings.dependencies || [];

    for (const dependencyKey of dependencies) {

      const resolvedDependency = await this._resolveDependencyAsync(registration, dependencyKey, resolutionContext);

      resolvedDependencies.push(resolvedDependency);
    }

    return resolvedDependencies;
  }

  protected _resolveDependency<T>(registration: IRegistration, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext<T, U>): any {
    
    const newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);

    const overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);

    const dependencyRegistration = this.getRegistration(overwrittenDependencyKey);

    if (!dependencyRegistration) {
      throw new Error(`dependency "${overwrittenDependencyKey}" of key "${registration.settings.key}" is missing`);
    }

    const isOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);
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
    
    const newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
    
    const overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);

    const dependencyRegistration = this.getRegistration(dependencyKey);

    if (this._isDependencyLazy(registration, dependencyKey)) {
      return await this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    if (this._isDependencyLazyAsync(registration, dependencyKey)) {
      return await this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
    }    

    const isOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);
    if (isOwned) {
      newResolutionContext.currentResolution.ownedBy = resolutionContext.currentResolution.id;
      resolutionContext.currentResolution.ownedInstances.push(newResolutionContext.currentResolution.id);
    }

    return await this._resolveAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
  }
  
  protected _createObject<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver = this._getResolver(registration);
    const object = resolver.resolveObject(this, registration);
    const createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
    return createdObject;
  }
  
  protected async _createObjectAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any> {
    const resolver = this._getResolver(registration);
    const object = await resolver.resolveObjectAsync(this, registration);
    const createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
    return createdObject;
  }
  
  protected _createFactory<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver = this._getResolver(registration);
    const type = resolver.resolveFactory(this, registration);
    const factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
    return factory;
  }
  
  protected async _createFactoryAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any> {
    const resolver = this._getResolver(registration);
    const type = await resolver.resolveFactoryAsync(this, registration);
    const factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
    return factory;
  }
  
  protected _createType<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver = this._getResolver(registration);
    const type = resolver.resolveType(this, registration);
    const factory = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
    return factory;
  }
  
  protected async _createTypeAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<T> {
    const resolver = this._getResolver(registration);
    const type = await resolver.resolveTypeAsync(this, registration);
    const instance = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
    return instance;
  }

  protected _getResolver<T>(registration: IRegistration): IResolver<T, U> {
    return registration.settings.resolver || this.settings.resolver;
  }

  protected _configureInstance(instance: any, registration: IRegistration, runtimeConfig?: any): void {

    if (!registration.settings.config && !runtimeConfig) {
      return;
    }

    const configPropertyDescriptor = getPropertyDescriptor(instance, 'config');

    if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
      const instancePrototype = Object.getPrototypeOf(instance);

      throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
    }

    const resolver = this._getResolver(registration);
    const resolvedConfig = resolver.resolveConfig(registration.settings.config);

    const resultConfig = runtimeConfig ? this._mergeConfigs(resolvedConfig, runtimeConfig) : resolvedConfig;

    instance.config = resultConfig;
  }

  protected _getCachedInstances<T>(registration: IRegistration, injectionArgs: Array<any>, config: any): Array<T> {

    const key = registration.settings.key;
    const resolver = this._getResolver(registration);

    if (!this.instances) {
      // this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<T>>();
      this.instances = {};
    }

    const allInstances = this.instances[key];
    if (!allInstances) {
      return [];
    }

    const configHash = resolver.hashConfig(config);

    const configInstances = allInstances[configHash];

    if (!configInstances) {
      return [];
    }

    const injectionArgsHash = resolver.hash(injectionArgs);

    const argumentInstances = configInstances[injectionArgsHash];

    if (!argumentInstances) {
      return [];
    }

    return argumentInstances;
  }

  protected _createInstanceId(): string {
    return uuid.v4();
  }

  protected _cacheInstance<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>, instance: any, injectionArgs: Array<any>, config: any): void {
  
    const key = registration.settings.key;

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

    const resolver = this._getResolver(registration);

    if (!this.instances) {
      this.instances = {};
    }

    let allInstances = this.instances[key];

    if (!allInstances) {
      allInstances = this.instances[key] = {};
    }

    const configHash = resolver.hashConfig(config);

    let configInstances = allInstances[configHash];

    if (!configInstances) {
      configInstances = allInstances[configHash] = {};
    }

    const injectionArgsHash = resolver.hash(injectionArgs);

    let argumentInstances = configInstances[injectionArgsHash];

    if (!argumentInstances) {
      argumentInstances = configInstances[injectionArgsHash] = [];
    }

    argumentInstances.push(instance);
  }

  public validateDependencies(...keys: Array<RegistrationKey>): Array<IValidationError> {
    const validationKeys = keys.length > 0 ? keys : this.getRegistrationKeys();
    const errors = this._validateDependencies(validationKeys);
    
    if (errors.length > 0) {
      console.log('------------------');
      console.log(errors);
      console.log('------------------');
      
      throw new Error('fuck');
    }

    return errors;
  }


  protected _validateDependencies(keys: Array<RegistrationKey>, history: Array<IRegistration> = []): Array<IValidationError> {

    const errors = [];

    for (const key of keys) {
      const registration = this.getRegistration(key);

      if (!registration) {

        const errorMessage = `registration for key '${key}' is missing.`;

        const validationError = this._createValidationError(registration, history, errorMessage);
        errors.push(validationError);

        return;
      }

      if (history.indexOf(registration) > 0) {

        const errorMessage = `circular dependency on key '${registration.settings.key}' detected.`;
        
        const validationError = this._createValidationError(registration, history, errorMessage);
        errors.push(validationError);

        return;
      }

      history.push(registration);

      if (!registration.settings.dependencies) {
        return;
      }

      for (const dependencyKey of registration.settings.dependencies) {
        const deepErrors = this._validateDependency(registration, dependencyKey, history);
        Array.prototype.push.apply(errors, deepErrors);
      }

    }

    return errors;
  }
  

  protected _validateDependency(registration: IRegistration, dependencyKey: RegistrationKey, history: Array<IRegistration>) {

    const newRegistrationHistory = [];
    Array.prototype.push.apply(newRegistrationHistory, history);

    const errors = [];

    const dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, dependencyKey);
    const dependency = this.getRegistration(dependencyKeyOverwritten);

    if (!dependency) {
      
      const errorMessage = `dependency '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`;
      const validationError = this._createValidationError(registration, history, errorMessage);
      errors.push(validationError);
    
  } else if (dependency.settings.dependencies) {

      const overwrittenKeyValidationErrors = this._validateOverwrittenKeys(registration, newRegistrationHistory);
      Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);

      const circularBreakFound = this._historyHasCircularBreak(newRegistrationHistory, dependency);

      if (!circularBreakFound) {
        const deepErrors = this._validateDependencies([dependencyKey], newRegistrationHistory);
        Array.prototype.push.apply(errors, deepErrors);
      }
    }

    return errors;
  }

  protected _historyHasCircularBreak(history: Array<IRegistration>, dependency: IRegistration) {

    return history.some((parentRegistration) => {

      const parentSettings = parentRegistration.settings;

      if (this.settings.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
        return true;
      }

      if (this.settings.circularDependencyCanIncludeLazy && parentSettings.wantsLazyInjection && parentSettings.lazyDependencies.length > 0) {

        if (parentSettings.wantsLazyInjection ||
          parentSettings.lazyDependencies.indexOf(dependency.settings.key) >= 0) {

          return true;
        }
        if (parentSettings.wantsPromiseLazyInjection ||
          parentSettings.lazyPromiseDependencies.indexOf(dependency.settings.key) >= 0) {

          return true;
        }
      }
    });
  }

  protected _createValidationError(registration: IRegistration, history: Array<IRegistration>, errorMessage: string): IValidationError {

      const validationError: IValidationError = {
        registrationStack: history,
        currentRegistration: registration,
        errorMessage: errorMessage
      };

      return validationError;
  }

  protected _validateOverwrittenKeys(registration: IRegistration, history: Array<IRegistration>): Array<IValidationError> {

    const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);

    const errors = [];

    for (const overwrittenKey of overwrittenKeys) {
      const keyErrors = this._validateOverwrittenKey(registration, overwrittenKey, history);
      Array.prototype.push.apply(errors, keyErrors);
    }

    return errors;
  }

  protected _validateOverwrittenKey(registration: IRegistration, overwrittenKey: RegistrationKey, history: Array<IRegistration>): Array<IValidationError> {

    const errors = [];

    if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {
      const errorMessage = `No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`;
      const validationError = this._createValidationError(registration, history, errorMessage);
      errors.push(validationError);
    }

    const overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
    const overwrittenKeyRegistration = this.getRegistration(overwrittenKeyValue);

    if (!overwrittenKeyRegistration) {
      const errorMessage = `Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`;
      const validationError = this._createValidationError(registration, history, errorMessage);
      errors.push(validationError);
    }

    return errors;
  }

  protected _mergeArguments(existingArgs: Array<any> = [], newArgs: Array<any> = []): Array<any> {

    const finalArgs = [];

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

    const registrationConfig = this._resolveConfig(registration, registration.settings.config);
    const runtimeConfig = this._resolveConfig(registration, config);

    const configUsed = this._mergeConfigs(registrationConfig, runtimeConfig);

    return configUsed;
  }

  protected _resolveConfig<T>(registration: IRegistration, config: any): any {
    const resolver = this._getResolver(registration);
    return resolver.resolveConfig(config);
  }

  protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IResolutionContext<T, U>): IResolutionContext<T, U> {

    const newResolutionContext = this._cloneResolutionContext(resolutionContext);
    
    const id = this._createInstanceId();

    newResolutionContext.currentResolution = <U>{
      id: id,
    };

    resolutionContext.instanceLookup[id] = newResolutionContext.currentResolution;
    
    const ownedDependencies = registration.settings.ownedDependencies || [];

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
    
    if (!registration.settings.wantsPromiseLazyInjection) {
      return false;
    }
    
    return registration.settings.lazyPromiseDependencies.length === 0 || registration.settings.lazyPromiseDependencies.indexOf(dependencyKey) >= 0;
  }

  protected _isDependencyOwned<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {
    // TODO: apply to graph
    if (!registration.settings.ownedDependencies) {
      return false;
    }
    
    return registration.settings.ownedDependencies.length !== 0 && registration.settings.ownedDependencies.indexOf(dependencyKey) >= 0;
  }

  protected _getDependencyKeyOverwritten(registration: IRegistration, dependencyKey: RegistrationKey) {

    let finalDependencyKey = dependencyKey;

    if (registration.settings.overwrittenKeys[dependencyKey]) {

      finalDependencyKey = registration.settings.overwrittenKeys[dependencyKey];
    }

    return finalDependencyKey;
  }

}