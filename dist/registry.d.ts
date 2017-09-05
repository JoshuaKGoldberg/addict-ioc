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
    register<TType>(key: RegistrationKey, type: Type<TType>, settings?: IRegistrationSettings): ITypeRegistration<TType>;
    registerObject<TType>(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IObjectRegistration<TType>;
    registerFactory<TType>(key: RegistrationKey, factoryMethod: any, settings?: IRegistrationSettings): IFactoryRegistration<TType>;
    unregister(key: RegistrationKey): IRegistration;
    protected createRegistration<TType>(key: RegistrationKey, type: Type<TType>, registrationSettings?: IRegistrationSettings): ITypeRegistration<TType>;
    protected createObjectRegistration<TType>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): IObjectRegistration<TType>;
    protected createFactoryRegistration<TType>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): IFactoryRegistration<TType>;
    getRegistration(key: RegistrationKey): IRegistration;
    protected getRegistrationKeys(): Array<string>;
    private sortKeys(keys);
    protected cacheRegistration(key: RegistrationKey, registration: IRegistration): void;
    protected deleteRegistration(key: RegistrationKey): void;
    getKeysByTags(...tags: Array<ITags | string>): Array<RegistrationKey>;
    protected _buildTagQuery(...tags: Array<ITags | string>): ITags;
}
