import { IRegistration, ITypeRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator } from './interfaces';
export declare class RegistrationContext implements IRegistrator {
    private registry;
    private registrationSettings;
    constructor(registry: IRegistry, registrationSettings?: IRegistrationSettings);
    register<T>(key: string, type: Type<T>): ITypeRegistration<T>;
    unregister<T>(key: string): IRegistration | ITypeRegistration<T>;
}
