import { RegistrationKey, IRegistrationSettings, IRegistration, ISpecializedRegistration } from './interfaces';
export declare class Registration<T extends IRegistration, U extends IRegistrationSettings> implements ISpecializedRegistration<T, U> {
    private _settings;
    constructor(settings: U);
    private _ensureSettings(settings);
    readonly settings: U;
    configure(config: any): ISpecializedRegistration<T, U>;
    dependencies(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U>;
    singleton(isSingleton?: boolean): ISpecializedRegistration<T, U>;
    transient(isTransient?: boolean): ISpecializedRegistration<T, U>;
    injectLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U>;
    injectPromiseLazy(...lazyPromiseDependencies: Array<RegistrationKey>): ISpecializedRegistration<T, U>;
    injectInto(targetFunction: string): ISpecializedRegistration<T, U>;
    bindFunctions(...functionsToBind: Array<string>): ISpecializedRegistration<T, U>;
    tags(...tags: Array<string>): ISpecializedRegistration<T, U>;
    setTag(tag: string, value: any): ISpecializedRegistration<T, U>;
    overwrite(originalKey: string, overwrittenKey: string): ISpecializedRegistration<T, U>;
    owns(...ownedDependencies: any[]): ISpecializedRegistration<T, U>;
}
