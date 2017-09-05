import { IFactoryRegistration, IObjectRegistration, IRegistration, IRegistrationSettings, IRegistrator, IRegistry, ITypeRegistration, RegistrationKey, Type } from './interfaces';

export class RegistrationContext implements IRegistrator {

  constructor(protected registry: IRegistrator, protected registrationSettings?: IRegistrationSettings) {}

  public createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator {
    return new RegistrationContext(this, registrationSettings);
  }

  public register<TType>(key: RegistrationKey, type: Type<TType>): ITypeRegistration<TType> {
    const registration: ITypeRegistration<TType> = this.registry.register<TType>(key, type);
    this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
    return registration;
  }

  public registerObject<TType>(key: RegistrationKey, object: any): IObjectRegistration<TType> {
    const registration: IObjectRegistration<TType> = this.registry.registerObject<TType>(key, object);
    this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
    return registration;
  }

  public registerFactory<TType>(key: RegistrationKey, factory: any): IFactoryRegistration<TType> {
    const registration: IFactoryRegistration<TType> = this.registry.registerFactory<TType>(key, factory);
    this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
    return registration;
  }

  public unregister<TType>(key: string): IRegistration | ITypeRegistration<TType> {
    return this.registry.unregister(key);
  }

  protected applyRegistrationTemplate(registrationSettings: IRegistrationSettings, template: IRegistrationSettings): IRegistrationSettings {
    return Object.assign(this.registrationSettings, registrationSettings);
  }
}
