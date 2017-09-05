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

  public register<TType>(key: RegistrationKey, type: Type<TType>, settings?: IRegistrationSettings): ITypeRegistration<TType> {
    const registration: ITypeRegistration<TType> = this.createRegistration<TType>(key, type, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public registerObject<TType>(key: RegistrationKey, object: any, settings?: IRegistrationSettings): IObjectRegistration<TType> {
    const registration: ITypeRegistration<TType> = this.createObjectRegistration(key, object, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public registerFactory<TType>(key: RegistrationKey, factoryMethod: any, settings?: IRegistrationSettings): IFactoryRegistration<TType> {
    const registration: IFactoryRegistration<TType> = this.createFactoryRegistration(key, factoryMethod, settings);
    this.cacheRegistration(key, registration);
    return registration;
  }

  public unregister(key: RegistrationKey): IRegistration {
    const registration: IRegistration = this.getRegistration(key);
    this.deleteRegistration(key);
    return registration;
  }

  protected createRegistration<TType>(key: RegistrationKey, type: Type<TType>, registrationSettings?: IRegistrationSettings): ITypeRegistration<TType> {
    const settings: ITypeRegistrationSettings<TType> = registrationSettings ? new TypeRegistrationSettings<TType>(Object.assign({}, registrationSettings)) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.type = type;
    const registration: ITypeRegistration<TType> = new Registration(settings);
    return registration;
  }

  protected createObjectRegistration<TType>(key: RegistrationKey, object: any, registrationSettings?: IRegistrationSettings): IObjectRegistration<TType> {
    const settings: IObjectRegistrationSettings<TType> = registrationSettings ? new ObjectRegistrationSettings<TType>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isObject = true;
    settings.object = object;
    const registration: IObjectRegistration<TType> = new Registration(settings);
    return registration;
  }

  protected createFactoryRegistration<TType>(key: RegistrationKey, factoryFunction: any, registrationSettings?: IRegistrationSettings): IFactoryRegistration<TType> {
    const settings: IFactoryRegistrationSettings<TType> = registrationSettings ? new FactoryRegistrationSettings<TType>(registrationSettings) : Object.assign({}, this.settings.defaults);
    settings.key = key;
    settings.isFactory = true;
    settings.factory = factoryFunction;
    const registration: IFactoryRegistration<TType> = new Registration(settings);
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
    const keys: Array<string> = Object.keys(this.registrations);
    return this.sortKeys(keys);
  }

  private sortKeys(keys: Array<string>): Array<string> {
    return keys.sort((a: string, b: string): number => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
  }

  protected cacheRegistration(key: RegistrationKey, registration: IRegistration): void {
    this.registrations[key] = registration;
  }

  protected deleteRegistration(key: RegistrationKey): void {
    delete this.registrations[key];
  }

  public getKeysByTags(...tags: Array<ITags|string>): Array<RegistrationKey> {

    const registrationKeys: Array<string> = this.getRegistrationKeys();
    const foundKeys: Array<string> = [];

    const query: ITags = this._buildTagQuery(...tags);

    for (const tag in query) {

      const tagValue: any = query[tag];

      for (const registrationKey of registrationKeys) {

        const registration: IRegistration = this.getRegistration(registrationKey);

        if (Object.keys(tagValue).length > 0) {
          if (tagValue === registration.settings.tags[tag]) {

            foundKeys.push(registrationKey);
          }
        } else if (!!registration.settings.tags[tag]) {
          foundKeys.push(registrationKey);
        }
      }
    }

    return this.sortKeys(foundKeys);
  }

  protected _buildTagQuery(...tags: Array<ITags | string>): ITags {

    const query: any = {};

    for (const value of tags) {

      if (typeof value === 'string') {

        const hasTagDefaultValue: boolean = typeof query[value] !== 'undefined';

        if (!hasTagDefaultValue) {
          query[value] = {};
        }

      } else {

        for (const tagKey in value as ITags) {

          const tagValue: any = query[tagKey];

          const hasTagValue: boolean = !!tagValue && Object.keys(tagValue).length !== 0;

          if (!hasTagValue) {
            query[tagKey] = value[tagKey];
          }
        }
      }
    }

    return query;
  }

}
