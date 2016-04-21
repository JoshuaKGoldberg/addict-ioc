'use strict';

const TypeRegistration = require('./registration');

class DependencyInjectionContainer {

  constructor(config) {
    this._config = config;
    this._registrations = {};
    this._instances = {};

    this._initializeRegistrationDeclarations();
  }


  clear() {
    this._registrations = {};
    this._instances = {};
  }


  get config() {
    return this._config;
  }

  get registrations() {
    return this._registrations;
  }

  get instances() {
    return this._instances;
  }


  setDefaults(registrationDefaults) {
    if (registrationDefaults) {

      const defaultSettings = [
        'isSingleton',
        'wantsInjection',
        'isLazy',
        'bindFunctions',
        'autoCreateMissingSubscribers',
        'autoCreateMissingRegistrations'
      ];

      defaultSettings.forEach((defaultSetting) => {

        const defaultSettingValue = registrationDefaults[defaultSetting];

        this._setDefault(defaultSetting, defaultSettingValue);
      });
    }
  }

  _setDefault(settingKey, value) {

    if (this._isValidBoolean(value)) {

      this._config.registrationDefaults[settingKey] = value;

      return true;
    }
    return false;
  }

  _isValidBoolean(settingValue) {
    return typeof settingValue === 'boolean';
  }


  register(keyOrType, type) {

    const keyType = typeof keyOrType;

    let currentRegistration;

    if (keyType === 'function') {

      currentRegistration = this._registerType(keyOrType, type);

    } else if (keyType === 'string') {

      currentRegistration = this._registerTypeByKey(keyOrType, type);

    } else {

      throw new Error(`The key type '${keyOrType}' is not supported.`);
    }

    this.registrations[keyOrType] = currentRegistration;

    return currentRegistration;
  }


  unregister(keyOrType) {

    if (this.registrations[keyOrType]) {

      delete this.registrations[keyOrType];

    } else {

      throw new Error(`The key '${keyOrType}' is not registered.`);
    }
  }


  _registerType(keyOrType, type) {

    if (!!type) {
      throw new Error(`You specified the type '${type.__proto__.constructor.name}' as the key. A second argument is not valid.`);
    }

    return TypeRegistration.create({
      defaults: this.config.registrationDefaults,
      key: keyOrType,
      type: keyOrType
    });
  }


  _registerTypeByKey(keyOrType, type) {

    if (!keyOrType) {
      throw new Error(`No key specified for registration of type '${type}'`);
    }

    if (!type) {
      throw new Error(`No type specified for registration of key '${keyOrType}'`);
    }

    return TypeRegistration.create({
      defaults: this.config.registrationDefaults,
      key: keyOrType,
      type: type
    });
  }


  registerFactory(key, factoryMethod) {

    if (typeof key !== 'string') {
      throw new Error(`No key specified for registration of factory function '${factoryMethod}'`);
    }

    const currentRegistration = TypeRegistration.create({
      defaults: this.config.registrationDefaults,
      key: key,
      type: factoryMethod,
      isFactory: true
    });

    this.registrations[key] = currentRegistration;

    return currentRegistration;
  }


