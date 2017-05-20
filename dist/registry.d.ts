import { ITags, RegistrationKey, IObjectRegistration, ITypeRegistration, IFactoryRegistration, IRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator } from './interfaces';
export interface IRegistrationsCache {
    [key: string]: IRegistration;
}
export declare class Registry implements IRegistry {
    registrations: IRegistrationsCache;
    settings: IRegistrationSettings;
    protected parentRegistry: IRegistry;
    constructor(settings: IRegistrationSettings, parentRegistry?: IRegistry);
    clear(): void;
    importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
    exportRegistrations(keysToExport?: Array<RegistrationKey>): Array<IRegistrationSettings>;
    isRegistered(key: RegistrationKey): boolean;
    createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
    register<T>(key: RegistrationKey, type: Type<T>, settings?: IRegistrationSettings): ITypeRegistration<T>;
    registerObject(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IObjectRegistration;
    registerFactory(key: RegistrationKey, factoryMethod: any, settings?: IRegistrationSettings): IFactoryRegistration;
    unregister<T>(key: RegistrationKey): IRegistration;
    protected createRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T>;
    protected createObjectRegistration<T>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): IObjectRegistration;
    protected createFactoryRegistration<T>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): IFactoryRegistration;
    getRegistration<T>(key: RegistrationKey): IRegistration<T>;
    protected getRegistrationKeys(): Array<string>;
    protected cacheRegistration<T>(key: RegistrationKey, registration: IRegistration<T>): void;
    protected deleteRegistration(key: RegistrationKey): void;
    getKeysByTags(...tags: Array<string>): Array<RegistrationKey>;
    getKeysByAttributes(attributes: ITags): Array<RegistrationKey>;
    private _hasRegistrationAttributes(registration, attributes);
    private _hasRegistrationTags(registration, tags);
}
