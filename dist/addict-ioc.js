import * as path from 'path';


interface IDependencyInjectionContainerConfig {
  registrationDefaults: TypeRegistrationSettings;
  injectContainerKey: string;
  circularDependencyCanIncludeSingleton: boolean;
  circularDependencyCanIncludeLazy: boolean;
}

interface IProvideConfig {
  get: (config: string) => any;
}

interface ITypeRegistrationSettings {
  defaults: TypeRegistrationSettings;
  key: any;
  type: any;
  isFactory: boolean;
  isRequire: boolean;
  dependencies: string|string[];
  tags: any;
  config: any;
  isSingleton: boolean;
  wantsInjection: boolean;
  injectInto: string;
  isLazy: boolean;
  bindFunctions: boolean;
  functionsToBind: string|string[];
  lazyKeys: string|string[];
  overwrittenKeys: string|string[];
  autoCreateMissingSubscribers: boolean;
  autoCreateMissingRegistrations: boolean;
  isRequire: boolean;
}


export class TypeRegistrationSettings implements ITypeRegistrationSettings  {

  constructor(defaults: TypeRegistrationSettings,
    key: any,
    type: any,
    isFactory: boolean,
    isRequire: boolean) {

      this._defaults = defaults;
      this._key = key;
      this._type = type;
      this._subscriptions = {
        newInstance: []
      };
      this._isFactory = isFactory;
      this._isRequire = isRequire;
      this._functionsToBind = [];
      this._lazyKeys = [];
      this._tags = {};
      this._overwrittenKeys = {};
    }

    get defaults() {
      return this._defaults;
    }

    get key() {
      return this._key;
    }

    set key(value: any) {
      this._key = value;
    }

    get type() {
      return this._type;
    }

    get isFactory() {
      return typeof this._isFactory !== 'undefined' ? this._isFactory : false;
    }

    get dependencies() {
      return this._dependencies;
    }

    set dependencies(value: string|string[]) {
      this._dependencies = value;
    }

    get tags() {
      return this._tags;
    }

    set tags(value: any) {
      this._tags = value;
    }

    get subscriptions() {
      return this._subscriptions;
    }

    get config() {
      return this._config;
    }

    set config(value: any) {
      this._config = value;
    }

    get isSingleton() {
      return typeof this._isSingleton !== 'undefined' ? this._isSingleton : this.defaults.isSingleton;
    }

    set isSingleton(value: boolean) {
      this._isSingleton = value;
    }

    get wantsInjection() {
      return typeof this._wantsInjection !== 'undefined' ? this._wantsInjection : this.defaults.wantsInjection;
    }

    set wantsInjection(value: boolean) {
      this._wantsInjection = value;
    }

    get injectInto() {
      return this._injectInto;
    }

    set injectInto(value: string) {
      this._injectInto = value;
    }

    get isLazy() {
      return this._isLazy !== 'undefined' ? this._isLazy : this.defaults.isLazy;
    }

    set isLazy(value: boolean) {
      this._isLazy = value;
    }

    get bindFunctions() {
      return this._bindFunctions !== 'undefined' ? this._bindFunctions : this.defaults.bindFunctions;
    }

    set bindFunctions(value: boolean) {
      this._bindFunctions = value;
    }

    get functionsToBind() {
      return this._functionsToBind;
    }

    get lazyKeys() {
      return this._lazyKeys;
    }

    get overwrittenKeys() {
      return this._overwrittenKeys;
    }

    get autoCreateMissingSubscribers() {
      return this._autoCreateMissingSubscribers ? this._autoCreateMissingSubscribers : this.defaults.autoCreateMissingSubscribers;
    }

    set autoCreateMissingSubscribers(value: boolean) {
      this._autoCreateMissingSubscribers = value;
    }

    get autoCreateMissingRegistrations() {
      return this._autoCreateMissingRegistrations ? this._autoCreateMissingRegistrations : this.defaults.autoCreateMissingRegistrations;
    }

    set autoCreateMissingRegistrations(value: boolean) {
      this._autoCreateMissingRegistrations = value;
    }

    get isRequire() {
      return typeof this._isRequire !== 'undefined' ? this._isRequire : false;
    }

    set isRequire(value: boolean) {
      this._isRequire = value;
    }
}

export class TypeRegistration {

