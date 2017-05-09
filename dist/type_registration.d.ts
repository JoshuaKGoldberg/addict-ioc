import { RegistrationKey, ITypeRegistrationSettings, ITypeRegistration } from './interfaces';
export declare class TypeRegistration<T> implements ITypeRegistration<T> {
    private _settings;
    constructor(settings: ITypeRegistrationSettings<T>);
    readonly settings: ITypeRegistrationSettings<T>;
    configure(config: any): ITypeRegistration<T>;
    dependencies(...dependencies: Array<RegistrationKey>): ITypeRegistration<T>;
    singleton(isSingleton?: boolean): ITypeRegistration<T>;
    injectLazy(...lazyDependencies: Array<RegistrationKey>): ITypeRegistration<T>;
}
