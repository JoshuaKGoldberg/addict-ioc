export interface IContainer extends IRegistry {
    instances: IInstanceCache<any>;
    parentContainer: IContainer;
    settings: IContainerSettings;
    clear(): void;
    initialize(): void;
    resolve<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): T;
    resolveLazy<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactory<T>;
    resolveAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): Promise<T>;
    resolveLazyAsync<T>(key: RegistrationKey, injectionArgs?: Array<any>, config?: any): IFactoryAsync<T>;
    validateDependencies(...keys: Array<RegistrationKey>): Array<IValidationError>;
}
export interface IInstanceCache<T> extends Map<RegistrationKey, IInstanceWithConfigCache<T>> {
}
export interface IInstanceWithConfigCache<T> extends Map<string, IInstanceWithInjectionArgsCache<T>> {
}
export interface IInstanceWithInjectionArgsCache<T> extends Map<string, Array<T>> {
}
export interface IValidationError {
    errorMessage: string;
    registrationStack: Array<IRegistration>;
    currentRegistration: IRegistration;
}
export interface IRegistrator {
    register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T>;
    registerObject(key: RegistrationKey, object: any): IRegistration;
    unregister<T>(key: RegistrationKey): IRegistration | ITypeRegistration<T>;
}
export interface IRegistry extends IRegistrator {
    importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
    exportRegistrations(keysToExport: Array<RegistrationKey>): Array<IRegistrationSettings>;
    registerModule(moduleName: string): IRegistrator;
    createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
    getRegistration<T>(key: RegistrationKey): ITypeRegistration<T>;
}
export interface ITypeRegistration<T> extends IRegistration {
    settings: ITypeRegistrationSettings<T>;
    configure(config: any): ITypeRegistration<T>;
    dependencies(...dependencies: Array<RegistrationKey>): ITypeRegistration<T>;
    singleton(isSingleton: boolean): ITypeRegistration<T>;
    injectLazy(...lazyDependencies: Array<RegistrationKey>): ITypeRegistration<T>;
    injectPromiseLazy(...lazyDependencies: Array<RegistrationKey>): ITypeRegistration<T>;
    injectInto(targetFunction: string): ITypeRegistration<T>;
    bindFunctions(...functionsToBind: Array<string>): ITypeRegistration<T>;
    owns(...dependencies: Array<RegistrationKey>): IRegistration;
    overwrite(originalKey: string, overwrittenKey: string): ITypeRegistration<T>;
    tags(...tags: Array<string>): IRegistration;
    setTag(tag: string, value: any): ITypeRegistration<T>;
}
export interface IRegistration {
    settings: IRegistrationSettings;
}
export interface ITypeRegistrationSettings<T> extends IRegistrationSettings {
    type?: Type<T>;
}
export interface IConfigResolver {
    (config: string | any): any;
}
export declare type TypeConfig = string | any | IConfigResolver;
export interface IContainerSettings extends IRegistrationSettings {
    containerRegistrationKey: RegistrationKey;
    circularDependencyCanIncludeSingleton: boolean;
    circularDependencyCanIncludeLazy: boolean;
}
export interface IRegistrationSettings {
    defaults?: IRegistrationSettings;
    resolver?: ITypeResolver;
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
    lazyDependencies?: Array<string>;
    lazyPromiseDependencies?: Array<string>;
    overwrittenKeys?: IOverwrittenKeys;
}
export interface IOverwrittenKeys {
    [originalKey: string]: string;
}
export interface ITypeResolver {
    resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T>;
    resolveTypeAsync<T>(container: IContainer, registration: ITypeRegistration<T>): Promise<Type<T>>;
    createInstance<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    createObject<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    createFactory<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    resolveConfig(config: TypeConfig): any;
}
export interface IResolutionContext<T> {
    registration: IRegistration;
    history: Array<ITypeRegistration<any>>;
    owners: IDependencyOwners;
    isDependencyOwned: boolean;
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
    new (...args: any[]): T;
}