  constructor(defaults: TypeRegistrationSettings,
    key: any,
    type: any,
    isFactory: boolean,
    isRequire: boolean) {
    this._settings = new TypeRegistrationSettings(defaults, key, type, isFactory, isRequire);
  }

  get settings() {
    return this._settings;
  }

  set settings(value: TypeRegistrationSettings) {
    this._settings = value;
  }


  dependencies() {

    const resolvedDepedencyConfigurations = [];

    const argumentKeys: string[] = Object.keys(arguments);

    argumentKeys.forEach((argumentKey: string) => {

      const currentDependencyConfiguration: any = arguments[argumentKey];

      const dependencyType: any = typeof currentDependencyConfiguration;

      if (Array.isArray(currentDependencyConfiguration)) {

        Array.prototype.push.apply(resolvedDepedencyConfigurations, currentDependencyConfiguration);

      } else if (dependencyType === 'string' || dependencyType === 'function') {

        resolvedDepedencyConfigurations.push(currentDependencyConfiguration);

      } else {

        throw new Error(`The type '${dependencyType}' of your dependencies declaration is not yet supported.
                Supported types: 'Array', 'String', 'Function(Type)'`);
      }
    });

    this.settings.dependencies = resolvedDepedencyConfigurations;

    return this;
  }


  configure(config: any) {

    const configType = typeof config;

    if (configType !== 'function' && configType !== 'object' && configType !== 'string') {

      throw new Error(`The type '${configType}' of your dependencies declaration is not yet supported.
              Supported types: 'Function', 'Object'`);
    }

    this.settings.config = config;

    return this;
  }


  singleton(isSingleton: boolean) {

    this.settings.isSingleton = !!isSingleton ? isSingleton : true;

    return this;
  }


  noInjection(injectionDisabled: boolean) {

    if (this.settings.injectInto) {
      throw new Error(`'noInjection' induces a conflict to the 'injectInto' declaration.`);
    }

    if (this.settings.isLazy) {
      throw new Error(`'noInjection' induces a conflict to the 'injectLazy' declaration.`);
    }

    this.settings.wantsInjection = !!injectionDisabled ? !injectionDisabled : false;

    return this;
  }


  injectInto(targetFunction: string) {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectInto' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.injectInto = targetFunction;

    return this;
  }


  injectLazy() {

    if (!this.settings.wantsInjection) {
      throw new Error(`'injectLazy' induces a conflict to the 'noInjection' declaration.`);
    }

    this.settings.isLazy = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.lazyKeys, arguments);
    }

    return this;
  }


  onNewInstance(key: any, targetFunction: string) {

    const subscription = {
      key: key,
      method: targetFunction
    };

    this.settings.subscriptions.newInstance.push(subscription);

    return this;
  }


  bindFunctions() {

    this.settings.bindFunctions = true;

    if (arguments.length > 0) {

      Array.prototype.push.apply(this.settings.functionsToBind, arguments);
    }

    return this;
  }

  tags(tagOrTags: string|string[]) {

    for (let argumentIndex: number = 0; argumentIndex < arguments.length; argumentIndex++) {

      const argument: string = arguments[argumentIndex];
      const argumentType: string = typeof argument;

      if (Array.isArray(argument)) {

        argument.forEach((tag: string) => {

          this.settings.tags[tag] = {};
        });

      } else if (argumentType === 'string') {

        this.settings.tags[argument] = {};

      } else {

        throw new Error(`The type '${argumentType}' of your tags declaration is not yet supported.
                Supported types: 'Array', 'String'`);
      }
    }

    return this;
  }

  setAttribute(tag: string, value: any) {

    if (!tag) {
      throw new Error(`You have to specify a tag for your attribute.`);
    }

    this.settings.tags[tag] = value;

    return this;
  }

  _hasTags(tags: string|string[]) {

    const declaredTags = Object.keys(this.settings.tags);

    const isTagMissing = tags.some((tag) => {

      if (declaredTags.indexOf(tag) < 0) {

        return true;
      }
    });

    return !isTagMissing;
  }

  _hasAttributes(attributes: any) {

    const attributeKeys = Object.keys(attributes);

    const attributeMissing = attributeKeys.some((attribute) => {

      const attributeValue = this.settings.tags[attribute];

      if (attributeValue !== attributes[attribute]) {

        return true;
      }
    });

    return !attributeMissing;
  }

  overwrite(originalKey: any, overwrittenKey: any) {

    if (this.settings.dependencies.indexOf(originalKey) < 0) {
      throw new Error(`there is no dependency declared for original key '${originalKey}'.`);
    }

    this.settings.overwrittenKeys[originalKey] = overwrittenKey;

    return this;
  }
}

