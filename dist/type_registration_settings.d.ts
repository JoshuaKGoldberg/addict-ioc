import { ITypeRegistrationSettings, IHookSubscriptions } from './interfaces';
export declare class TypeRegistrationSettings implements ITypeRegistrationSettings {
    private _defaults;
    private _key;
    private _type;
    private _dependencies;
    private _config;
    private _tags;
    private _injectInto;
    private _functionsToBind;
    private _lazyKeys;
    private _overwrittenKeys;
    private _isSingleton;
    private _wantsInjection;
    private _isLazy;
    private _bindFunctions;
    private _subscriptions;
    private _isFactory;
    private _isObject;
    private _autoCreateMissingSubscribers;
    constructor(defaults: ITypeRegistrationSettings, key: string, type: any, isFactory?: boolean, isObject?: boolean);
    readonly defaults: ITypeRegistrationSettings;
    readonly key: any;
    readonly type: any;
    dependencies: Array<string>;
    config: any;
    tags: any;
    injectInto: string;
    functionsToBind: Array<string>;
    lazyKeys: Array<string>;
    readonly overwrittenKeys: any;
    readonly isFactory: boolean;
    readonly subscriptions: IHookSubscriptions;
    isSingleton: boolean;
    wantsInjection: boolean;
    isLazy: boolean;
    bindFunctions: boolean;
    autoCreateMissingSubscribers: boolean;
    isObject: boolean;
    private getSettingOrDefault(key);
}
