import { IFactoryRegistration, IObjectRegistration, IRegistration, IRegistrationSettings, IRegistrator, IRegistry, ITypeRegistration, RegistrationKey, Type } from './interfaces';

export class RegistrationContext implements IRegistrator {

  constructor(protected registry: IRegistrator, protected registrationSettings?: IRegistrationSettings) {}

  public createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator {
    return new RegistrationContext(this, registrationSettings);
  }

  public register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T> {
    const registration: ITypeRegistration<T> = this.registry.register<T>(key, type);
    this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
    return registration;
  }

  public registerObject<T>(key: RegistrationKey, object: any): IObjectRegistration<T> {
    const registration: IObjectRegistration<T> = this.registry.registerObject<T>(key, object);
    this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
    return registration;
  }

  public registerFactory<T>(key: RegistrationKey, factory: any): IFactoryRegistration<T> {
    const registration: IFactoryRegistration<T> = this.registry.registerFactory<T>(key, factory);
    this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
    return registration;
  }

  public unregister<T>(key: string): IRegistration | ITypeRegistration<T> {
    return this.registry.unregister(key);
  }

  protected applyRegistrationTemplate(registrationSettings: IRegistrationSettings, template: IRegistrationSettings): IRegistrationSettings {
    return Object.assign(this.registrationSettings, registrationSettings);
  }
}
