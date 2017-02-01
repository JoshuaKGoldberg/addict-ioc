import {TypeRegistration} from './type_registration';
import {IRegistrations, IInstances, ITypeRegistrationSettings, IDependencyInjectionContainerConfig, IProvideConfig} from './interfaces';

export class DependencyInjectionContainer {

  private _config: IDependencyInjectionContainerConfig = undefined;
  private _registrations: IRegistrations = {};
  private _instances: IInstances = {};
  private _externalConfigProvider: IProvideConfig = undefined;

  constructor(config: IDependencyInjectionContainerConfig) {

    const configuration = config || this._getDefaultConfiguration();

    this._config = configuration;
    this._initializeRegistrationDeclarations();
    this._initializeBaseRegistrations();
  }

  private _getDefaultConfiguration() {
    return {
      registrationDefaults: {
        isSingleton: false,
        wantsInjection: true,
        isLazy: false,
        bindFunctions: false,
        autoCreateMissingSubscribers: true
      },
      injectContainerKey: 'container',
      circularDependencyCanIncludeSingleton: true,
      circularDependencyCanIncludeLazy: true
    };
  }

  public clear() {
    this._registrations = {};
    this._instances = {};

    this._initializeBaseRegistrations();
  }

  get config(): IDependencyInjectionContainerConfig {
    return this._config;
  }

  get registrations(): IRegistrations {
    return this._registrations;
  }

  get instances(): IInstances {
    return this._instances;
  }

  get externalConfigProvider(): IProvideConfig {
    return this._externalConfigProvider;
  }

  public setConfigProvider(configProvider: IProvideConfig) {

    if (typeof configProvider === 'function' && configProvider !== null) {

      this._externalConfigProvider = configProvider;

    } else {

      throw new Error('Config provider must be a function.');
    }
  }

  public setDefaults(registrationDefaults: ITypeRegistrationSettings) {
    if (registrationDefaults) {

      const defaultSettings = [
        'isSingleton',
        'wantsInjection',
        'isLazy',
        'bindFunctions',
        'autoCreateMissingSubscribers'
      ];

      defaultSettings.forEach((defaultSetting) => {

        const defaultSettingValue = registrationDefaults[defaultSetting];

        this._setDefault(defaultSetting, defaultSettingValue);
      });
    }
  }

  private _setDefault(settingKey: string, value: any) {

    if (this._isValidBoolean(value)) {

      this.config.registrationDefaults[settingKey] = value;

      return true;
    }
    return false;
  }

  private _isValidBoolean(settingValue: any) {
    return typeof settingValue === 'boolean';
  }

  public register(key: string, type: any): TypeRegistration {

    const keyType = typeof key;

    let currentRegistration;

    if (keyType === 'string') {

      currentRegistration = this._registerTypeByKey(key, type);

    } else {

      throw new Error(`The key type '${key}' is not supported.`);
    }

    this.registrations[key] = currentRegistration;

    return currentRegistration;
  }

  public unregister(key: string) {

    if (this.registrations[key]) {

      delete this.registrations[key];

    } else {

      throw new Error(`The key '${key}' is not registered.`);
    }
  }

  private _registerTypeByKey(key: string, type: any) {

    if (!key) {
      throw new Error(`No key specified for registration of type '${type}'`);
    }

    if (!type) {
      throw new Error(`No type specified for registration of key '${key}'`);
    }

    return new TypeRegistration(this.config.registrationDefaults, key, type);
  }

  public registerFactory(key: string, factoryMethod: any) {

    if (typeof key !== 'string') {
      throw new Error(`No key specified for registration of factory function '${factoryMethod}'`);
    }

    const currentRegistration = new TypeRegistration(this.config.registrationDefaults, key, factoryMethod, true);

    this.registrations[key] = currentRegistration;

    return currentRegistration;
  }

  public registerObject(key: string, object: any) {

    const keyType = typeof key;

    let currentRegistration;

    if (keyType === 'string') {

      if (!key) {
        throw new Error(`No key specified for registration of type '${keyType}'`);
      }

      currentRegistration = new TypeRegistration(this.config.registrationDefaults, key, object);

    } else {

      throw new Error(`The key type '${key}' is not supported.`);
    }

    this.registrations[key] = currentRegistration;

    currentRegistration.settings.isObject = true;

    return currentRegistration;
  }

  private _initializeBaseRegistrations() {
    this.registerObject(this.config.injectContainerKey, this);
  }

