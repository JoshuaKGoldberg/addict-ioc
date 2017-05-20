import {IRegistry, IFactoryRegistration, IObjectRegistration, IInstanceCache, IInstanceWithConfigCache, IInstanceWithInjectionArgsCache, IContainer, RegistrationKey, IRegistration, IResolver, IContainerSettings, IResolutionContext, ITypeRegistrationSettings, ITypeRegistration, Type, IFactory, IFactoryAsync, IValidationError} from './interfaces';
import {Registration} from './registration';
import {Registry} from './registry';
import {ResolutionContext} from './resolution_context';
import {DefaultSettings} from './default_settings';
import {getPropertyDescriptor} from './utils';

export class Container extends Registry implements IContainer {

  public instances: IInstanceCache<any>;
  public settings: IContainerSettings;
  public parentContainer: IContainer;

  constructor(settings: IContainerSettings = DefaultSettings, parentContainer?: IContainer, parentRegistry?: IRegistry) {
    super(Object.assign(Object.assign({}, DefaultSettings), settings), parentRegistry);
    
    this.parentContainer = parentContainer;
    this.settings = Object.assign(Object.assign({}, DefaultSettings), settings);

    this.initialize();
  }

  public initialize(): void {
    this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<any>>();
    this.registerObject(this.settings.containerRegistrationKey, this);
  }

  public clear(): void {
    super.clear();
    this.initialize();
  }





  private _orderDependencies(registration: IRegistration, results: Array<RegistrationKey>, missing: Array<RegistrationKey>, recursive: Array<Array<RegistrationKey>>, nest: Array<RegistrationKey> = []): void {
    
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

  public newResolve<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): T {

    const dependencyResolutionOrder = [];
    const missingDependencies = [];
    const recursiveDependencyResolutionGraphs = [];
    
    const registration = this.getRegistration<T>(key);
    
    this._orderDependencies(registration.settings.dependencies, dependencyResolutionOrder, missingDependencies, recursiveDependencyResolutionGraphs);

    dependencyResolutionOrder.forEach((dependencyKey) => {

      const dependency = this.getRegistration<T>(dependencyKey);

      this._getInstance<T>(dependency, undefined, undefined, undefined);
    });

    return this._getInstance<T>(registration, null, injectionArgs, config);
  }











