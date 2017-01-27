import { ITypeRegistrationSettings } from './interfaces';
export declare class TypeRegistration {
    private _settings;
    constructor(defaults: ITypeRegistrationSettings, key: string, type: any, isFactory?: boolean);
    settings: ITypeRegistrationSettings;
    dependencies(...args: any[]): TypeRegistration;
    configure(config: any): TypeRegistration;
    singleton(isSingleton: boolean): TypeRegistration;
    noInjection(injectionDisabled: boolean): TypeRegistration;
    injectInto(targetFunction: string): TypeRegistration;
    injectLazy(): TypeRegistration;
    onNewInstance(key: string, targetFunction: string): TypeRegistration;
    bindFunctions(): TypeRegistration;
    tags(...tags: Array<string | Array<string>>): TypeRegistration;
    setAttribute(tag: string, value: any): TypeRegistration;
    hasTags(...tags: Array<string | Array<string>>): boolean;
    hasAttributes(attributes: any): boolean;
    overwrite(originalKey: string, overwrittenKey: string): TypeRegistration;
    optionalDependencies(...optionalDependencyKeys: Array<string | Array<string>>): TypeRegistration;
}
