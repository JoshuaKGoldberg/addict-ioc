import {IRegistration, ITypeRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator, RegistrationKey} from './interfaces';

export class RegistrationContext implements IRegistrator {
  
  constructor(protected registry: IRegistrator, protected registrationSettings?: IRegistrationSettings) {}

  public createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator {
    return new RegistrationContext(this, registrationSettings);
  }
  
  public register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T> {
    const registration = this.registry.register(key, type);
    this.applyRegistrationTemplate(registration.settings, this.registrationSettings);
    return registration;
  }

  public registerObject(key: RegistrationKey, object: any): IRegistration {
    const registration = this.registry.registerObject(key, object);
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