  public resolve<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): T {
    const registration = super.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);

    return this._resolve<T>(registration, resolutionContext, injectionArgs, config);
  }

  private _resolve<T>(registration: IRegistration, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): T {

    if (registration.settings.isObject) {
      return this._resolveObject(registration as IObjectRegistration<T>, resolutionContext, injectionArgs, config);
    }

    if (registration.settings.isFactory) {
      return this._resolveFactory(registration as IFactoryRegistration<T>, resolutionContext, injectionArgs, config);
    }

    return this._resolve<T>(registration as ITypeRegistration<T>, resolutionContext, injectionArgs, config);
  }

  private async _resolveAsync<T>(registration: IRegistration, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    if (registration.settings.isObject) {
      return await this._resolveObjectAsync<T>(registration as IObjectRegistration<T>, resolutionContext, injectionArgs, config);
    }

    if (registration.settings.isFactory) {
      return await this._resolveFactoryAsync<T>(registration as IFactoryRegistration<T>, resolutionContext, injectionArgs, config);
    }

    return await this._resolveInstanceAsync<T>(registration as ITypeRegistration<T>, resolutionContext, injectionArgs, config);
  }

  

  public resolveAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): Promise<T> {
    const registration = super.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);

    if (registration.settings.isObject) {
      return this._resolveObjectAsync<T>(registration as IObjectRegistration<T>, resolutionContext, injectionArgs, config);
    }

    if (registration.settings.isFactory) {
      return this._resolveFactoryAsync<T>(registration as IFactoryRegistration<T>, resolutionContext, injectionArgs, config);
    }

    return this._resolveInstanceAsync<T>(registration as ITypeRegistration<T>, resolutionContext, injectionArgs, config);
  }

  public resolveLazy<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): IFactory<T> {
    const registration = super.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);
    return this._resolveLazy<T>(registration, resolutionContext, injectionArgs, config);
  }

  public resolveLazyAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {
    const registration = super.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext(registration);
    return this._resolveLazyAsync<T>(registration, resolutionContext, injectionArgs, config);
  }

  private _resolveLazy<T>(registration: IRegistration, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): IFactory<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): T => {

      const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);

      return this._resolve<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
    };
  }

  private _resolveLazyAsync<T>(registration: IRegistration, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): IFactoryAsync<T> {

    return (lazyInjectionArgs: Array<any>, lazyConfig: any): Promise<T> => {

      const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

      const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);

      return this._resolveAsync<T>(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
    };
  }

  private _resolveObject<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext, injectionArgs?: Array<any>, config?: any): T {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const object = this._createObject<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(object, registration, configUsed);

    return object;
  }  

  private async _resolveObjectAsync<T>(registration: IObjectRegistration<T>, resolutionContext: IResolutionContext, injectionArgs?: Array<any>, config?: any): Promise<any> {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const object = await this._createObjectAsync<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(object, registration, configUsed);

    return object;
  }  

  private _resolveFactory<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext, injectionArgs?: Array<any>, config?: any): T {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const factory = this._createFactory<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(factory, registration, configUsed);

    return factory;
  }  

  private async _resolveFactoryAsync<T>(registration: IFactoryRegistration<T>, resolutionContext: IResolutionContext, injectionArgs?: Array<any>, config?: any): Promise<T> {
    
    const configUsed = this._mergeRegistrationConfig(registration, config);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const factory = this._createFactoryAsync<T>(registration, dependencies, injectionArgs);
    
    this._configureInstance(factory, registration, configUsed);

    return factory;
  }  

  private _resolveInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext, injectionArgs?: Array<any>, config?: any): T {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    if (registration.settings.isSingleton) {
      return this._getInstance(registration, resolutionContext, injectionArgs, configUsed);
    }

    return this._getNewInstance(registration, resolutionContext, injectionArgs, configUsed);
  }

  private async _resolveInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext, injectionArgs?: Array<any>, config?: any): Promise<T> {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    if (registration.settings.isSingleton) {
      return await this._getInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
    }

    return await this._getNewInstanceAsync(registration, resolutionContext, injectionArgs, configUsed);
  }

  private _getInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): T {

    const instances = this._getCachedInstances<T>(registration, injectionArgs, config);

    if (instances.length === 0) {

      return this._getNewInstance(registration, resolutionContext, injectionArgs, config);
    }

    return instances[0];
  }

  private async _getInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const instances = this._getCachedInstances<T>(registration, injectionArgs, config);

    if (instances.length === 0) {

      return await this._getNewInstanceAsync(registration, resolutionContext, injectionArgs, config);
    }

    return instances[0];
  }

  private _getNewInstance<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): T {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    this._validateResolutionContext(registration, resolutionContext);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const instance = this._createType(registration, dependencies, injectionArgs);
    
    this._configureInstance(instance, registration, configUsed);

    if (!resolutionContext.isDependencyOwned) {
      this._cacheInstance(registration, instance, injectionArgs, config);
    }

    return instance;
  }

  private async _getNewInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const configUsed = this._mergeRegistrationConfig(registration, config);

    this._validateResolutionContext(registration, resolutionContext);

    const dependencies = this._resolveDependencies(registration, resolutionContext);

    const instance = await this._createType(registration, dependencies, injectionArgs);
    
    this._configureInstance(instance, registration, configUsed);

    if (!resolutionContext.isDependencyOwned) {
      this._cacheInstance(registration, instance, injectionArgs, config);
    }

    return instance;
  }

  private _validateResolutionContext<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext): void {
    
    const historyIndex = resolutionContext.history.indexOf(registration);
    
    if (historyIndex === 0) {
      return;
    }

    // further validation
  }

  private _resolveDependencies<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext): Array<any> {

    const resolvedDependencies = [];

    resolutionContext.history.push(registration);

    const dependencies = registration.settings.dependencies || [];

    dependencies.forEach((dependency) => {

      const resolvedDependency = this._resolveDependency(registration, dependency, resolutionContext);

      resolvedDependencies.push(resolvedDependency);
    });

    return resolvedDependencies;
  }

  private async _resolveDependenciesAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext): Promise<Array<any>> {

    const resolvedDependencies = [];

    resolutionContext.history.push(registration);

    const dependencies = registration.settings.dependencies || [];

    return await Promise.all(dependencies.map(async (dependency) => {

      const resolvedDependency = await this._resolveDependencyAsync(registration, dependency, resolutionContext);

      resolvedDependencies.push(resolvedDependency);
    }));
  }

  private _resolveDependency<T>(registration: ITypeRegistration<T>, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext): any {
    
    const newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);

    const overwrittenDependencyKey = this._getDependencyKeyOverwritten(registration, dependencyKey);

    const dependencyRegistration = super.getRegistration(overwrittenDependencyKey);

    newResolutionContext.isDependencyOwned = this._isDependencyOwned(registration, overwrittenDependencyKey);

    if (this._isDependencyLazy(registration, overwrittenDependencyKey)) {
      return this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    if (this._isDependencyLazyAsync(registration, overwrittenDependencyKey)) {
      return this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
    }    
    
    if (dependencyRegistration.settings.isObject) {
      return this._resolveObject(dependencyRegistration as IObjectRegistration<T>, resolutionContext, undefined, undefined);
    }

    if (dependencyRegistration.settings.isFactory) {
      return this._resolveFactory(dependencyRegistration as IFactoryRegistration<T>, resolutionContext, undefined, undefined);
    }

    return this._resolve(dependencyRegistration, newResolutionContext, undefined, undefined);
  }

  private async _resolveDependencyAsync<T>(registration: ITypeRegistration<T>, dependencyKey: RegistrationKey, resolutionContext: IResolutionContext): Promise<any> {
    
    const newResolutionContext = this._createChildResolutionContext(registration, resolutionContext);
    
    const dependencyRegistration = super.getRegistration(dependencyKey);

    if (this._isDependencyLazy(registration, dependencyKey)) {
      return await this._resolveLazy(dependencyRegistration, newResolutionContext, undefined, undefined);
    }

    if (this._isDependencyLazyAsync(registration, dependencyKey)) {
      return await this._resolveLazyAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
    }    
    
    if (dependencyRegistration.settings.isObject) {
      return await this._resolveObjectAsync(dependencyRegistration as IObjectRegistration<T>, resolutionContext, undefined, undefined);
    }

    if (dependencyRegistration.settings.isFactory) {
      return await this._resolveFactoryAsync(dependencyRegistration as IFactoryRegistration<T>, resolutionContext, undefined, undefined);
    }

    return await this._resolveAsync(dependencyRegistration, newResolutionContext, undefined, undefined);
  }
  
  private _createObject<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver = this._getResolver(registration);
    const object = resolver.resolveObject(this, registration);
    const createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
    return createdObject;
  }
  
  private async _createObjectAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any> {
    const resolver = this._getResolver(registration);
    const object = await resolver.resolveObjectAsync(this, registration);
    const createdObject = resolver.createObject(this, object, registration, dependencies, injectionArgs);
    return createdObject;
  }
  
  private _createFactory<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver = this._getResolver(registration);
    const type = resolver.resolveFactory(this, registration);
    const factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
    return factory;
  }
  
  private async _createFactoryAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<any> {
    const resolver = this._getResolver(registration);
    const type = await resolver.resolveFactoryAsync(this, registration);
    const factory = resolver.createFactory(this, type, registration, dependencies, injectionArgs);
    return factory;
  }
  
  private _createType<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T {
    const resolver = this._getResolver(registration);
    const type = resolver.resolveType(this, registration);
    const factory = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
    return factory;
  }
  
  private async _createTypeAsync<T>(registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): Promise<T> {
    const resolver = this._getResolver(registration);
    const type = await resolver.resolveTypeAsync(this, registration);
    const instance = resolver.createInstance(this, type, registration, dependencies, injectionArgs);
    return instance;
  }

  private _getResolver<T>(registration: IRegistration): IResolver {
    return registration.settings.resolver || this.settings.resolver;
  }

  private _configureInstance(instance: any, registration: IRegistration, runtimeConfig?: any): void {

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

  private _getCachedInstances<T>(registration: IRegistration, injectionArgs: Array<any>, config: any): Array<T> {

    const key = registration.settings.key;
    const resolver = this._getResolver(registration);

    if (!this.instances) {
      this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<T>>();
    }

    const allInstances = this.instances.get(key);
    if (!allInstances) {
      return [];
    }

    const configHash = resolver.hashConfig(config);

    const configInstances = allInstances.get(configHash);

    if (!configInstances) {
      return [];
    }

    const injectionArgsHash = resolver.hash(injectionArgs);

    const argumentInstances = configInstances.get(injectionArgsHash);

    if (!argumentInstances) {
      return [];
    }

    return argumentInstances;
  }

  private _cacheInstance<T>(registration: IRegistration, instance: any, injectionArgs: Array<any>, config: any): void {

    const key = registration.settings.key;
    const resolver = this._getResolver(registration);

    if (!this.instances) {
      this.instances = new Map<RegistrationKey, IInstanceWithConfigCache<T>>();
    }

    let allInstances = this.instances.get(key);

    if (!allInstances) {
      allInstances = new Map<string, IInstanceWithInjectionArgsCache<any>>();
      this.instances.set(key, allInstances);
    }

    const configHash = resolver.hashConfig(config);

    let configInstances = allInstances.get(configHash);

    if (!configInstances) {
      configInstances = new Map<string, Array<T>>();
      allInstances.set(configHash, configInstances);
    }

    const injectionArgsHash = resolver.hash(injectionArgs);

    let argumentInstances = configInstances.get(injectionArgsHash);

    if (!argumentInstances) {
      argumentInstances = [];
      configInstances.set(injectionArgsHash, argumentInstances);
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


  private _validateDependencies(keys: Array<RegistrationKey>, history: Array<IRegistration> = []): Array<IValidationError> {
    
    const errors = [];

    keys.forEach((key) => {

      const registration = this.getRegistration(key);

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
        
        const dependency = this.getRegistration(dependencyKey);

        const deepErrors = this._validateDependency(registration, dependency, history);
        Array.prototype.push.apply(errors, deepErrors);
      }

    });

    return errors;
  }
  

  private _validateDependency(registration: IRegistration, dependency: IRegistration, history: Array<IRegistration>) {

    const newRegistrationHistory = [];
    Array.prototype.push.apply(newRegistrationHistory, history);

    const errors = [];
    const dependencyKey = dependency.settings.key;
    const dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, dependency.settings.key);

    if (!dependency) {

      let errorMessage;

      if (dependencyKey === dependencyKeyOverwritten) {
        errorMessage = `dependency '${dependencyKey}' overwritten with key '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`
      } else {
        errorMessage = `dependency '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`
      }
      
      const validationError = this._createValidationError(registration, newRegistrationHistory, errorMessage);

      errors.push(validationError);

    } else if (dependency.settings.dependencies) {

      const overwrittenKeyValidationErrors = this._validateOverwrittenKeys(registration, newRegistrationHistory);
      Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);

      const circularBreakFound = this._historyHasCircularBreak(newRegistrationHistory, dependency);

      if (!circularBreakFound) {
        const deepErrors = this._validateDependencies([dependency.settings.key], newRegistrationHistory);
        Array.prototype.push.apply(errors, deepErrors);
      }
    }

    return errors;
  }

  private _historyHasCircularBreak(history: Array<IRegistration>, dependency: IRegistration) {

    return history.some((parentRegistration) => {

      const parentSettings = parentRegistration.settings;

      if (this.settings.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
        return true;
      }

      if (this.settings.circularDependencyCanIncludeLazy && parentSettings.lazyDependencies && parentSettings.lazyDependencies.length > 0) {

        if (parentSettings.lazyDependencies.length === 0 ||
          parentSettings.lazyDependencies.indexOf(dependency.settings.key) >= 0) {

          return true;
        }
      }
    });
  }

  private _createValidationError(registration: IRegistration, history: Array<IRegistration>, errorMessage: string): IValidationError {

      const validationError: IValidationError = {
        registrationStack: history,
        currentRegistration: registration,
        errorMessage: errorMessage
      };

      return validationError;
  }

  private _validateOverwrittenKeys(registration: IRegistration, history: Array<IRegistration>): Array<IValidationError> {

    const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);

    const errors = [];

    overwrittenKeys.forEach((overwrittenKey) => {
      const keyErrors = this._validateOverwrittenKey(registration, overwrittenKey, history);
      Array.prototype.push.apply(errors, keyErrors);
    });

    return errors;
  }

  private _validateOverwrittenKey(registration: IRegistration, overwrittenKey: RegistrationKey, history: Array<IRegistration>): Array<IValidationError> {

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

  private _createNewResolutionContext(registration: IRegistration): IResolutionContext {
    return new ResolutionContext(registration);
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

    return {...existingConfig, ...newConfig};
  }

  private _mergeRegistrationConfig<T>(registration: ITypeRegistration<T>, config?: any): any {

    const registrationConfig = this._resolveConfig(registration, registration.settings.config);
    const runtimeConfig = this._resolveConfig(registration, config);

    const configUsed = this._mergeConfigs(registrationConfig, runtimeConfig);

    return configUsed;
  }

  private _resolveConfig<T>(registration: IRegistration, config: any): any {
    const resolver = this._getResolver(registration);
    return resolver.resolveConfig(config);
  }

  private _createChildResolutionContext<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext): IResolutionContext {

    const newResolutionContext = this._cloneResolutionContext(resolutionContext);
    
    const ownedDependencies = registration.settings.ownedDependencies || [];

    ownedDependencies.forEach((ownedDependency) => {
      newResolutionContext.owners[ownedDependency] = registration;
    });

    return newResolutionContext;
  }

  private _cloneResolutionContext<T>(resolutionContext: IResolutionContext): IResolutionContext {
    return Object.assign({}, resolutionContext);
  }

  private _isDependencyLazy<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {
    
    if (!registration.settings.lazyDependencies) {
      return false;
    }
    
    return registration.settings.lazyDependencies && registration.settings.lazyDependencies.length !== 0 && registration.settings.lazyDependencies.indexOf(dependencyKey) >= 0;
  }

  private _isDependencyLazyAsync<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {
    
    if (!registration.settings.lazyPromiseDependencies) {
      return false;
    }
    
    return registration.settings.lazyPromiseDependencies && registration.settings.lazyPromiseDependencies.length !== 0 && registration.settings.lazyPromiseDependencies.indexOf(dependencyKey) >= 0;
  }

  private _isDependencyOwned<T>(registration: IRegistration, dependencyKey: RegistrationKey): boolean {
    
    if (!registration.settings.ownedDependencies) {
      return false;
    }
    
    return registration.settings.ownedDependencies.length === 0 || registration.settings.ownedDependencies.indexOf(dependencyKey) >= 0;
  }

  private _getDependencyKeyOverwritten(registration: IRegistration, dependencyKey: RegistrationKey) {

    let finalDependencyKey = dependencyKey;

    if (registration.settings.overwrittenKeys[dependencyKey]) {

      finalDependencyKey = registration.settings.overwrittenKeys[dependencyKey];
    }

    return finalDependencyKey;
  }

}