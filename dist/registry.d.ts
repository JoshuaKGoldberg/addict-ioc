import { IFactoryRegistration, IObjectRegistration, IRegistration, IRegistrationSettings, IRegistrator, IRegistry, ITags, ITypeRegistration, RegistrationKey, Type } from './interfaces';
export interface IRegistrationsCache {
    [key: string]: IRegistration;
}
export declare class Registry implements IRegistry {
    parentRegistry: IRegistry;
    registrations: IRegistrationsCache;
    settings: IRegistrationSettings;
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
    unregister(key: RegistrationKey): IRegistration;
    protected createRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T>;
    protected createObjectRegistration<T>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): IObjectRegistration<T>;
    protected createFactoryRegistration<T>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): IFactoryRegistration<T>;
    getRegistration(key: RegistrationKey): IRegistration;
    protected getRegistrationKeys(): Array<string>;
    protected cacheRegistration<T>(key: RegistrationKey, registration: IRegistration): void;
    protected deleteRegistration(key: RegistrationKey): void;
    getKeysByTags(...tags: Array<ITags | string>): Array<RegistrationKey>;
    protected _buildTagQuery(...tags: Array<ITags | string>): ITags;
}
