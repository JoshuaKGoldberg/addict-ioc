export declare class DependencyInjectionContainer {
    private _config;
    private _registrations;
    private _instances;
    private _externalConfigProvider;
    constructor(config: IDependencyInjectionContainerConfig);
    clear(): void;
    readonly config: IDependencyInjectionContainerConfig;
    readonly registrations: IRegistrations;
    readonly instances: IInstances;
    readonly externalConfigProvider: IProvideConfig;
    setConfigProvider(configProvider: IProvideConfig): void;
    setDefaults(registrationDefaults: ITypeRegistrationSettings): void;
    private _setDefault(settingKey, value);
    private _isValidBoolean(settingValue);
    register(key: string, type: any): TypeRegistration;
    unregister(key: string): void;
    private _registerTypeByKey(key, type);
    registerFactory(key: string, factoryMethod: any): TypeRegistration;
    registerObject(key: string, object: any): any;
    private _initializeBaseRegistrations();
    private _initializeRegistrationDeclarations();
    private _ensureRegistrationStarted(declaration);
    private _getRegistration(key);
    resolve(key: string, injectionArgs: Array<any>, config: any): any;
    private _resolve(key, injectionArgs, config, resolvedKeyHistory?, isLazy?);
    private _resolveInstance(registration, injectionArgs, config, resolvedKeyHistory?, isLazy?);
    private _mergeArguments(baseArgs, additionalArgs);
    private _mergeConfig(baseConfig, additionalConfig);
    private _getInstance(registration, injectionArgs, config);
    private _getKeysForInstanceConfigurationsByKey(key);
    private _getKeysForInstanceInjectionArgumentsByKeyAndConfig(key, config);
    private _getAllInstances(key, config?, injectionArgs?);
    private _getNewInstance(registration, injectionArgs?, config?, resolvedKeyHistory?);
    private _bindFunctionsToInstance(registration, instance);
    resolveDependencies(key: string): any[];
    private _resolveDependencies(registration, resolvedKeyHistory?);
    private _isDependencyLazy(registration, dependency);
    private _getDependencyKeyOverwritten(registration, dependency);
    private _createInstance(registration, dependencies, injectionArgs);
    private _createInstanceByFactory(type);
    private _createInstanceByFactoryWithInjection(type, argumentsToBeInjected);
    private _createInstanceByConstructor(type);
    private _createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
    private _injectDependenciesIntoInstance(registration, instance, argumentsToBeInjected);
    private _getPropertyDescriptor(type, key);
    private _injectDependenciesIntoFunction(instance, targetFunction, argumentsToBeInjected);
    private _injectDependenciesIntoProperty(instance, property, argumentsToBeInjected);
    private _getSubscriberRegistrations(key, subscriptionKey);
    private _getSubscriptionFromRegistrationByKey(registration, subscriptionKey, key);
    private _callSubscribers(registration, subscriptionKey, params);
    private _createMissingSubscriber(subscriberRegistration);
    private _callSubscriber(subscribedRegistration, subscriptionKey, subscriberRegistration, subscribedInstance, params);
    private _configureInstance(instance, config);
    private _cacheInstance(key, instance, injectionArgs, config);
    private _getConfig(key);
    private _resolveConfig(key, config);
    validateDependencies(key?: any): void;
    private _validateDependencies(registrationKeys, parentRegistrationHistory?);
    private _historyHasCircularBreak(parentRegistrationHistory, dependencyRegistration);
    private _validateOverwrittenKeys(registration);
    private _validateOverwrittenKey(registration, overwrittenKey, errors);
    private _squashArgumentsToArray(args);
    getKeysByTags(...args: any[]): any[];
    getKeysByAttributes(attributes: Array<any>): any[];
    isRegistered(key: string): boolean;
}
export interface IProvideConfig {
    get: (config: string) => any;
}
export interface ITypeRegistrationSettings {
    defaults: ITypeRegistrationSettings;
    key: string;
    type: any;
    isFactory: boolean;
    isObject: boolean;
    dependencies: string | Array<string>;
    tags: any;
    config: any;
    isSingleton: boolean;
    wantsInjection: boolean;
    injectInto: string;
    isLazy: boolean;
    bindFunctions: boolean;
    functionsToBind: string | Array<string>;
    lazyKeys: string | Array<string>;
    overwrittenKeys: string | Array<string>;
    autoCreateMissingSubscribers: boolean;
    subscriptions: IHookSubscriptions;
}
export interface IHookSubscriptions {
    [hook: string]: Array<IHookSubscription>;
}
export interface IHookSubscription {
    key: string;
    method: string;
}
export interface IDependencyInjectionContainerConfig {
    registrationDefaults: ITypeRegistrationSettings;
    injectContainerKey: string;
    circularDependencyCanIncludeSingleton: boolean;
    circularDependencyCanIncludeLazy: boolean;
}
export interface IRegistrations {
    [key: string]: TypeRegistration;
}
export interface IInstances {
    [key: string]: any;
}
export declare class TypeRegistration {
    private _settings;
    constructor(defaults: ITypeRegistrationSettings, key: string, type: any, isFactory?: boolean);
    settings: ITypeRegistrationSettings;
    dependencies(...args: any[]): this;
    configure(config: any): this;
    singleton(isSingleton: boolean): this;
    noInjection(injectionDisabled: boolean): this;
    injectInto(targetFunction: string): this;
    injectLazy(): this;
    onNewInstance(key: string, targetFunction: string): this;
    bindFunctions(): this;
    tags(tagOrTags: string | string[]): this;
    setAttribute(tag: string, value: any): this;
    hasTags(tags: string | Array<string>): boolean;
    hasAttributes(attributes: any): boolean;
    overwrite(originalKey: string, overwrittenKey: string): this;
}
export declare class TypeRegistrationSettings implements ITypeRegistrationSettings {
    private _defaults;
    private _key;
    private _type;
    private _dependencies;
    private _config;
    private _tags;
    private _injectInto;
    private _functionsToBind;
    private _lazyKeys;
    private _overwrittenKeys;
    private _isSingleton;
    private _wantsInjection;
    private _isLazy;
    private _bindFunctions;
    private _subscriptions;
    private _isFactory;
    private _isObject;
    private _autoCreateMissingSubscribers;
    constructor(defaults: ITypeRegistrationSettings, key: string, type: any, isFactory?: boolean, isObject?: boolean);
    readonly defaults: ITypeRegistrationSettings;
    readonly key: any;
    readonly type: any;
    dependencies: string | Array<string>;
    config: any;
    tags: any;
    injectInto: string;
    functionsToBind: string | Array<string>;
    lazyKeys: string | Array<string>;
    overwrittenKeys: string | Array<string>;
    readonly isFactory: boolean;
    readonly subscriptions: IHookSubscriptions;
    isSingleton: boolean;
    wantsInjection: boolean;
    isLazy: boolean;
    bindFunctions: boolean;
    autoCreateMissingSubscribers: boolean;
    isObject: boolean;
    private getSettingOrDefault(key);
}
