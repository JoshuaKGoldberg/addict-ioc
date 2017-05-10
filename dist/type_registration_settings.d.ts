import { ITypeRegistrationSettings, Type, IRegistrationSettings, IOverwrittenKeys, RegistrationKey, ITypeResolver, TypeConfig } from './interfaces';
export declare class TypeRegistrationSettings<T> implements ITypeRegistrationSettings<T> {
    defaults: IRegistrationSettings;
    protected settings: ITypeRegistrationSettings<T>;
    constructor(registrationSettings: ITypeRegistrationSettings<T> | IRegistrationSettings);
    key: RegistrationKey;
    type: Type<T>;
    object: any;
    factory: any;
    readonly resolver: ITypeResolver;
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