export function create(options: any) {
  return new TypeRegistration(options.defaults, options.key, options.type, options.isFactory, options.isRequire);
}

export class DependencyInjectionContainer {

    constructor(config: IDependencyInjectionContainerConfig) {
      this._config = config;
      this._registrations = {};
      this._instances = {};

      this._initializeRegistrationDeclarations();
      this._initializeBaseRegistrations();
    }


    clear() {
      this._registrations = {};
      this._instances = {};

      this._initializeBaseRegistrations();
    }

    get config(): any {
      return this._config;
    }

    get registrations() {
      return this._registrations;
    }

    get instances() {
      return this._instances;
    }

    get externalConfigProvider(): IProvideConfig {
      return this._externalConfigProvider;
    }


    setRequire(rootPath: string) {
        if (rootPath) {
          const pathDiff = path.relative(__dirname, rootPath);
          this._config.requireRelativePath = pathDiff;
        }
    }


    setConfigProvider(getConfigCallback: IProvideConfig) {

      if (typeof getConfigCallback === 'function' && getConfigCallback !== null) {

        this._externalConfigProvider = getConfigCallback;

      } else {

        throw new Error('Config provider must be a function.');
      }
    }


    setDefaults(registrationDefaults: ITypeRegistrationSettings) {
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

    _setDefault(settingKey: string, value: any) {

      if (this._isValidBoolean(value)) {

        this._config.registrationDefaults[settingKey] = value;

        return true;
      }
      return false;
    }

    _isValidBoolean(settingValue: any) {
      return typeof settingValue === 'boolean';
    }


    register(key: any, type: any): TypeRegistration {

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


    unregister(key: any) {

      if (this.registrations[key]) {

        delete this.registrations[key];

      } else {

        throw new Error(`The key '${key}' is not registered.`);
      }
    }


    _registerTypeByKey(key: any, type: any) {

      if (!key) {
        throw new Error(`No key specified for registration of type '${type}'`);
      }

      if (!type) {
        throw new Error(`No type specified for registration of key '${key}'`);
      }

      return TypeRegistration.create({
        defaults: this.config.registrationDefaults,
        key: key,
        type: type
      });
    }


    registerFactory(key: any, factoryMethod: any) {

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

    registerObject(key: any, object: any) {

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


    require(moduleName: string) {

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

    _initializeBaseRegistrations() {
      this.registerObject(this.config.injectContainerKey, this);
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


    _getRegistration(key: any) {

      const registration = this.registrations[key];

      if (registration) {
        return registration;
      }

      throw new Error(`There is no registration created for key '${key}'.`);
    }


    resolve(key: any, injectionArgs: Array<any>, config: any) {
      return this._resolve(key, injectionArgs, config);
    }


    _resolve(key: any, injectionArgs: Array<any>, config: any, resolvedKeyHistory: Array<any>, isLazy: boolean) {

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


    _resolveInstance(registration: TypeRegistration, injectionArgs: Array<any>, config: any, resolvedKeyHistory: Array<any>, isLazy: boolean) {

      if (Array.isArray(resolvedKeyHistory) && resolvedKeyHistory.indexOf(registration.settings.key) >= 0) {
        throw new Error(`Circular dependency on key '${registration.settings.key}' detected.`);
      }

      const resolvedRegistrationConfig = this._getConfig(registration.settings.key);

      const resolvedRuntimeConfig = this._resolveConfig(registration.settings.key, config);

      const configUsed = this._mergeConfig(resolvedRegistrationConfig, resolvedRuntimeConfig);

      if (registration.settings.isSingleton) {

        return this._getInstance(registration, injectionArgs, configUsed);
      }

      if (isLazy) {
        return (lazyInjectionArgs, lazyConfig) => {

          const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);

          const lazyConfigUsed = this._mergeConfig(configUsed, lazyConfig);

          return this._getNewInstance(registration, injectionArgsUsed, lazyConfigUsed, resolvedKeyHistory);
        };
      }

      return this._getNewInstance(registration, injectionArgs, configUsed, resolvedKeyHistory);
    }


    _mergeArguments(baseArgs: Array<any>, additionalArgs: Array<any>) {

      if (additionalArgs && !Array.isArray(additionalArgs)){
        throw new Error('Arguments have to be of type Array');
      }

      if (!baseArgs) {
        return additionalArgs;
      }

      const argsUsed = baseArgs || undefined;

      if (!Array.isArray(argsUsed)){
        throw new Error('Arguments have to be of type Array');
      }

      const finalArgs = Array.prototype.push.apply(argsUsed, additionalArgs);

      return finalArgs;
    }


    _mergeConfig(baseConfig: any, additionalConfig: any) {
      const configUsed = baseConfig || undefined;

      if (!configUsed) {
        return additionalConfig;
      }

      const finalConfig = Object.assign(configUsed, additionalConfig);

      return finalConfig;
    }


    _getInstance(registration: TypeRegistration, injectionArgs: Array<any>, config: any) {

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


    _getKeysForInstanceConfigurationsByKey(key: any) {

      const instance = this.instances[key];

      if (!instance) {
        return null;
      }

      return Object.keys(instance);
    }


    _getKeysForInstanceInjectionArgumentsByKeyAndConfig(key: any, config: any) {

      const instance = this.instances[key][config];

      if (!instance) {
        return null;
      }

      return Object.keys(instance);
    }


    _getAllInstances(key: any, config: any, injectionArgs: Array<any>) {

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


    _getNewInstance(registration: TypeRegistration, injectionArgs: Array<any>, config: any, resolvedKeyHistory: Array<any>) {

      const dependencies = this._resolveDependencies(registration, resolvedKeyHistory);

      const instance = this._createInstance(registration, dependencies, injectionArgs);

      this._configureInstance(instance, config);

      this._callSubscribers(registration, 'newInstance', instance);

      this._bindFunctionsToInstance(registration, instance);

      this._cacheInstance(registration.settings.key, instance, injectionArgs, config);

      return instance;
    }


    _bindFunctionsToInstance(registration: TypeRegistration, instance: any) {

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


    resolveDependencies(key: any) {

      const registration = this._getRegistration(key);

      return this._resolveDependencies(registration);
    }


    _resolveDependencies(registration: any, resolvedKeyHistory: Array<any>) {

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


    _isDependencyLazy(registration: TypeRegistration, dependency: string) {

      const isLazy = registration.settings.isLazy && (registration.settings.lazyKeys.length === 0 || registration.settings.lazyKeys.indexOf(dependency) >= 0);

      return isLazy;
    }


    _getDependencyKeyOverwritten(registration: TypeRegistration, dependency: string) {

      let dependencyKey = dependency;

      if (registration.settings.overwrittenKeys[dependency]) {

        dependencyKey = registration.settings.overwrittenKeys[dependency];
      }

      return dependencyKey;
    }


    _createInstance(registration: TypeRegistration, dependencies: Array<any>, injectionArgs: Array<any>) {

      let instance;

      let type = registration.settings.type;

      if (registration.settings.isRequire) {

        let relativeRequirePath: string;

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

    _createInstanceByFactory(type: any) {
      const instance = type();
      return instance;
    }

    _createInstanceByFactoryWithInjection(type: any, argumentsToBeInjected: Array<any>) {
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


    _injectDependenciesIntoInstance(registration: TypeRegistration, instance: any, argumentsToBeInjected: Array<any>) {

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

    _getPropertyDescriptor(type: any, key: string) {

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

    _injectDependenciesIntoFunction(instance: any, targetFunction: string, argumentsToBeInjected: Array<any>) {
      targetFunction.apply(targetFunction, argumentsToBeInjected);
    }

    _injectDependenciesIntoProperty(instance: any, property: string, argumentsToBeInjected: Array<any>) {
      instance[property] = argumentsToBeInjected;
    }


    _getSubscriberRegistrations(key: any, subscriptionKey: string) {

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


    _getSubscriptionFromRegistrationByKey(registration: TypeRegistration, subscriptionKey: string, key: any) {

      let resultSubscription = null;
      registration.settings.subscriptions[subscriptionKey].some((subscription) => {

        if (subscription.key === key) {

          resultSubscription = subscription;
          return true;
        }
      });

      return resultSubscription;
    }


    _callSubscribers(registration: TypeRegistration, subscriptionKey: string, params: Array<any>) {

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


    _createMissingSubscriber(subscriberRegistration: TypeRegistration) {

      if (subscriberRegistration.settings.autoCreateMissingSubscribers) {

        return this._getNewInstance(subscriberRegistration);
      }

      throw new Error(`There is no instance created for key '${subscriberRegistration.settings.key}'.`);
    }


    _callSubscriber(subscribedRegistration: TypeRegistration, subscriptionKey: string, subscriberRegistration: TypeRegistration, subscribedInstance: any, params: Array<any>) {

      if (!Array.isArray(params)) {
        params = [params];
      }

      const methodSubscription = this._getSubscriptionFromRegistrationByKey(subscriberRegistration, subscriptionKey, subscribedRegistration.settings.key);

      const subscribedMethod = subscribedInstance[methodSubscription.method];

      subscribedMethod.apply(subscribedInstance, params);
    }


    _configureInstance(instance: any, config: any) {

      if (!config) {
        return;
      }

      const configPropertyDescriptor = this._getPropertyDescriptor(instance, 'config');

      if (configPropertyDescriptor === undefined || !configPropertyDescriptor.set) {
        const instancePrototype = Object.getPrototypeOf(instance);

        throw new Error(`The setter for the config property on type '${instancePrototype.constructor.name}' is missing.`);
      }

      instance.config = config;
    }


    _cacheInstance(key: any, instance: any, injectionArgs: Array<any>, config: any) {

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


    _getConfig(key: any) {

      const config = this.registrations[key].settings.config;

      const resolvedConfig = this._resolveConfig(key, config);

      if (!resolvedConfig) {
        return undefined;
      }

      return resolvedConfig;
    }


    _resolveConfig(key: any, config: any) {

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


    validateDependencies(optionalKey: any) {

      let registrationKeys;

      if (Array.isArray(optionalKey)) {

        registrationKeys = optionalKey;

      } else if (typeof optionalKey !== 'undefined') {

        registrationKeys = [optionalKey];

      } else {

        registrationKeys = Object.keys(this.registrations);
      }

      const errors = this._validateDependencies(registrationKeys);

      if (errors.length > 0) {
        throw new Error(`Errors during validation of dependencies:
          ${errors.toString()}`);
      }
    }


    _validateDependencies(registrationKeys: Array<any>, parentRegistrationHistory: TypeRegistration[]) {
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

    _historyHasCircularBreak(parentRegistrationHistory: TypeRegistration[], dependencyRegistration: TypeRegistration) {

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

    _validateOverwrittenKeys(registration: TypeRegistration) {

      const overwrittenKeys = Object.keys(registration.settings.overwrittenKeys);

      const errors = [];

      overwrittenKeys.forEach((overwrittenKey) => {

        this._validateOverwrittenKey(registration, overwrittenKey, errors);
      });

      return errors;
    }

    _validateOverwrittenKey(registration: TypeRegistration, overwrittenKey: any, errors: string[]) {

      if (registration.settings.dependencies.indexOf(overwrittenKey) < 0) {

        errors.push(`No dependency for overwritten key '${overwrittenKey}' has been declared on registration for key '${registration.settings.key}'.`);
      }

      const overwrittenKeyValue = registration.settings.overwrittenKeys[overwrittenKey];
      const overwrittenKeyRegistration = this._getRegistration(overwrittenKeyValue);

      if (!overwrittenKeyRegistration) {

        errors.push(`Registration for overwritten key '${overwrittenKey}' declared on registration for key '${registration.settings.key}' is missing.`);
      }
    }

    _squashArgumentsToArray(args: Array<any>) {

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


    getKeysByTags() {

      const args = Array.prototype.slice.call(arguments);
      const allTags = this._squashArgumentsToArray(args);

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


    getKeysByAttributes(attributes: Array<any>) {

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

    isRegistered(key: any) {

      const registrationKeys = Object.keys(this.registrations);

      const found = registrationKeys.some((registrationKey) => {

        if (registrationKey == key) {

          return true;
        }
      });

      return found;
    }
}
