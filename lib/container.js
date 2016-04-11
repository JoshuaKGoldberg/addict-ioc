'use strict';

const TypeRegistration = require('./registration');

class DependencyInjectionContainer {

  constructor(config) {
    this._config = config;
    this._registrations = {};
    this._instances = {};
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
      if (typeof registrationDefaults.isSingleton === 'boolean') {
        this._config.registrationDefaults.isSingleton = registrationDefaults.isSingleton;
      }
      if (typeof registrationDefaults.wantsInjection === 'boolean') {
        this._config.registrationDefaults.wantsInjection = registrationDefaults.wantsInjection;
      }
      if (typeof registrationDefaults.isLazy === 'boolean') {
        this._config.registrationDefaults.isLazy = registrationDefaults.isLazy;
      }
    }
  }

  register(keyOrType, type) {

    const keyType = typeof keyOrType;

    let currentRegistration;

    if (keyType === 'function') {

      if (!!type) {
        throw new Error(`You specified the type '${instance.__proto__.constructor.name}' as the key. A second argument is not valid.`);
      }

      currentRegistration = new TypeRegistration(this.config.registrationDefaults, keyOrType, keyOrType);

    } else if (keyType === 'string') {

      if (!keyOrType) {
        throw new Error(`No key specified for registration of type '${type}'`);
      }

      if (!type) {
        throw new Error(`No type specified for registration of key '${keyOrType}'`);
      }

      currentRegistration = new TypeRegistration(this.config.registrationDefaults, keyOrType, type);

    } else {

      throw new Error(`The key type '${keyOrType}' is not supported.`);
    }

    this.registrations[keyOrType] = currentRegistration;

    return currentRegistration;
  }


  ensureRegistrationStarted() {
    throw new Error(`There is no registration present to configure.
      You can start a registration by calling the register method.`);
  }

  dependencies(dependencies) {
    this.ensureRegistrationStarted();
  }

  configure(config) {
    this.ensureRegistrationStarted();
  }

  singleton(isSingleton) {
    this.ensureRegistrationStarted();
  }

  noInjection(injectionDisabled) {
    this.ensureRegistrationStarted();
  }

  injectInto(targetFunction) {
    this.ensureRegistrationStarted();
  }

  injectLazy(isLazy) {
    this.ensureRegistrationStarted();
  }


  _getRegistration(key) {

    const registration = this._registrations[key];

    if (!registration) {
      throw new Error(`Dependency for key '${key}' has not been registered.`);
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

    return instance;
  }


  _getNewInstance(registration, config, resolvedKeyHistory) {

    const dependencies = this._resolveDependencies(registration, resolvedKeyHistory);

    const instance = this._createInstance(registration, dependencies);

    this._configureInstance(instance, config);

    this._cacheInstance(registration.settings.key, instance, config);

    return instance;
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

      // This does the constructor injection
      instance = new(Function.prototype.bind.apply(registration.settings.type, [null].concat(dependencies)))();

    } else {

      /* jshint newcap: false */
      /* jscs:disable requireCapitalizedConstructors */
      instance = new registration.settings.type();
      /* jscs:enable requireCapitalizedConstructors */
      /* jshint newcap: true */

      if (registration.settings.wantsInjection && typeof registration.settings.injectInto !== 'undefined') {

        this._injectDependenciesIntoInstance(registration, instance, dependencies);
      }
    }

    return instance;
  }


  _injectDependenciesIntoInstance(registration, instance, dependencies) {

    const injectionTargetPropertyDescriptor = Object.getOwnPropertyDescriptor(instance.__proto__, registration.settings.injectInto);

    if (injectionTargetPropertyDescriptor) {

      if (typeof injectionTargetPropertyDescriptor.value === 'function') {

        // The injectionTarget is a regular function
        injectionTargetPropertyDescriptor.value.apply(injectionTargetPropertyDescriptor.value, dependencies);

      } else if (injectionTargetPropertyDescriptor.set) {

        // The injectionTarget is a property and has a setter
        instance[registration.settings.injectInto] = dependencies;

      } else {
        throw new Error(`The setter for the '${registration.settings.injectInto}' property on type '${instance.__proto__.constructor.name}' is missing.`);
      }

    } else {
      throw new Error(`The injection target '${registration.settings.injectInto}' on type '${instance.__proto__.constructor.name}' is missing.`);
    }
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
}

const containerConfig = {
  registrationDefaults: {
    isSingleton: false,
    wantsInjection: true,
    isLazy: false
  }
};

module.exports = new DependencyInjectionContainer(containerConfig);
