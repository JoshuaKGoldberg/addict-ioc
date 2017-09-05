import { IFactoryRegistration, IObjectRegistration, IRegistration, IRegistrationSettings, IRegistrator, ITypeRegistration, RegistrationKey, Type } from './interfaces';
export declare class RegistrationContext implements IRegistrator {
    protected registry: IRegistrator;
    protected registrationSettings: IRegistrationSettings;
    constructor(registry: IRegistrator, registrationSettings?: IRegistrationSettings);
    createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator;
    register<TType>(key: RegistrationKey, type: Type<TType>): ITypeRegistration<TType>;
    registerObject<TType>(key: RegistrationKey, object: any): IObjectRegistration<TType>;
    registerFactory<TType>(key: RegistrationKey, factory: any): IFactoryRegistration<TType>;
    unregister<TType>(key: string): IRegistration | ITypeRegistration<TType>;
    protected applyRegistrationTemplate(registrationSettings: IRegistrationSettings, template: IRegistrationSettings): IRegistrationSettings;
}