  private _initializeRegistrationDeclarations() {

    const declarations = [
      'dependencies',
      'configure',
      'singleton',
      'noInjection',
      'injectInto',
      'injectLazy',
      'onNewInstance',
      'bindFunctions'
    ];

    declarations.forEach((declaration) => {

      this[declaration] = () => {
        this._ensureRegistrationStarted(declaration);
      };
    });
  }

  private _ensureRegistrationStarted(declaration) {
    throw new Error(`There is no registration present to use '${declaration}'.
        You can start a registration by calling the 'register' method.`);
  }

  private _getRegistration(key: string) {

    const registration = this.registrations[key];

    if (registration) {
      return registration;
    }

    throw new Error(`There is no registration created for key '${key}'.`);
  }

  public resolve(key: string, injectionArgs?: Array<any>, config?: any) {
    return this._resolve(key, injectionArgs, config);
  }

  private _resolve(key: string, injectionArgs?: Array<any>, config?: any, resolvedKeyHistory?: Array<any>, isLazy?: boolean) {

    if (typeof injectionArgs !== 'undefined' && !Array.isArray(injectionArgs)) {
      throw new Error(`Injection args must be of type 'Array'.`);
    }

    const registration = this._getRegistration(key);

    if (registration.settings.isObject) {

      if (isLazy) {
        return () => {
          return registration.settings.type;
        };
      }

      return registration.settings.type;
    }

    return this._resolveInstance(registration, injectionArgs, config, resolvedKeyHistory, isLazy);
  }

  private _resolveInstance(registration: TypeRegistration, injectionArgs: Array<any>, config: any, resolvedKeyHistory?: Array<any>, isLazy?: boolean) {

    const resolvedRegistrationConfig = this._getConfig(registration.settings.key);

    const resolvedRuntimeConfig = this._resolveConfig(registration.settings.key, config);

    const configUsed = this._mergeConfig(resolvedRegistrationConfig, resolvedRuntimeConfig);

    if (registration.settings.isSingleton) {

      if (isLazy) {

        return (lazyInjectionArgs, lazyConfig) => {

          const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

          const lazyConfigUsed = this._mergeConfig(configUsed, lazyConfig);

          return this._getInstance(registration, injectionArgsUsed, lazyConfigUsed, []);
        };
      } else {

        const newResolvedKeyHistory = resolvedKeyHistory ? resolvedKeyHistory.concat([]) : [];

        return this._getInstance(registration, injectionArgs, configUsed, newResolvedKeyHistory);
      }
    }

    if (isLazy) {
      return (lazyInjectionArgs, lazyConfig) => {

        const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

        const lazyConfigUsed = this._mergeConfig(configUsed, lazyConfig);

        return this._getNewInstance(registration, injectionArgsUsed, lazyConfigUsed, []);
      };
    }

    const newResolvedKeyHistory = resolvedKeyHistory ? resolvedKeyHistory.concat([]) : [];

    return this._getNewInstance(registration, injectionArgs, configUsed, newResolvedKeyHistory);
  }

  private _mergeArguments(baseArgs: Array<any>, additionalArgs: Array<any>) {

    if (additionalArgs && !Array.isArray(additionalArgs)) {
      throw new Error('Arguments have to be of type Array');
    }

    if (!baseArgs) {
      return additionalArgs;
    }

    const argsUsed = baseArgs || undefined;

    if (!Array.isArray(argsUsed)) {
      throw new Error('Arguments have to be of type Array');
    }

    const finalArgs = Array.prototype.push.apply(argsUsed, additionalArgs);

    return finalArgs;
  }

  private _mergeConfig(baseConfig: any, additionalConfig: any) {
    const configUsed = baseConfig || undefined;

    if (!configUsed) {
      return additionalConfig;
    }

    const finalConfig = Object.assign(configUsed, additionalConfig);

    return finalConfig;
  }

  private _getInstance(registration: TypeRegistration, injectionArgs: Array<any>, config: any, resolvedKeyHistory?: Array<any>) {

    let instances = this.instances[registration.settings.key];
    let instance = null;

    if (typeof instances === 'undefined') {

      return this._getNewInstance(registration, injectionArgs, config, resolvedKeyHistory);
    }

    instances = this.instances[registration.settings.key][config][<any>injectionArgs];

    if (Array.isArray(instances)) {

      if (instances.length === 0) {

        return this._getNewInstance(registration, injectionArgs, config);

      } else {

        instance = instances[0];
      }
    }

    return instance;
  }

