'use strict';

const path = require('path');
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


  setRequire(requireSettings) {
    if (requireSettings) {
      if (requireSettings.rootPath) {
        const pathDiff = path.relative(__dirname, requireSettings.rootPath);
        this._config.requireRelativePath = pathDiff;
      }
    }
  }


  setDefaults(registrationDefaults) {
    if (registrationDefaults) {

      const defaultSettings = [
        'isSingleton',
        'wantsInjection',
        'isLazy',
        'bindFunctions',
        'autoCreateMissingSubscribers',
        'autoCreateMissingRegistrations',
        'matchKeyToClassName'
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
      throw new Error(`You specified the type '${Object.getPrototypeOf(type).constructor.name}' as the key. A second argument is not valid.`);
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


  require(moduleName) {

    if (typeof moduleName !== 'string') {
      throw new Error(`No module name specified for registration of require`);
    }

    const currentRegistration = TypeRegistration.create({
      defaults: this.config.registrationDefaults,
      key: moduleName,
      type: moduleName,
      isRequire: true
    });

    this.registrations[moduleName] = currentRegistration;

    currentRegistration['as'] = (key) => {

      this.registrations[key] = this.registrations[moduleName];

      delete this.registrations[moduleName];

      currentRegistration.settings.key = key;
    };

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

      this[declaration] = () => {
        this._ensureRegistrationStarted(declaration);
      };
    });
  }

  _ensureRegistrationStarted(declaration) {
    throw new Error(`There is no registration present to use '${declaration}'.
      You can start a registration by calling the 'register' method.`);
  }


  _getRegistration(key) {

    let registration = this.registrations[key];

    if (registration) {
      return registration;
    }

    if (this._config.registrationDefaults.matchKeyToClassName) {

      const matchingRegistration = this.getTypeMatchedByKey(key);

      if (matchingRegistration) {

        return matchingRegistration;
      }
    }

    if (typeof key === 'function' && this._config.registrationDefaults.autoCreateMissingRegistrations) {

      registration = this.register(key);

      return registration;
    }

    throw new Error(`There is no registration created for key '${key}'.`);
  }


  getTypeMatchedByKey(key) {

    const registrationKeys = Object.keys(this.registrations);

    let registration;

    registrationKeys.some((registrationKey) => {

      const possibleRegistration = this.registrations[registrationKey];
      const possibleTypeKey = possibleRegistration.settings.key.toString();

      // if (typeof possibleRegistration.settings.key === 'function' && possibleTypeKey.indexOf('class ' === 0)) {
      if (typeof possibleRegistration.settings.key === 'function' && possibleTypeKey.substring(0, 6) == 'class ') {

        const realKeySegments = possibleTypeKey.split(' ');

        if (realKeySegments.length > 1) {

          const realKey = realKeySegments[1];

          if (realKey == key) {

            registration = possibleRegistration;
            return true;
          }
        }
      }
    });

    return registration;
  }


  resolve(key, injectionArgs, config) {
    return this._resolve(key, injectionArgs, config);
  }


  _resolve(key, injectionArgs, config, resolvedKeyHistory, isLazy) {

    if (typeof injectionArgs !== 'undefined' && !Array.isArray(injectionArgs)) {
      throw new Error(`Injection args must be of type 'Array'.`);
    }

    const registration = this._getRegistration(key);

    if (Array.isArray(resolvedKeyHistory) && resolvedKeyHistory.indexOf(registration.settings.key) >= 0) {
      throw new Error(`Circular dependency on key '${registration.settings.key}' detected.`);
    }

    const resolvedConfig = this._getConfig(registration.settings.key, config);

    if (registration.settings.isSingleton) {

      return this._getInstance(registration, injectionArgs, resolvedConfig);
    }

    if (isLazy) {
      return () => {
        return this._getNewInstance(registration, injectionArgs, resolvedConfig, resolvedKeyHistory);
      };
    }

    return this._getNewInstance(registration, injectionArgs, resolvedConfig, resolvedKeyHistory);
  }


  _getInstance(registration, injectionArgs, config) {

    let instances = this.instances[registration.settings.key];
    let instance = null;

    if (typeof instances === 'undefined') {

      return this._getNewInstance(registration, injectionArgs, config);
    }

    instances = this.instances[registration.settings.key][config][injectionArgs];

    if (Array.isArray(instances)) {

      if (instances.length === 0) {

        return this._getNewInstance(registration, injectionArgs, config);

      } else {

        instance = instances[0];
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


  _getKeysForInstanceInjectionArgumentsByKeyOrTypeAndConfig(keyOrType, config) {

    const instance = this.instances[keyOrType][config];

    if (!instance) {
      return null;
    }

    return Object.keys(instance);
  }


  _getAllInstances(keyOrType, config, injectionArgs) {

    const configKeys = [];

    if (config) {

      configKeys.push(config);

    } else {

      Array.prototype.push.apply(configKeys, this._getKeysForInstanceConfigurationsByKeyOrType(keyOrType));
    }

    if (configKeys.length === 0) {

      return null;
    }

    const allInstances = [];

    if (!configKeys) {
      return allInstances;
    }

    configKeys.forEach((configKey) => {

      const instanceInjectionArgumentKeys = this._getKeysForInstanceInjectionArgumentsByKeyOrTypeAndConfig(keyOrType, config);

      instanceInjectionArgumentKeys.forEach((instanceInjectionArgumentKey) => {

        Array.prototype.push.apply(allInstances, this.instances[keyOrType][configKey][instanceInjectionArgumentKey]);
      });
    });

    return allInstances;
  }


  _getNewInstance(registration, injectionArgs, config, resolvedKeyHistory) {

    const dependencies = this._resolveDependencies(registration, resolvedKeyHistory);

    const instance = this._createInstance(registration, dependencies, injectionArgs);

    this._configureInstance(instance, config);

    this._callSubscribers(registration, 'newInstance', instance);

    this._bindFunctionsToInstance(registration, instance);

    this._cacheInstance(registration.settings.key, instance, injectionArgs, config);

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

      const instancePrototype = Object.getPrototypeOf(instance);

      instanceKeys = Object.getOwnPropertyNames(instancePrototype);
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

      const isLazy = this._isDependencyLazy(registration, dependency);

      const dependencyKey = this._getDependencyKeyOverwritten(registration, dependency);

      const dependencyInstance = this._resolve(dependencyKey, undefined, undefined, resolvedKeyHistory, isLazy);

      resolvedDependencies.push(dependencyInstance);
    });

    return resolvedDependencies;
  }


  _isDependencyLazy(registration, dependency) {

    const isLazy = registration.settings.isLazy && (registration.settings.lazyKeys.length === 0 || registration.settings.lazyKeys.indexOf(dependency) >= 0);

    return isLazy;
  }


  _getDependencyKeyOverwritten(registration, dependency) {

    let dependencyKey = dependency;

    if (registration.settings.overwrittenKeys[dependency]) {

      dependencyKey = registration.settings.overwrittenKeys[dependency];
    }

    return dependencyKey;
  }


  _createInstance(registration, dependencies, injectionArgs) {

    let instance;

    let type = registration.settings.type;

    if (registration.settings.isRequire) {

      let relativeRequirePath;

      if (registration.settings.type.substr(0, 1) === '.') {

        relativeRequirePath = path.join(this.config.requireRelativePath, registration.settings.type);

      } else {

        relativeRequirePath = registration.settings.type;
      }

      type = require(relativeRequirePath);
    }

    const argumentsToBeInjected = dependencies.concat(injectionArgs);

    if (typeof type !== 'function') {

      instance = type;

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {

        this._injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
      }

    } else if (registration.settings.wantsInjection && !registration.settings.injectInto && dependencies.length > 0) {

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

  _createInstanceByFactory(type) {
    const instance = type();
    return instance;
  }

  _createInstanceByFactoryWithInjection(type, argumentsToBeInjected) {
    const instance = type.apply(undefined, argumentsToBeInjected);
    return instance;
  }

  _createInstanceByConstructor(type) {
    const instance = new type();
    return instance;
  }

  _createInstanceByConstructorWithInjection(type, argumentsToBeInjected) {
    const instance = new(Function.prototype.bind.apply(type, [null].concat(argumentsToBeInjected)))();
    return instance;
  }


  _injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected) {

    let propertySource;

    if (registration.settings.isFactory) {

      propertySource = instance;

    } else {

      propertySource = Object.getPrototypeOf(instance);
    }

    const injectionTargetPropertyDescriptor = Object.getOwnPropertyDescriptor(propertySource, registration.settings.injectInto);

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

  _injectDependenciesIntoFunction(instance, targetFunction, argumentsToBeInjected) {
    targetFunction.apply(targetFunction, argumentsToBeInjected);
  }

  _injectDependenciesIntoProperty(instance, property, argumentsToBeInjected) {
    instance[property] = argumentsToBeInjected;
  }


  _getSubscriberRegistrations(keyOrType, subscriptionKey) {

    const subscribers = [];

    const registrationKeys = Object.keys(this.registrations);

    registrationKeys.forEach((registrationKey) => {

      const registration = this.registrations[registrationKey];

      registration.settings.subscriptions[subscriptionKey].some((subscription) => {

        if (subscription.key === keyOrType || subscription.key === '*') {

          subscribers.push(registration);
          return true;
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

      return this._getNewInstance(subscriberRegistration);
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


  _configureInstance(instance, config) {

    if (!config) {
      return;
    }

    const instancePrototype = Object.getPrototypeOf(instance);

    const configPropertyDescriptor = Object.getOwnPropertyDescriptor(instancePrototype, 'config');

    if (configPropertyDescriptor === undefined || !configPropertyDescriptor.set) {
      throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
    }

    instance.config = config;
  }


  _cacheInstance(key, instance, injectionArgs, config) {

    if (!this.instances[key]) {
      this.instances[key] = {};
    }
    if (!this.instances[key][config]) {
      this.instances[key][config] = {};
    }

    if (!this.instances[key][config][injectionArgs]) {
      this.instances[key][config][injectionArgs] = [];
    }

    this.instances[key][config][injectionArgs].push(instance);
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

    if (Array.isArray(optionalKeyOrType)) {

      registrationKeys = optionalKeyOrType;

    } else if (typeof optionalKeyOrType !== 'undefined') {

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

      if (!parentKeyHistory) {

        parentKeyHistory = [];

      } else if (parentKeyHistory.indexOf(registrationKey) >= 0) {

        errors.push(`Circular dependency on key '${registrationKey}' detected.`);
        return;
      }

      const subParentKeyHistory = [];
      Array.prototype.push.apply(subParentKeyHistory, parentKeyHistory);

      subParentKeyHistory.push(registration.settings.key);

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

          parentKeyHistory.push(registration.settings.key);

          const overwrittenKeyValidationErrors = this._validateOverwrittenKeys(registration);
          Array.prototype.push.apply(errors, overwrittenKeyValidationErrors);

          const deepErrors = this._validateDependencies([dependencyRegistration.settings.key], subParentKeyHistory);

          if (deepErrors.length > 0) {

            errors.push(`Inner dependency errors for dependency '${dependencyKeyOverwritten}':
                ${deepErrors.toString()}`);
          }
        }
      }
    });

    return errors;
  }

  _validateOverwrittenKeys(registration) {

    const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);

    const errors = [];

    overwrittenKeys.forEach((overwrittenKey) => {

      this._validateOverwrittenKey(registration, overwrittenKey, errors);
    });

    return errors;
  }

  _validateOverwrittenKey(registration, overwrittenKey, errors) {

    if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {

      errors.push(`No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`);
    }

    const overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
    const overwrittenKeyRegistration = this._getRegistration(overwrittenKeyValue);

    if (!overwrittenKeyRegistration) {

      errors.push(`Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`);
    }
  }

  getKeysByTags(tagOrTags) {

    const allTags = [];

    if (Array.isArray(tagOrTags)) {

      Array.prototype.push.apply(allTags, tagOrTags);
    } else if (typeof tagOrTags === 'string') {

      allTags.push(tagOrTags);
    }

    const foundKeys = [];

    const registrationKeys = Object.keys(this.registrations);

    registrationKeys.forEach((registrationKey) => {

      const registration = this.registrations[registrationKey];

      if (registration._hasTags(allTags)) {

        foundKeys.push(registration.settings.key);
      }
    });

    return foundKeys;
  }


  getKeysByAttributes(attributes) {

    const foundKeys = [];

    const attributeKeys = Object.keys(attributes);

    const registrationKeys = this.getKeysByTags(attributeKeys);

    registrationKeys.forEach((registrationKey) => {

      const registration = this._getRegistration(registrationKey);

      const registrationHasAttributes = registration._hasAttributes(attributes);

      if (registrationHasAttributes) {

        foundKeys.push(registration.settings.key);
      }
    });

    return foundKeys;
  }
}

const containerConfig = {
  registrationDefaults: {
    isSingleton: false,
    wantsInjection: true,
    isLazy: false,
    bindFunctions: false,
    autoCreateMissingSubscribers: true,
    autoCreateMissingRegistrations: false,
    matchKeyToClassName: true
  }
};

module.exports = new DependencyInjectionContainer(containerConfig);
