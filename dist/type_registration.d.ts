import { RegistrationKey, ITypeRegistrationSettings, ITypeRegistration } from './interfaces';
export declare class TypeRegistration<T> implements ITypeRegistration<T> {
    private _settings;
    constructor(settings: ITypeRegistrationSettings<T>);
    private _ensureSettings(settings);
    readonly settings: ITypeRegistrationSettings<T>;
    configure(config: any): ITypeRegistration<T>;
    dependencies(...dependencies: Array<RegistrationKey>): ITypeRegistration<T>;
    singleton(isSingleton?: boolean): ITypeRegistration<T>;
    injectLazy(...lazyDependencies: Array<RegistrationKey>): ITypeRegistration<T>;
    injectPromiseLazy(...lazyPromiseDependencies: Array<RegistrationKey>): ITypeRegistration<T>;
    injectInto(targetFunction: string): ITypeRegistration<T>;
    bindFunctions(...functionsToBind: Array<string>): ITypeRegistration<T>;
    tags(...tags: Array<string>): ITypeRegistration<T>;
    setTag(tag: string, value: any): ITypeRegistration<T>;
    overwrite(originalKey: string, overwrittenKey: string): ITypeRegistration<T>;
    owns(...ownedDependencies: any[]): ITypeRegistration<T>;
}
