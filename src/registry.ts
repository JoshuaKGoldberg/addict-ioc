import {IContainer, RegistrationKey, IRegistration, ITypeRegistration, IRegistrationSettings, ITypeRegistrationSettings, ITypeResolver, Type, IRegistry, IRegistrator} from './interfaces';
import {TypeRegistration} from './type_registration';
import {RegistrationContext} from './registration_context';

export interface IRegistrationsCache {
  [key: string]: ITypeRegistration<any>;
}

export class Registry implements IRegistry {

  public registrations: IRegistrationsCache = {};
  public settings: IRegistrationSettings;

  constructor(settings: IRegistrationSettings) {
    this.settings = settings;
  }

  public clear(): void {
    this.registrations = {};
  }

  public importRegistrations(registrationSettings: Array<IRegistrationSettings>): void {
    
    registrationSettings.forEach((registrationSetting) =>  {

      const registration = new TypeRegistration(registrationSetting);

      this.cacheRegistration(registrationSetting.key, registration);
    });
  }

  public exportRegistrations(keysToExport?: Array<RegistrationKey>): Array<IRegistrationSettings> {

    const registrationKeys = keysToExport || this.getRegistrationKeys();

    return registrationKeys.map((registrationKey) => {

      const registration = this.getRegistration(registrationKey);

      const exportedSettings = Object.assign({}, registration.settings);

      // strip unserializable properties
      delete exportedSettings.type;
      delete exportedSettings.resolver;

      return exportedSettings;
    });
  }

  public autoRegisterModules(): void {

  }

  public registerModule(moduleName: string): IRegistrator {

    const moduleManifest = require(`${moduleName}/package.json`);
    const iocModulePath = moduleManifest['ioc_module'];
    const iocModule = require(`${moduleName}/${iocModulePath}`);

    const registrationSettings = {
      module: moduleName
    };

    return new RegistrationContext(this, registrationSettings);
  }

  public register<T>(key: RegistrationKey, type: Type<T>): ITypeRegistration<T> {
    const registration = this.createRegistration<T>(key, type);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public registerObject(key: RegistrationKey, object: any): IRegistration {
    const registrationSettings = Object.assign({}, this.settings.defaults);
    Object.assign(registrationSettings, {
      isObject: true
    })
    const registration = this.createRegistration(key, object, registrationSettings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public unregister<T>(key: RegistrationKey): IRegistration {
    const registration = this.getRegistration<T>(key);
    this.deleteRegistration(key);
    return registration;
  }

  protected createRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T> {
    const settings: ITypeRegistrationSettings<T> = registrationSettings || Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.type = type;
    const registration = new TypeRegistration(settings);
    return registration;
  }

  protected getRegistration<T>(key: RegistrationKey): ITypeRegistration<T> {
    return this.registrations[key];
  }

  protected getRegistrationKeys(): Array<string> {
    return Object.keys(this.registrations);
  }

  protected cacheRegistration<T>(key: RegistrationKey, registration: ITypeRegistration<T>): void {
    this.registrations[key] = registration;
  }

  protected deleteRegistration(key: RegistrationKey): void {
    delete this.registrations[key];
  }

}