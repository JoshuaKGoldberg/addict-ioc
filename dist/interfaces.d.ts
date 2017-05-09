export interface IContainer extends IRegistry {
    settings: IContainerSettings;
}
export interface IRegistrator {
    register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T>;
    unregister<T>(key: RegistrationKey): IRegistration | ITypeRegistration<T>;
}
export interface IRegistry extends IRegistrator {
    exportRegistrations(keysToExport: Array<RegistrationKey>): Array<IRegistrationSettings>;
    importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
}
export interface ITypeRegistration<T> extends IRegistration {
    settings: ITypeRegistrationSettings<T>;
    configure(config: any): ITypeRegistration<T>;
    dependencies(...dependencies: Array<RegistrationKey>): ITypeRegistration<T>;
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
}
export interface IRegistrationSettings {
    defaults?: IRegistrationSettings;
    resolver?: ITypeResolver;
    key?: RegistrationKey;
    isFactory?: boolean;
    module?: string;
    dependencies?: Array<RegistrationKey>;
    ownedDependencies?: Array<RegistrationKey>;
    config?: TypeConfig;
    isSingleton?: boolean;
    wantsInjection?: boolean;
    injectInto?: string;
    lazyDependencies?: Array<string>;
}
export interface ITypeResolver {
    resolveType<T>(container: IContainer, registration: ITypeRegistration<T>): Type<T>;
    createInstance<T>(container: IContainer, registration: ITypeRegistration<T>, dependencies: Array<any>, injectionArgs?: Array<any>): T;
    resolveConfig(config: TypeConfig): any;
}
export interface IResolutionContext<T> {
    registration: IRegistration;
    history: Array<ITypeRegistration<any>>;
    owners: IDependencyOwners;
}
export interface IDependencyOwners {
    [ownedDependencyKey: string]: ITypeRegistration<any>;
}
export interface IFactory<T> {
    (injectionArgs?: Array<any>, runtimeConfig?: any): T;
}
export declare type RegistrationKey = string;
export declare type Tag = string | symbol;
export interface Type<T> {
    new (...args: any[]): T;
}
