import { RegistrationKey, IRegistration, ITypeRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator } from './interfaces';
export interface IRegistrationsCache {
    [key: string]: ITypeRegistration<any>;
}
export declare class Registry implements IRegistry {
    registrations: IRegistrationsCache;
    settings: IRegistrationSettings;
    protected parentRegistry: IRegistry;
    constructor(settings: IRegistrationSettings, parentRegistry?: IRegistry);
    clear(): void;
    importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
    exportRegistrations(keysToExport?: Array<RegistrationKey>): Array<IRegistrationSettings>;
    autoRegisterModules(): void;
    isRegistered(key: RegistrationKey): boolean;
    createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
    register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T>;
    registerObject(key: RegistrationKey, object: any): IRegistration;
    registerFactory(key: RegistrationKey, factoryMethod: any): IRegistration;
    unregister<T>(key: RegistrationKey): IRegistration;
    protected createTypeRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T>;
    protected createObjectRegistration<T>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): ITypeRegistration<T>;
    protected createFactoryRegistration<T>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): ITypeRegistration<T>;
    getRegistration<T>(key: RegistrationKey): ITypeRegistration<T>;
    protected getRegistrationKeys(): Array<string>;
    protected cacheRegistration<T>(key: RegistrationKey, registration: ITypeRegistration<T>): void;
    protected deleteRegistration(key: RegistrationKey): void;
    getKeysByTags(...tags: Array<string>): Array<RegistrationKey>;
    private _hasRegistrationTags(registration, tags);
}
