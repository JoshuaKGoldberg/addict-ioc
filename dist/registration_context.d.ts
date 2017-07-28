import { IFactoryRegistration, IObjectRegistration, IRegistration, IRegistrationSettings, IRegistrator, ITypeRegistration, RegistrationKey, Type } from './interfaces';
export declare class RegistrationContext implements IRegistrator {
    protected registry: IRegistrator;
    protected registrationSettings: IRegistrationSettings;
    constructor(registry: IRegistrator, registrationSettings?: IRegistrationSettings);
    createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
    register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T>;
    registerObject<T>(key: RegistrationKey, object: any): IObjectRegistration<T>;
    registerFactory<T>(key: RegistrationKey, factory: any): IFactoryRegistration<T>;
    unregister<T>(key: string): IRegistration | ITypeRegistration<T>;
    protected applyRegistrationTemplate(registrationSettings: IRegistrationSettings, template: IRegistrationSettings): IRegistrationSettings;
}
