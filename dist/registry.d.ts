import { RegistrationKey, IRegistration, ITypeRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator } from './interfaces';
export interface IRegistrationsCache {
    [key: string]: ITypeRegistration<any>;
}
export declare class Registry implements IRegistry {
    registrations: IRegistrationsCache;
    settings: IRegistrationSettings;
    constructor(settings: IRegistrationSettings);
    clear(): void;
    importRegistrations(registrationSettings: Array<IRegistrationSettings>): void;
    exportRegistrations(keysToExport?: Array<RegistrationKey>): Array<IRegistrationSettings>;
    autoRegisterModules(): void;
    registerModule(moduleName: string): IRegistrator;
    register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T>;
    registerObject(key: RegistrationKey, object: any): IRegistration;
    unregister<T>(key: RegistrationKey): IRegistration;
    protected createRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T>;
    protected getRegistration<T>(key: RegistrationKey): ITypeRegistration<T>;
    protected getRegistrationKeys(): Array<string>;
    protected cacheRegistration<T>(key: RegistrationKey, registration: ITypeRegistration<T>): void;
    protected deleteRegistration(key: RegistrationKey): void;
}