  private _getKeysForInstanceConfigurationsByKey(key: string) {

    const instance = this.instances[key];

    if (!instance) {
      return null;
    }

    return Object.keys(instance);
  }

  private _getKeysForInstanceInjectionArgumentsByKeyAndConfig(key: string, config: any) {

    const instance = this.instances[key][config];

    if (!instance) {
      return null;
    }

    return Object.keys(instance);
  }

  private _getAllInstances(key: string, config?: any, injectionArgs?: Array<any>) {

    const configKeys = [];

    if (config) {

      configKeys.push(config);

    } else {

      Array.prototype.push.apply(configKeys, this._getKeysForInstanceConfigurationsByKey(key));
    }

    if (configKeys.length === 0) {

      return null;
    }

    const allInstances = [];

    configKeys.forEach((configKey) => {

      const instanceInjectionArgumentKeys = this._getKeysForInstanceInjectionArgumentsByKeyAndConfig(key, config);

      if (!instanceInjectionArgumentKeys) {
        return;
      }

      instanceInjectionArgumentKeys.forEach((instanceInjectionArgumentKey: string) => {

        Array.prototype.push.apply(allInstances, this.instances[key][configKey][instanceInjectionArgumentKey]);
      });
    });

    return allInstances;
  }

  private _getNewInstance(registration: TypeRegistration, injectionArgs?: Array<any>, config?: any, resolvedKeyHistory?: Array<any>) {

    if (Array.isArray(resolvedKeyHistory) && resolvedKeyHistory.indexOf(registration.settings.key) >= 0) {
      // if (!isLazy) {
        throw new Error(`Circular dependency on key '${registration.settings.key}' detected.`);
      // }
    }

    const dependencies = this._resolveDependencies(registration, resolvedKeyHistory);

    const instance = this._createInstance(registration, dependencies, injectionArgs);
    
    this._configureInstance(instance, config);

    this._callSubscribers(registration, 'newInstance', instance);

    this._bindFunctionsToInstance(registration, instance);

    this._cacheInstance(registration.settings.key, instance, injectionArgs, config);

    return instance;
  }

  private _bindFunctionsToInstance(registration: TypeRegistration, instance: any) {

    if (!registration.settings.bindFunctions) {
      return;
    }

    let instanceKeys: Array<string>;

    if (registration.settings.functionsToBind.length > 0) {

      instanceKeys = registration.settings.functionsToBind;

    } else {

      const instancePrototype = Object.getPrototypeOf(instance);

      instanceKeys = Object.getOwnPropertyNames(instancePrototype);
    }

    instanceKeys.forEach((instanceKey: string) => {

      if (instanceKey === 'constructor') {
        return;
      }

      const keyType = typeof instance[instanceKey];

      if (keyType === 'function') {

        const unboundKey = instance[instanceKey];

        instance[instanceKey] = unboundKey.bind(instance);
      }
    });
  }

  public resolveDependencies(key: string) {

    const registration = this._getRegistration(key);

    return this._resolveDependencies(registration);
  }

  private _resolveDependencies(registration: any, resolvedKeyHistory?: Array<any>) {

    const resolvedDependencies = [];

    const configuredDependencies = registration.settings.dependencies;

    if (!configuredDependencies) {
      return resolvedDependencies;
    }

    let dependencies;
    const dependenciesType = typeof configuredDependencies;

    if (Array.isArray(registration.settings.dependencies)) {

      dependencies = configuredDependencies;

    } else if (dependenciesType === 'string') {

      dependencies = [configuredDependencies];

    } else {

      throw new Error(`The type '${dependenciesType}' of your dependencies declaration is not yet supported.
        Supported types: 'Array', 'String'`);
    }

    if (!resolvedKeyHistory) {
      resolvedKeyHistory = [];
    }

    resolvedKeyHistory.push(registration.settings.key);

    dependencies.forEach((dependency) => {

      const isLazy = this._isDependencyLazy(registration, dependency);

      const dependencyKey = this._getDependencyKeyOverwritten(registration, dependency);

      const dependencyInstance = this._resolve(dependencyKey, undefined, undefined, resolvedKeyHistory, isLazy);

      resolvedDependencies.push(dependencyInstance);
    });

    return resolvedDependencies;
  }

