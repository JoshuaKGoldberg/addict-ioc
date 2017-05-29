import { ITags, RegistrationKey, IObjectRegistration, ITypeRegistration, IFactoryRegistration, IRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator } from './interfaces';
export interface IRegistrationsCache {
    [key: string]: IRegistration;
}
export declare class Registry implements IRegistry {
    registrations: IRegistrationsCache;
    settings: IRegistrationSettings;
    protected parentRegistry: IRegistry;
    constructor(settings: IRegistrationSettings, parentRegistry?: IRegistry);
    initialize(): void;
    clear(): void;
    protected _mergeSettings(existingSettings: IRegistrationSettings, newSettings: IRegistrationSettings): IRegistrationSettings;
    importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
    exportRegistrations(keysToExport?: Array<RegistrationKey>): Array<IRegistrationSettings>;
    isRegistered(key: RegistrationKey): boolean;
    createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
    register<T>(key: RegistrationKey, type: Type<T>, settings?: IRegistrationSettings): ITypeRegistration<T>;
    registerObject<T>(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IObjectRegistration<T>;
    registerFactory<T>(key: RegistrationKey, factoryMethod: any, settings?: IRegistrationSettings): IFactoryRegistration<T>;
    unregister<T>(key: RegistrationKey): IRegistration;
    protected createRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T>;
    protected createObjectRegistration<T>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): IObjectRegistration<T>;
    protected createFactoryRegistration<T>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): IFactoryRegistration<T>;
    getRegistration<T>(key: RegistrationKey): IRegistration;
    protected getRegistrationKeys(): Array<string>;
    protected cacheRegistration<T>(key: RegistrationKey, registration: IRegistration): void;
    protected deleteRegistration(key: RegistrationKey): void;
    getKeysByTags(...tags: Array<string>): Array<RegistrationKey>;
    getKeysByAttributes(attributes: ITags): Array<RegistrationKey>;
    private _hasRegistrationAttributes(registration, attributes);
    private _hasRegistrationTags(registration, tags);
}
