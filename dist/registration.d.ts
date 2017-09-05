import { IInstanceWrapper, IOverwrittenConventionCalls, IRegistration, IRegistrationSettings, IResolver, ISpecializedRegistration, RegistrationKey } from './interfaces';
export declare class Registration<TRegistration extends IRegistration, TRegistrationSettings extends IRegistrationSettings> implements ISpecializedRegistration<TRegistration, TRegistrationSettings> {
    private _settings;
    constructor(settings: TRegistrationSettings);
    private _ensureSettings(settings);
    readonly settings: TRegistrationSettings;
    configure(config: any): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    dependencies(...dependencies: Array<RegistrationKey>): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    singleton(isSingleton?: boolean): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    transient(isTransient?: boolean): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    injectLazy(...lazyDependencies: Array<RegistrationKey>): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    injectPromiseLazy(...lazyPromiseDependencies: Array<RegistrationKey>): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    injectInto(targetFunction: string): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    bindFunctions(...functionsToBind: Array<string>): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    tags(...tags: Array<string>): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    setTag(tag: string, value: any): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    overwrite(originalKey: string, overwrittenKey: string): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    owns(...ownedDependencies: Array<string>): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    withResolver<TType = any, TInstanceWrapper extends IInstanceWrapper<TType> = any>(resolver: IResolver<TType, TInstanceWrapper>): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    overwriteConventionCalls(conventionCalls: IOverwrittenConventionCalls): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
    injectConventionCalled(registrationKey: string, conventionCall: string): ISpecializedRegistration<TRegistration, TRegistrationSettings>;
}