  _initializeRegistrationDeclarations() {

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

      this[declaration] = this._ensureRegistrationStarted(declaration);
    });
  }

  _ensureRegistrationStarted(declaration) {
    throw new Error(`There is no registration present to use '${declaration}'.
      You can start a registration by calling the 'register' method.`);
  }


  _getRegistration(key) {

    let registration = this._registrations[key];

    if (!registration) {

      if (typeof key === 'function' && this._config.registrationDefaults.autoCreateMissingRegistrations) {

        registration = this.register(key);

        if (config) {
          registration.configure(config);
        }

      } else {
        throw new Error(`There is no registration created for key '${key}'.`);
      }
    }

    return registration;
  }


  resolve(key, config) {
    return this._resolve(key, config);
  }


  _resolve(key, config, resolvedKeyHistory, isLazy) {

    const registration = this._getRegistration(key);

    if (resolvedKeyHistory && resolvedKeyHistory.indexOf(registration.settings.key) >= 0) {
      throw new Error(`Circular dependency on key '${registration.settings.key}' detected.`);
    }

    const resolvedConfig = this._getConfig(registration.settings.key, config);

    if (registration.settings.isSingleton) {
      return this._getInstance(registration, resolvedConfig);
    }

    if (isLazy) {
      return () => {
        return this._getNewInstance(registration, resolvedConfig, resolvedKeyHistory);
      };
    }

    return this._getNewInstance(registration, resolvedConfig, resolvedKeyHistory);
  }


  _getInstance(registration, config) {

    const instances = this.instances[registration.settings.key];

    if (!instances) {

      return this._getNewInstance(registration, config);
    }

    let instance = instances[config];

    if (!instance) {

      instance = this._getNewInstance(registration, config);
    }

    if (Array.isArray(instance)) {

      if (instance.length === 0) {

        instance = null;

      } else {

        instance = instance[0];
      }
    }

    return instance;
  }


  _getKeysForInstanceConfigurationsByKeyOrType(keyOrType) {

    const instance = this.instances[keyOrType];

    if (!instance) {
      return null;
    }

    return Object.keys(instance);
  }


  _getAllInstances(keyOrType) {

    const configKeys = this._getKeysForInstanceConfigurationsByKeyOrType(keyOrType);

    if (configKeys === null) {

      return null;
    }

    const allInstances = [];

    if (!configKeys) {
      return allInstances;
    }

    configKeys.forEach((configKey) => {

      Array.prototype.push.apply(allInstances, this.instances[keyOrType][configKey]);
    })

    return allInstances;
  }


  _getNewInstance(registration, config, resolvedKeyHistory) {

    const dependencies = this._resolveDependencies(registration, resolvedKeyHistory);

    const instance = this._createInstance(registration, dependencies);

    this._configureInstance(instance, config);

    this._callSubscribers(registration, 'newInstance', instance);

    this._bindFunctionsToInstance(registration, instance);

    this._cacheInstance(registration.settings.key, instance, config);

    return instance;
  }


  _bindFunctionsToInstance(registration, instance) {

    if (!registration.settings.bindFunctions) {
      return;
    }

    let instanceKeys;

    if (registration.settings.functionsToBind.length > 0) {

      instanceKeys = registration.settings.functionsToBind;

    } else {

      instanceKeys = Object.getOwnPropertyNames(instance.__proto__);
    }

    instanceKeys.forEach((instanceKey) => {

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


  resolveDependencies(key) {

    const registration = this._getRegistration(key);

    return this._resolveDependencies(registration);
  }


  _resolveDependencies(registration, resolvedKeyHistory) {

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

      const dependencyInstance = this._resolve(dependency, null, resolvedKeyHistory, registration.settings.isLazy);

      resolvedDependencies.push(dependencyInstance);
    });

    return resolvedDependencies;
  }


  _createInstance(registration, dependencies) {

    let instance;

    if (registration.settings.wantsInjection && !registration.settings.injectInto && dependencies.length > 0) {

      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactoryWithInjection(registration, dependencies);

      } else {

        instance = this._createInstanceByConstructorWithInjection(registration, dependencies);
      }

    } else {

      if (registration.settings.isFactory) {

        instance = this._createInstanceByFactory(registration);

      } else {

        instance = this._createInstanceByConstructor(registration);
      }

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto !== 'undefined') {

        this._injectDependenciesIntoInstance(registration, instance, dependencies);
      }
    }

    return instance;
  }

  _createInstanceByFactory(registration) {
    const instance = registration.settings.type();
    return instance;
  }


  _createInstanceByFactoryWithInjection(registration, dependencies) {
    const instance = registration.settings.type.apply(undefined, dependencies);
    return instance;
  }


  _createInstanceByConstructor(registration) {
    const instance = new registration.settings.type();
    return instance;
  }


  _createInstanceByConstructorWithInjection(registration, dependencies) {
    const instance = new(Function.prototype.bind.apply(registration.settings.type, [null].concat(dependencies)))();
    return instance;
  }

  _getSubscriberRegistrations(keyOrType, subscriptionKey) {

    const subscribers = [];

    const registrationKeys = Object.keys(this.registrations);

    registrationKeys.forEach((registrationKey) => {

      const registration = this.registrations[registrationKey];

      registration.settings.subscriptions[subscriptionKey].forEach((subscription) => {

        if (subscription.key === keyOrType) {

          subscribers.push(registration);
        }
      });
    });

    return subscribers;
  }


  _getSubscriptionFromRegistrationByKeyOrType(registration, subscriptionKey, keyOrType) {

    let resultSubscription = null;
    registration.settings.subscriptions[subscriptionKey].some((subscription) => {

      if (subscription.key === keyOrType) {

        resultSubscription = subscription;
        return true;
      }
    });

    return resultSubscription;
  }


  _callSubscribers(registration, subscriptionKey, params) {

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

  _createMissingSubscriber(subscriberRegistration) {

    if (subscriberRegistration.settings.autoCreateMissingSubscribers) {

      const newInstance = this._getNewInstance(subscriberRegistration);

      return newInstance;

    }

    throw new Error(`There is no instance created for key '${subscriberRegistration.settings.key}'.`);
  }


  _callSubscriber(subscribedRegistration, subscriptionKey, subscriberRegistration, subscribedInstance, params) {

    if (!Array.isArray(params)) {
      params = [params];
    }

    const methodSubscription = this._getSubscriptionFromRegistrationByKeyOrType(subscriberRegistration, subscriptionKey, subscribedRegistration.settings.key);

    const subscribedMethod = subscribedInstance[methodSubscription.method];

    subscribedMethod.apply(subscribedInstance, params);
  }


  _injectDependenciesIntoInstance(registration, instance, dependencies) {

    let propertySource;

    if (registration.settings.isFactory) {

      propertySource = instance;

    } else {

      propertySource = instance.__proto__;
    }

    const injectionTargetPropertyDescriptor = Object.getOwnPropertyDescriptor(propertySource, registration.settings.injectInto);

    if (injectionTargetPropertyDescriptor) {

      if (typeof injectionTargetPropertyDescriptor.value === 'function') {

        this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, dependencies);

      } else if (injectionTargetPropertyDescriptor.set) {

        this._injectDependenciesIntoProperty(instance, registration.settings.injectInto, dependencies);

      } else {
        throw new Error(`The setter for the '${registration.settings.injectInto}' property on type '${instance.__proto__.constructor.name}' is missing.`);
      }

    } else {
      throw new Error(`The injection target '${registration.settings.injectInto}' on type '${instance.__proto__.constructor.name}' is missing.`);
    }
  }


  _injectDependenciesIntoFunction(instance, targetFunction, dependencies) {
    targetFunction.apply(targetFunction, dependencies);
  }


  _injectDependenciesIntoProperty(instance, property, dependencies) {
    instance[property] = dependencies;
  }


  _configureInstance(instance, config) {

    if (!config) {
      return;
    }

    const configPropertyDescriptor = Object.getOwnPropertyDescriptor(instance.__proto__, 'config');

    if (configPropertyDescriptor === undefined || !configPropertyDescriptor.set) {
      throw new Error(`The setter for the config property on type '${instance.__proto__.constructor.name}' is missing.`);
    }

    instance.config = config;
  }


  _cacheInstance(key, instance, config) {

    if (!this.instances[key]) {
      this.instances[key] = [];
    }

    if (!this.instances[key][config]) {
      this.instances[key][config] = [];
    }

    this.instances[key][config].push(instance);
  }


  _getConfig(key, config) {

    if (!config) {
      config = this.registrations[key].settings.config;
    }

    const resolvedConfig = this._resolveConfig(key, config);

    return resolvedConfig;
  }


  _resolveConfig(key, config) {

    let resolvedConfig;

    const configType = typeof config;

    if (configType === 'function') {
      resolvedConfig = config(key);

      if (!resolvedConfig) {
        throw new Error(`The specified config function returned undefined.`);
      }

    } else if (configType === 'object') {
      resolvedConfig = config;

      if (!resolvedConfig) {
        throw new Error(`The specified config is undefined.`);
      }

    } else if (configType !== 'undefined') {

      throw new Error(`The type '${configType}' of your config declaration is not yet supported.
      Supported types: 'Function', 'Object'`);
    }

    return resolvedConfig;
  }


  validateDependencies(optionalKeyOrType) {

    let registrationKeys;

    if (typeof optionalKeyOrType !== 'undefined') {

      registrationKeys = [optionalKeyOrType];

    } else {

      registrationKeys = Object.keys(this.registrations);
    }

    const errors = this._validateDependencies(registrationKeys);

    if (errors.length > 0) {
      throw new Error(`Errors during validation of dependencies:
        ${errors.toString()}`);
    }
  }


  _validateDependencies(registrationKeys, parentKeyHistory) {
    const errors = [];

    registrationKeys.forEach((registrationKey) => {

      const registration = this.registrations[registrationKey];
      const dependencies = registration.settings.dependencies;

      if (!dependencies) {
        return;
      }

      for (let dependencyIndex = 0; dependencyIndex < dependencies.length; dependencyIndex++) {

        const dependency = this.registrations[dependencies[dependencyIndex]];

        if (!dependency) {

          errors.push(`Dependency '${dependencies[dependencyIndex]}' registered on '${registration.settings.key}' is missing.`);

        } else if (dependency.settings.dependencies) {


          if (!parentKeyHistory) {

            parentKeyHistory = [];

          } else if (parentKeyHistory.indexOf(dependencies[dependencyIndex]) >= 0) {

            errors.push(`Circular dependency on key '${dependencies[dependencyIndex]}' detected.`);
            return;
          }

          parentKeyHistory.push(registration.settings.key);


          const deepErrors = this._validateDependencies([dependency.settings.key], parentKeyHistory);

          if (deepErrors.length > 0) {

            errors.push(`Inner dependency errors for dependency '${dependencies[dependencyIndex]}':
                ${deepErrors.toString()}`);
          }
        }
      }
    });

    return errors;
  }
}

const containerConfig = {
  registrationDefaults: {
    isSingleton: false,
    wantsInjection: true,
    isLazy: false,
    bindFunctions: false,
    autoCreateMissingSubscribers: true,
    autoCreateMissingRegistrations: false
  }
};

module.exports = new DependencyInjectionContainer(containerConfig);
