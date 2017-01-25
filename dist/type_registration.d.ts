import { ITypeRegistrationSettings } from './interfaces';
export declare class TypeRegistration {
    private _settings;
    constructor(defaults: ITypeRegistrationSettings, key: string, type: any, isFactory?: boolean);
    settings: ITypeRegistrationSettings;
    dependencies(...args: any[]): this;
    configure(config: any): this;
    singleton(isSingleton: boolean): this;
    noInjection(injectionDisabled: boolean): this;
    injectInto(targetFunction: string): this;
    injectLazy(): this;
    onNewInstance(key: string, targetFunction: string): this;
    bindFunctions(): this;
    tags(tagOrTags: string | string[]): this;
    setAttribute(tag: string, value: any): this;
    hasTags(tagOrTags: string | Array<string>): boolean;
    hasAttributes(attributes: any): boolean;
    overwrite(originalKey: string, overwrittenKey: string): this;
}