  private _isDependencyLazy(registration: TypeRegistration, dependency: string) {

    const isLazy = registration.settings.isLazy && (registration.settings.lazyKeys.length === 0 || registration.settings.lazyKeys.indexOf(dependency) >= 0);

    return isLazy;
  }

  private _getDependencyKeyOverwritten(registration: TypeRegistration, dependency: string) {

    let dependencyKey = dependency;

    if (registration.settings.overwrittenKeys[dependency]) {

      dependencyKey = registration.settings.overwrittenKeys[dependency];
    }

    return dependencyKey;
  }

  private _createInstance(registration: TypeRegistration, dependencies: Array<any>, injectionArgs: Array<any>) {

    let instance;

    let type = registration.settings.type;

    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (typeof type !== 'function') {

      instance = type;

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {

        this._injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
      }

    } else if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {

      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactoryWithInjection(type, argumentsToBeInjected);

      } else {

        instance = this._createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
      }

    } else {
      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactory(type);

      } else {

        instance = this._createInstanceByConstructor(type);
      }

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {

        this._injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
      }
    }

    return instance;
  }

  private _createInstanceByFactory(type: any) {
    const instance = type();
    return instance;
  }

  private _createInstanceByFactoryWithInjection(type: any, argumentsToBeInjected: Array<any>) {
    const instance = type.apply(undefined, argumentsToBeInjected);
    return instance;
  }

  private _createInstanceByConstructor(type) {
    const instance = new type();
    return instance;
  }

  private _createInstanceByConstructorWithInjection(type, argumentsToBeInjected) {
    const instance = new type(...argumentsToBeInjected);
    return instance;
  }

  private _injectDependenciesIntoInstance(registration: TypeRegistration, instance: any, argumentsToBeInjected: Array<any>) {

    let propertySource;

    if (registration.settings.isFactory) {

      propertySource = instance;

    } else {

      propertySource = Object.getPrototypeOf(instance);
    }

    const injectionTargetPropertyDescriptor = this._getPropertyDescriptor(propertySource, registration.settings.injectInto);

    if (injectionTargetPropertyDescriptor) {

      if (typeof injectionTargetPropertyDescriptor.value === 'function') {

        this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);

      } else if (injectionTargetPropertyDescriptor.set) {

        this._injectDependenciesIntoProperty(instance, registration.settings.injectInto, argumentsToBeInjected);

      } else {
        throw new Error(`The setter for the '${registration.settings.injectInto}' property on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
      }

    } else {
      throw new Error(`The injection target '${registration.settings.injectInto}' on type '${Object.getPrototypeOf(instance).constructor.name}' is missing.`);
    }
  }

  private _getPropertyDescriptor(type: any, key: string) {

    const propertyDescriptor = Object.getOwnPropertyDescriptor(type, key);

    if (propertyDescriptor) {
      return propertyDescriptor;
    }

    const prototype = Object.getPrototypeOf(type);

    if (!prototype) {
      return undefined;
    }

    return this._getPropertyDescriptor(prototype, key);
  }

  private _injectDependenciesIntoFunction(instance: any, targetFunction: any, argumentsToBeInjected: Array<any>) {
    targetFunction.apply(targetFunction, argumentsToBeInjected);
  }

  private _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>) {
    instance[property] = argumentsToBeInjected;
  }

  private _getSubscriberRegistrations(key: string, subscriptionKey: string) {

    const subscribers = [];

    const registrationKeys = Object.keys(this.registrations);

    registrationKeys.forEach((registrationKey) => {

      const registration = this.registrations[registrationKey];

      registration.settings.subscriptions[subscriptionKey].some((subscription) => {

        if (subscription.key === key || subscription.key === '*') {

          subscribers.push(registration);
          return true;
        }
      });
    });

    return subscribers;
  }

  private _getSubscriptionFromRegistrationByKey(registration: TypeRegistration, subscriptionKey: string, key: string) {

    let resultSubscription = null;
    registration.settings.subscriptions[subscriptionKey].some((subscription) => {

      if (subscription.key === key) {

        resultSubscription = subscription;
        return true;
      }
    });

    return resultSubscription;
  }

  private _callSubscribers(registration: TypeRegistration, subscriptionKey: string, params: Array<any>) {

    const subscriberRegistrations = this._getSubscriberRegistrations(registration.settings.key, subscriptionKey);

    subscriberRegistrations.forEach((subscriberRegistration) => {

      let subscribedInstances = this._getAllInstances(subscriberRegistration.settings.key);

      if (subscribedInstances === null) {

        const newInstance = this._createMissingSubscriber(subscriberRegistration);

        subscribedInstances = [newInstance];
      }

      subscribedInstances.forEach((subscribedInstance) => {

        this._callSubscriber(registration, subscriptionKey, subscriberRegistration, subscribedInstance, params);
      });
    });
  }

  private _createMissingSubscriber(subscriberRegistration: TypeRegistration) {

    if (subscriberRegistration.settings.autoCreateMissingSubscribers) {

      return this._getNewInstance(subscriberRegistration);
    }

    throw new Error(`There is no instance created for key '${subscriberRegistration.settings.key}'.`);
  }

  private _callSubscriber(subscribedRegistration: TypeRegistration, subscriptionKey: string, subscriberRegistration: TypeRegistration, subscribedInstance: any,
    params: Array<any>) {

    if (!Array.isArray(params)) {
      params = [params];
    }

    const methodSubscription = this._getSubscriptionFromRegistrationByKey(subscriberRegistration, subscriptionKey, subscribedRegistration.settings.key);

    const subscribedMethod = subscribedInstance[methodSubscription.method];

    subscribedMethod.apply(subscribedInstance, params);
  }

  private _configureInstance(instance: any, config: any) {

    if (!config) {
      return;
    }

    const configPropertyDescriptor = this._getPropertyDescriptor(instance, 'config');

    if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
      const instancePrototype = Object.getPrototypeOf(instance);

      throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
    }

    instance.config = config;
  }

  private _cacheInstance(key: string, instance: any, injectionArgs: Array<any>, config: any) {

    if (!this.instances[key]) {
      this.instances[key] = {};
    }
    if (!this.instances[key][config]) {
      this.instances[key][config] = {};
    }

    if (!this.instances[key][config][<any>injectionArgs]) {
      this.instances[key][config][<any>injectionArgs] = [];
    }

    this.instances[key][config][<any>injectionArgs].push(instance);
  }

  private _getConfig(key: string) {

    const config = this.registrations[key].settings.config;

    const resolvedConfig = this._resolveConfig(key, config);

    if (!resolvedConfig) {
      return undefined;
    }

    return resolvedConfig;
  }

  private _resolveConfig(key: string, config: any) {

    const registration = this.registrations[key];

    let resolvedConfig;

    const configType = typeof config;

    if (configType === 'function') {
      resolvedConfig = config(key);

      if (!resolvedConfig) {
        throw new Error(`The specified config function for registration key ${registration.settings.key} returned undefined.`);
      }

    } else if (configType === 'object') {
      resolvedConfig = config;

      if (!resolvedConfig) {
        throw new Error(`The specified config for registration key ${registration.settings.key} is undefined.`);
      }

    } else if (configType === 'string') {

      if (typeof this.externalConfigProvider !== 'function' || this.externalConfigProvider === null) {
        throw new Error(`The specified config for registration key ${registration.settings.key} is null.`);
      }

      resolvedConfig = this.externalConfigProvider(config, registration);

      if (!resolvedConfig) {
        throw new Error(`The specified config for registration key ${registration.settings.key} is null.`);
      }

    } else {

      resolvedConfig = undefined;
    }

    return resolvedConfig;
  }

  public validateDependencies(key?: any) {

    let registrationKeys;

    if (Array.isArray(key)) {

      registrationKeys = key;

    } else if (typeof key !== 'undefined') {

      registrationKeys = [key];

    } else {

      registrationKeys = Object.keys(this.registrations);
    }

    const errors = this._validateDependencies(registrationKeys);

    if (errors.length > 0) {
      throw new Error(`Errors during validation of dependencies:
          ${errors.toString()}`);
    }
  }

  private _validateDependencies(registrationKeys: Array<any>, parentRegistrationHistory?: TypeRegistration[]) {
    const errors = [];

    registrationKeys.forEach((registrationKey) => {

      const registration = this.registrations[registrationKey];
      const dependencies = registration.settings.dependencies;

      if (!parentRegistrationHistory) {

        parentRegistrationHistory = [];

      } else if (parentRegistrationHistory.indexOf(registration) >= 0) {

        errors.push(`Circular dependency on key '${registrationKey}' detected.`);
        return;
      }

      const subParentRegistrationHistory = [];
      Array.prototype.push.apply(subParentRegistrationHistory, parentRegistrationHistory);

      subParentRegistrationHistory.push(registration);

      if (!dependencies) {
        return;
      }

      for (let dependencyIndex = 0; dependencyIndex < dependencies.length; dependencyIndex++) {

        const originalDependencyKey = dependencies[dependencyIndex];
        const originalDependencyKeyRegistration = this.registrations[originalDependencyKey];

        const dependencyKeyOverwritten = this._getDependencyKeyOverwritten(registration, originalDependencyKey);

        if (!originalDependencyKeyRegistration) {

          errors.push(`Registration for '${originalDependencyKey}' overwritten with '${dependencyKeyOverwritten}' declared on registered for key '${registration.settings.key}' is missing.`);
        }

        const dependencyRegistration = this.registrations[dependencyKeyOverwritten];

        if (!dependencyRegistration) {

          if (originalDependencyKey !== dependencyKeyOverwritten) {

            errors.push(`Dependency '${originalDependencyKey}' overwritten with key '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`);
          } else {

            errors.push(`Dependency '${dependencyKeyOverwritten}' declared on '${registration.settings.key}' is missing.`);
          }

        } else if (dependencyRegistration.settings.dependencies) {

          const overwrittenKeyValidationErrors = this._validateOverwrittenKeys(registration);
          Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);

          const circularBreakFound = this._historyHasCircularBreak(subParentRegistrationHistory, dependencyRegistration);

          if (!circularBreakFound) {
            const deepErrors = this._validateDependencies([dependencyRegistration.settings.key], subParentRegistrationHistory);

            if (deepErrors.length > 0) {

              errors.push(`Inner dependency errors for dependency '${dependencyKeyOverwritten}':
                  ${deepErrors.toString()}`);
            }
          }
        }
      }
    });

    return errors;
  }

  private _historyHasCircularBreak(parentRegistrationHistory: TypeRegistration[], dependencyRegistration: TypeRegistration) {

    return parentRegistrationHistory.some((parentRegistration) => {

      const parentSettings = parentRegistration.settings;

      if (this.config.circularDependencyCanIncludeSingleton && parentSettings.isSingleton) {
        return true;
      }

      if (this.config.circularDependencyCanIncludeLazy && parentSettings.isLazy) {

        if (parentSettings.lazyKeys.length === 0 ||
          parentSettings.lazyKeys.indexOf(dependencyRegistration.settings.key) >= 0) {

          return true;
        }
      }
    });
  }

  private _validateOverwrittenKeys(registration: TypeRegistration) {

    const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);

    const errors = [];

    overwrittenKeys.forEach((overwrittenKey) => {

      this._validateOverwrittenKey(registration, overwrittenKey, errors);
    });

    return errors;
  }

  private _validateOverwrittenKey(registration: TypeRegistration, overwrittenKey: string, errors: string[]) {

    if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {

      errors.push(`No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`);
    }

    const overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
    const overwrittenKeyRegistration = this._getRegistration(overwrittenKeyValue);

    if (!overwrittenKeyRegistration) {

      errors.push(`Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`);
    }
  }

  private _squashArgumentsToArray(args: Array<any>) {

    const allArgs = [];

    args.forEach((arg) => {
      if (Array.isArray(arg)) {

        Array.prototype.push.apply(allArgs, arg);

      } else if (typeof arg === 'string') {

        allArgs.push(arg);
      }
    });

    return allArgs;
  }

  public getKeysByTags(...args) {

    const allTags = this._squashArgumentsToArray(args);

    const foundKeys = [];

    const registrationKeys = Object.keys(this.registrations);

    registrationKeys.forEach((registrationKey) => {

      const registration = this.registrations[registrationKey];

      if (registration.hasTags(allTags)) {

        foundKeys.push(registration.settings.key);
      }
    });

    return foundKeys;
  }

  public getKeysByAttributes(attributes: Array<any>) {

    const foundKeys = [];

    const attributeKeys = Object.keys(attributes);

    const registrationKeys = this.getKeysByTags(attributeKeys);

    registrationKeys.forEach((registrationKey) => {

      const registration = this._getRegistration(registrationKey);

      const registrationHasAttributes = registration.hasAttributes(attributes);

      if (registrationHasAttributes) {

        foundKeys.push(registration.settings.key);
      }
    });

    return foundKeys;
  }

  public isRegistered(key: string) {

    const registrationKeys = Object.keys(this.registrations);

    const found = registrationKeys.some((registrationKey) => {

      if (registrationKey == key) {

        return true;
      }
    });

    return found;
  }
}
