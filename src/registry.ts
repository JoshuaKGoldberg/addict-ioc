import { ITags, IObjectRegistrationSettings, IFactoryRegistrationSettings, IContainer, ITypeRegistrationSettings, RegistrationKey, IObjectRegistration, ITypeRegistration, IFactoryRegistration, IRegistration, IRegistrationSettings, Type, IRegistry, IRegistrator, ISpecializedRegistration } from './interfaces';
import {Registration} from './registration';
import {TypeRegistrationSettings, ObjectRegistrationSettings, FactoryRegistrationSettings} from './registration_settings';
import {RegistrationContext} from './registration_context';
import { DefaultSettings } from './default_settings';

export interface IRegistrationsCache {
  [key: string]: IRegistration;
}

export class Registry implements IRegistry {

  public registrations: IRegistrationsCache = {};
  public settings: IRegistrationSettings;

  constructor(settings: IRegistrationSettings, public parentRegistry?: IRegistry) {
    this.settings = settings;
    this.parentRegistry = parentRegistry;
  }

  public initialize(): void {
    this.settings = this._mergeSettings(DefaultSettings, this.settings);
  }

  public clear(): void {
    this.registrations = {};
  }

  protected _mergeSettings(existingSettings: IRegistrationSettings, newSettings: IRegistrationSettings): IRegistrationSettings {

    if (!existingSettings) {
      return newSettings;
    }

    if (!newSettings) {
      return existingSettings;
    }
    
    const settings = Object.assign({}, existingSettings);
    Object.assign(settings, newSettings);
    Object.assign(settings.defaults, existingSettings.defaults);
    Object.assign(settings.defaults, newSettings.defaults);

    return settings;
  }

  public importRegistrations(registrationSettings: Array<IRegistrationSettings>): void {

    for (const registrationSetting of registrationSettings) {

      const registration = new Registration(registrationSetting);

      this.cacheRegistration(registrationSetting.key, registration);
    }
  }

  public exportRegistrations(keysToExport?: Array<RegistrationKey>): Array<IRegistrationSettings> {

    const registrationKeys = keysToExport || this.getRegistrationKeys();

    return registrationKeys.map((registrationKey) => {

      const registration = this.getRegistration(registrationKey);

      const exportedSettings: any = Object.assign({}, registration.settings);

      // strip unserializable properties
      delete exportedSettings.type;
      delete exportedSettings.object;
      delete exportedSettings.factory;
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
    const registration = this.createRegistration<T>(key, type, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public registerObject<T>(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IObjectRegistration<T> {
    const registration = this.createObjectRegistration(key, object, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }  
  
  public registerFactory<T>(key: RegistrationKey, factoryMethod: any, settings?: IRegistrationSettings): IFactoryRegistration<T> {
    const registration = this.createFactoryRegistration(key, factoryMethod, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public unregister(key: RegistrationKey): IRegistration {
    const registration = this.getRegistration(key);
    this.deleteRegistration(key);
    return registration;
  }

  protected createRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T> {
    const settings: ITypeRegistrationSettings<T> = registrationSettings ? new TypeRegistrationSettings<T>(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.type = type;
    const registration = new Registration(settings);
    return registration;
  }

  protected createObjectRegistration<T>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): IObjectRegistration<T> {
    const settings: IObjectRegistrationSettings = registrationSettings ? new ObjectRegistrationSettings<T>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isObject = true;
    settings.object = object;
    const registration = new Registration(settings);
    return registration;
  }

  protected createFactoryRegistration<T>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): IFactoryRegistration<T> {
    const settings: IFactoryRegistrationSettings = registrationSettings ? new FactoryRegistrationSettings<T>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isFactory = true;
    settings.factory = factoryFunction;
    const registration = new Registration(settings);
    return registration;
  }

  public getRegistration(key: RegistrationKey): IRegistration {

    const registration = this.registrations[key];

    if (!registration && this.parentRegistry) {
      return this.parentRegistry.getRegistration(key);
    }

    return registration;
  }

  protected getRegistrationKeys(): Array<string> {
    return Object.keys(this.registrations);
  }

  protected cacheRegistration<T>(key: RegistrationKey, registration: IRegistration): void {
    this.registrations[key] = registration;
  }

  protected deleteRegistration(key: RegistrationKey): void {
    delete this.registrations[key];
  }



  public getKeysByTags(...tags: Array<ITags|string>): Array<RegistrationKey> {

    const registrationKeys = this.getRegistrationKeys();
    const foundKeys = [];

    const query = this._buildTagQuery(tags);

    for (const tag in query) {

      const tagValue = query[tag];

      for (const registrationKey of registrationKeys) {

        const registration = this.getRegistration(registrationKey);

        const registrationTagValue = registration.settings.tags[tag];

        if (tagValue == registrationTagValue) {

          foundKeys.push(registrationKey);
        }
      }
    }

    return foundKeys;
  }

  protected _buildTagQuery(...tags: Array<ITags | string>): ITags {

    const query = {};

    for (const value of tags) {

      if (typeof value === 'string') {

        const hasTagDefaultValue = typeof query[value] === 'undefined';

        if (!hasTagDefaultValue) {
          query[value] = {};
        }

      } else {

        for (const tagKey in value as ITags) {

          const tagValue = query[tagKey];

          const hasTagValue = Object.keys(tagValue).length !== 0;

          if (!hasTagValue) {
            query[tagKey] = value[tagKey];
          }
        }
      }
    }

    return query;
  }

}