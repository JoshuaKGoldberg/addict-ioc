import {IRegistration, ITypeRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator} from './interfaces';

export class RegistrationContext implements IRegistrator {
  
  constructor(private registry: IRegistry, private registrationSettings?: IRegistrationSettings) {}

  register<T>(key: string, type: Type<T>): ITypeRegistration<T> {
    const registration = this.registry.register(key, type);
    Object.assign(registration.settings, this.registrationSettings);
    return registration;
  }

  unregister<T>(key: string): IRegistration | ITypeRegistration<T> {
    return this.registry.unregister(key);
  }
}