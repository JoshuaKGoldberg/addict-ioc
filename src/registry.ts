import { defaultSettings } from './default_settings';
import { IContainer, IFactoryRegistration, IFactoryRegistrationSettings, IObjectRegistration, IObjectRegistrationSettings, IRegistration, IRegistrationSettings,
  IRegistrator, IRegistry, ISpecializedRegistration, ITags, ITypeRegistration, ITypeRegistrationSettings, RegistrationKey, Type } from './interfaces';
import {Registration} from './registration';
import {RegistrationContext} from './registration_context';
import {FactoryRegistrationSettings, ObjectRegistrationSettings, TypeRegistrationSettings} from './registration_settings';

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
    this.settings = this._mergeSettings(defaultSettings, this.settings);
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

    const settings: IRegistrationSettings = Object.assign({}, existingSettings);
    Object.assign(settings, newSettings);
    Object.assign(settings.defaults, existingSettings.defaults);
    Object.assign(settings.defaults, newSettings.defaults);

    return settings;
  }

  public importRegistrations(registrationSettings: Array<IRegistrationSettings>): void {

    for (const registrationSetting of registrationSettings) {

      const registration: IRegistration = new Registration(registrationSetting);

      this.cacheRegistration(registrationSetting.key, registration);
    }
  }

  public exportRegistrations(keysToExport?: Array<RegistrationKey>): Array<IRegistrationSettings> {

    const registrationKeys: Array<string> = keysToExport || this.getRegistrationKeys();

    return registrationKeys.map((registrationKey: string) => {

      const registration: IRegistration = this.getRegistration(registrationKey);

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
    const registration: IRegistration = this.getRegistration(key);
    return !!registration;
  }

  public createRegistrationTemplate(registrationSettings: IRegistrationSettings): IRegistrator {
    return new RegistrationContext(this, registrationSettings);
  }

  public register<T>(key: RegistrationKey, type: Type<T>, settings?: IRegistrationSettings): ITypeRegistration<T> {
    const registration: ITypeRegistration<T> = this.createRegistration<T>(key, type, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public registerObject<T>(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IObjectRegistration<T> {
    const registration: ITypeRegistration<T> = this.createObjectRegistration(key, object, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public registerFactory<T>(key: RegistrationKey, factoryMethod: any, settings?: IRegistrationSettings): IFactoryRegistration<T> {
    const registration: IFactoryRegistration<T> = this.createFactoryRegistration(key, factoryMethod, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public unregister(key: RegistrationKey): IRegistration {
    const registration: IRegistration = this.getRegistration(key);
    this.deleteRegistration(key);
    return registration;
  }

  protected createRegistration<T>(key: RegistrationKey, type: Type<T>, registrationSettings?: IRegistrationSettings): ITypeRegistration<T> {
    const settings: ITypeRegistrationSettings<T> = registrationSettings ? new TypeRegistrationSettings<T>(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.type = type;
    const registration: ITypeRegistration<T> = new Registration(settings);
    return registration;
  }

  protected createObjectRegistration<T>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): IObjectRegistration<T> {
    const settings: IObjectRegistrationSettings<T> = registrationSettings ? new ObjectRegistrationSettings<T>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isObject = true;
    settings.object = object;
    const registration: IObjectRegistration<T> = new Registration(settings);
    return registration;
  }

  protected createFactoryRegistration<T>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): IFactoryRegistration<T> {
    const settings: IFactoryRegistrationSettings<T> = registrationSettings ? new FactoryRegistrationSettings<T>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isFactory = true;
    settings.factory = factoryFunction;
    const registration: IFactoryRegistration<T> = new Registration(settings);
    return registration;
  }

  public getRegistration(key: RegistrationKey): IRegistration {

    const registration: IRegistration = this.registrations[key];

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

    const registrationKeys: Array<string> = this.getRegistrationKeys();
    const foundKeys: Array<string> = [];

    const query: ITags = this._buildTagQuery(tags);

    for (const tag in query) {

      const tagValue: any = query[tag];

      for (const registrationKey of registrationKeys) {

        const registration: IRegistration = this.getRegistration(registrationKey);

        const registrationTagValue: any = registration.settings.tags[tag];

        if (tagValue === registrationTagValue) {

          foundKeys.push(registrationKey);
        }
      }
    }

    return foundKeys;
  }

  protected _buildTagQuery(...tags: Array<ITags | string>): ITags {

    const query: any = {};

    for (const value of tags) {

      if (typeof value === 'string') {

        const hasTagDefaultValue: boolean = typeof query[value] === 'undefined';

        if (!hasTagDefaultValue) {
          query[value] = {};
        }

      } else {

        for (const tagKey in value as ITags) {

          const tagValue: any = query[tagKey];

          const hasTagValue: boolean = Object.keys(tagValue).length !== 0;

          if (!hasTagValue) {
            query[tagKey] = value[tagKey];
          }
        }
      }
    }

    return query;
  }

}
