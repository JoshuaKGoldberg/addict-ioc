import { IFactoryRegistrationSettings, IInstanceWrapper, IObjectRegistrationSettings, IOverwrittenKeys, IRegistrationSettings, IResolver, ITags, ITypeRegistrationSettings, RegistrationKey, Type, TypeConfig } from './interfaces';
export declare class RegistrationSettings<T> implements IRegistrationSettings {
    defaults: IRegistrationSettings;
    settings: IRegistrationSettings;
    constructor(registrationSettings: IRegistrationSettings);
    key: RegistrationKey;
    object: any;
    factory: any;
    resolver: IResolver<T, IInstanceWrapper<T>>;
    module: string;
    config: TypeConfig;
    dependencies: Array<string>;
    ownedDependencies: Array<string>;
    lazyDependencies: Array<string>;
    lazyDependenciesAsync: Array<string>;
    isSingleton: boolean;
    isObject: boolean;
    isFactory: boolean;
    wantsInjection: boolean;
    injectInto: string;
    functionsToBind: Array<string>;
    overwrittenKeys: IOverwrittenKeys;
    tags: ITags;
    private _getCurrentOrDefault(key);
    private _getCurrentOrDefaultArray(key);
    private _getCurrentOrDefaultIndexer(key);
}
export declare class TypeRegistrationSettings<T> extends RegistrationSettings<T> {
    constructor(registrationSettings: ITypeRegistrationSettings<T>);
    readonly settings: ITypeRegistrationSettings<T>;
    type: Type<T>;
}
export declare class ObjectRegistrationSettings<T> extends RegistrationSettings<T> {
    constructor(registrationSettings: IObjectRegistrationSettings<T>);
    readonly settings: IObjectRegistrationSettings<T>;
    object: T;
}
export declare class FactoryRegistrationSettings<T> extends RegistrationSettings<T> {
    constructor(registrationSettings: IFactoryRegistrationSettings<T>);
    readonly settings: IFactoryRegistrationSettings<T>;
    object: T;
}
