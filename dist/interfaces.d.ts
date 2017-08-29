export interface IContainer<T extends IInstanceWrapper<any> = IInstanceWrapper<any>> extends IRegistry {
    instances: IInstanceCache<any, T>;
    parentContainer: IContainer<any>;
    settings: IContainerSettings;
    clear(): void;
    initialize(): void;
    resolve<V = T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): V;
    resolveLazy<V = T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactory<V>;
    resolveAsync<V = T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<V>;
    resolveLazyAsync<V = T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactoryAsync<V>;
    validateDependencies(...keys: Array<RegistrationKey>): Array<string>;
}
export interface IInstanceCache<T, U extends IInstanceWrapper<T>> {
    [key: string]: {
        [configHash: string]: {
            [injectionArgsHash: string]: Array<T>;
        };
    };
}
export interface IInstanceLookup<T extends IInstanceWrapper<any>> {
    [instanceId: string]: T;
}
export interface IValidationError {
    errorMessage: string;
    registrationStack: Array<IRegistration>;
    currentRegistration: IRegistration;
}
export interface IValidationResults {
    order: Array<RegistrationKey>;
    missing: Array<RegistrationKey>;
    recursive: Array<Array<RegistrationKey>>;
}
export interface IRegistrator {
    createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
    register<T, U extends IRegistrationSettings = ITypeRegistrationSettings<T>>(key: RegistrationKey, type: Type<T>, settings?: U): ITypeRegistration<T>;
    registerObject<T, U extends IRegistrationSettings = IObjectRegistrationSettings<T>>(key: RegistrationKey, object: T, settings?: U): IObjectRegistration<T>;
    registerFactory<T, U extends IRegistrationSettings = IFactoryRegistrationSettings<T>>(key: RegistrationKey, factory: T, settings?: U): IFactoryRegistration<T>;
    unregister<T>(key: RegistrationKey): IRegistration | ITypeRegistration<T>;
}
export interface IRegistry extends IRegistrator {
    importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
    exportRegistrations(keysToExport: Array<RegistrationKey>): Array<IRegistrationSettings>;
    isRegistered(key: RegistrationKey): boolean;
    getRegistration(key: RegistrationKey): IRegistration;
    getKeysByTags(...tags: Array<ITags | string>): Array<RegistrationKey>;
}
export interface ISpecializedRegistration<T extends IRegistration, U extends IRegistrationSettings> extends IRegistration {
    settings: U;
    configure(config: any): ISpecializedRegistration<T, U>;
    dependencies(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U>;
    singleton(isSingleton: boolean): ISpecializedRegistration<T, U>;
    transient(isTransient: boolean): ISpecializedRegistration<T, U>;
    injectLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U>;
    injectPromiseLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U>;
    injectInto(targetFunction: string): ISpecializedRegistration<T, U>;
    bindFunctions(...functionsToBind: Array<string>): ISpecializedRegistration<T, U>;
    owns(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U>;
    overwrite(originalKey: string, overwrittenKey: string): ISpecializedRegistration<T, U>;
    tags(...tags: Array<string>): ISpecializedRegistration<T, U>;
    setTag(tag: string, value: any): ISpecializedRegistration<T, U>;
}
export interface ITypeRegistration<T> extends ISpecializedRegistration<ITypeRegistration<T>, ITypeRegistrationSettings<T>> {
}
export interface IObjectRegistration<T> extends ISpecializedRegistration<IObjectRegistration<T>, IObjectRegistrationSettings<T>> {
}
export interface IFactoryRegistration<T> extends ISpecializedRegistration<IFactoryRegistration<T>, IFactoryRegistrationSettings<T>> {
}
export interface IRegistration {
    settings: IRegistrationSettings;
}
export interface ITypeRegistrationSettings<T> extends IRegistrationSettings {
    type?: Type<T>;
}
export interface IObjectRegistrationSettings<T> extends IRegistrationSettings {
    object?: T;
}
export interface IFactoryRegistrationSettings<T> extends IRegistrationSettings {
    factory?: T;
}
export interface IConfigResolver {
    (config: string | any): any;
}
export declare type TypeConfig = string | any | IConfigResolver;
export interface IContainerSettings extends IRegistrationSettings {
    containerRegistrationKey?: RegistrationKey;
    circularDependencyCanIncludeSingleton?: boolean;
    circularDependencyCanIncludeLazy?: boolean;
    conventionCallTypes?: Array<ConventionCallType>;
}
export declare enum ConventionCallType {
    Class = 0,
    Object = 1,
    Factory = 2,
}
export interface IRegistrationSettings {
    defaults?: IRegistrationSettings;
    resolver?: IResolver<any, IInstanceWrapper<any>>;
    key?: RegistrationKey;
    object?: any;
    factory?: any;
    isFactory?: boolean;
    module?: string;
    isObject?: boolean;
    dependencies?: Array<RegistrationKey>;
    ownedDependencies?: Array<RegistrationKey>;
    tags?: ITags;
    config?: TypeConfig;
    isSingleton?: boolean;
    wantsInjection?: boolean;
    injectInto?: string;
    bindFunctions?: boolean;
    functionsToBind?: Array<string>;
    wantsLazyInjection?: boolean;
    lazyDependencies?: Array<string>;
    wantsLazyInjectionAsync?: boolean;
    lazyDependenciesAsync?: Array<string>;
    overwrittenKeys?: IOverwrittenKeys;
    conventionCalls?: Array<string>;
    overwrittenConventionCalls?: IOverwrittenConventionCalls;
    injectConventionCalled?: IInjectConventionCalled;
}
export interface IInjectConventionCalled {
    [registrationKey: string]: string;
}
export interface IOverwrittenConventionCalls {
    [overwrittenConventionCall: string]: string;
}
export interface IConventionCalls {
    [dependencyKey: string]: IConventionCall;
}
export interface IConventionCall {
    [call: string]: string;
}
export interface IOverwrittenKeys {
    [originalKey: string]: string;
}
export interface IResolver<T, U extends IInstanceWrapper<any>> {
    resolveType<V extends T = T>(container: IContainer<U>, registration: ITypeRegistration<V>): Type<V>;
    resolveTypeAsync<V extends T = T>(container: IContainer<U>, registration: ITypeRegistration<V>): Promise<Type<V>>;
    resolveObject<V extends T = T>(container: IContainer<U>, registration: IRegistration): V;
    resolveObjectAsync<V extends T = T>(container: IContainer<U>, registration: IRegistration): Promise<V>;
    resolveFactory<V extends T = T>(container: IContainer<U>, registration: IRegistration): V;
    resolveFactoryAsync<V extends T = T>(container: IContainer<U>, registration: IRegistration): Promise<V>;
    createInstance<V extends T = T>(container: IContainer<U>, type: any, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    createObject<V extends T = T>(container: IContainer<U>, object: any, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    createFactory<V extends T = T>(container: IContainer<U>, type: any, registration: ITypeRegistration<V>, dependencies: Array<any>, injectionArgs?: Array<any>): V;
    resolveConfig(config: TypeConfig): any;
    hash(anything: any): string;
    hashType<V extends T = T>(type: Type<V>): string;
    hashObject<V extends T = T>(object: V): string;
    hashFactory<V extends T = T>(factory: V): string;
    hashConfig(config: any): string;
}
export interface IDependencyOwners {
    [ownedDependencyKey: string]: ITypeRegistration<any>;
}
export interface IFactory<T> {
    (injectionArgs?: Array<any>, runtimeConfig?: any): T;
}
export interface IFactoryAsync<T> {
    (injectionArgs?: Array<any>, runtimeConfig?: any): Promise<T>;
}
export declare type RegistrationKey = string;
export interface ITags {
    [tag: string]: any;
}
export interface Type<T> {
    new (...args: Array<any>): T;
}
export interface IInvocationContext {
    [conventionCall: string]: string;
}
export interface IInstanceWrapper<T> {
    id?: InstanceId;
    ownedBy?: InstanceId;
    instance?: T;
    ownedInstances: Array<InstanceId>;
    registration: IRegistration;
    invoked: Array<string>;
}
export interface IInvocationWrapper<T> extends IInstanceWrapper<T> {
    invocations: IInvocationContext;
}
export declare type InstanceId = string;
export interface IResolutionContext<T, U extends IInstanceWrapper<T>> {
    currentResolution: U;
    instanceLookup: IInstanceLookup<U>;
    instanceResolutionOrder: Array<InstanceId>;
}
export interface IInvocationResolutionContext<T> extends IResolutionContext<T, IInvocationWrapper<T>> {
    invocations: Array<T>;
}
