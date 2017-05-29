import { ITypeRegistrationSettings, IFactoryRegistrationSettings, IObjectRegistrationSettings, Type, IRegistrationSettings, IOverwrittenKeys, RegistrationKey, IResolver, TypeConfig, IInstanceWrapper } from './interfaces';
export declare class RegistrationSettings<T> implements IRegistrationSettings {
    defaults: IRegistrationSettings;
    settings: IRegistrationSettings;
    constructor(registrationSettings: IRegistrationSettings);
    key: RegistrationKey;
    object: any;
    factory: any;
    readonly resolver: IResolver<T, IInstanceWrapper<T>>;
    readonly module: string;
    readonly config: TypeConfig;
    readonly dependencies: Array<string>;
    readonly ownedDependencies: Array<string>;
    readonly lazyDependencies: Array<string>;
    readonly lazyDependenciesAsync: Array<string>;
    readonly isSingleton: boolean;
    readonly isObject: boolean;
    readonly isFactory: boolean;
    readonly wantsInjection: boolean;
    readonly injectInto: string;
    readonly functionsToBind: Array<string>;
    readonly overwrittenKeys: IOverwrittenKeys;
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
    constructor(registrationSettings: IObjectRegistrationSettings);
    readonly settings: IObjectRegistrationSettings;
    object: T;
}
export declare class FactoryRegistrationSettings<T> extends RegistrationSettings<T> {
    constructor(registrationSettings: IFactoryRegistrationSettings);
    readonly settings: IFactoryRegistrationSettings;
    object: T;
}
