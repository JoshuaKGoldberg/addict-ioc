import { IRegistration, ITypeRegistration, IRegistrationSettings, Type, IRegistrator, RegistrationKey } from './interfaces';
export declare class RegistrationContext implements IRegistrator {
    protected registry: IRegistrator;
    protected registrationSettings: IRegistrationSettings;
    constructor(registry: IRegistrator, registrationSettings?: IRegistrationSettings);
    register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T>;
    registerObject(key: RegistrationKey, object: any): IRegistration;
    unregister<T>(key: string): IRegistration | ITypeRegistration<T>;
    protected applyRegistrationTemplate(registrationSettings: IRegistrationSettings, template: IRegistrationSettings): IRegistrationSettings;
}
