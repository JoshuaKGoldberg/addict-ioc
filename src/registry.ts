import {IContainer, RegistrationKey, IRegistration, ITypeRegistration, IRegistrationSettings, ITypeRegistrationSettings, ITypeResolver, Type, IRegistry, IRegistrator} from './interfaces';
import {TypeRegistration} from './type_registration';
import {TypeRegistrationSettings} from './type_registration_settings';
import {RegistrationContext} from './registration_context';

export interface IRegistrationsCache {
  [key: string]: ITypeRegistration<any>;
}

export class Registry implements IRegistry {

  public registrations: IRegistrationsCache = {};
  public settings: IRegistrationSettings;
  protected parentRegistry: IRegistry; 

  constructor(settings: IRegistrationSettings, parentRegistry?: IRegistry) {
    this.settings = settings;
    this.parentRegistry = parentRegistry;
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

  // public autoRegisterModules(): void {

  // }

  // public registerModule(moduleName: string): IRegistrator {

  //   const moduleManifest = require(`${moduleName}/package.json`);
  //   const iocModulePath = moduleManifest['ioc_module'];
  //   const iocModule = require(`${moduleName}/${iocModulePath}`);

  //   const registrationSettings = {
  //     module: moduleName
  //   };

  //   return new RegistrationContext(this, registrationSettings);
  // }

  public isRegistered(key: RegistrationKey): boolean {
    const registration = this.getRegistration(key);
    return !!registration;
  }

  public createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator {
    return new RegistrationContext(this, registrationSettings);
  }

  public register<T>(key: RegistrationKey, type: Type<T>, settings?: IRegistrationSettings): ITypeRegistration<T> {
    const registration = this.createTypeRegistration<T>(key, type, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public registerObject(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IRegistration {
    const registration = this.createObjectRegistration(key, object, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }  
  
  public registerFactory(key: RegistrationKey, factoryMethod: any, settings?: IRegistrationSettings): IRegistration {
    const registration = this.createFactoryRegistration(key, factoryMethod, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public unregister<T>(key: RegistrationKey): IRegistration {
    const registration = this.getRegistration<T>(key);
    this.deleteRegistration(key);
    return registration;
  }

  protected createTypeRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T> {
    const settings: ITypeRegistrationSettings<T> = registrationSettings ? new TypeRegistrationSettings<T>(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.type = type;
    const registration = new TypeRegistration(settings);
    return registration;
  }

  protected createObjectRegistration<T>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): ITypeRegistration<T> {
    const settings: ITypeRegistrationSettings<T> = registrationSettings ? new TypeRegistrationSettings<T>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isObject = true;
    settings.object = object;
    const registration = new TypeRegistration(settings);
    return registration;
  }

  protected createFactoryRegistration<T>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): ITypeRegistration<T> {
    const settings: ITypeRegistrationSettings<T> = registrationSettings ? new TypeRegistrationSettings<T>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isFactory = true;
    settings.factory = factoryFunction;
    const registration = new TypeRegistration(settings);
    return registration;
  }

  public getRegistration<T>(key: RegistrationKey): ITypeRegistration<T> {

    const registration = this.registrations[key];

    if (!registration && this.parentRegistry) {
      return this.parentRegistry.getRegistration<T>(key);
    }

    return registration;
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

  public getKeysByTags(...tags: Array<string>): Array<RegistrationKey> {

    const foundKeys = [];

    const registrationKeys = this.getRegistrationKeys();

    registrationKeys.forEach((registrationKey) => {

      const registration = this.getRegistration(registrationKey);

      if (this._hasRegistrationTags(registration, tags)) {

        foundKeys.push(registration.settings.key);
      }
    });

    return foundKeys;
  }

  private _hasRegistrationTags(registration: IRegistration, tags: Array<string>): boolean {

    const declaredTags = Object.keys(registration.settings.tags);

    const isTagMissing = tags.some((tag) => {

      if (declaredTags.indexOf(tag) < 0) {
        return true;
      }
    });

    return !isTagMissing;
  }
}