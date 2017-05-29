import {Container} from './container';
import {executeAsExtensionHookAsync as extensionHook} from './utils';
import { ITypeRegistration, IResolutionContext, IInvocationContext, RegistrationKey, IObjectRegistration, IFactoryRegistration, IInvocationResolutionContext, IInvocationWrapper, IRegistration } from "./interfaces";

export class InvocationContainer extends Container<IInvocationWrapper<any>> {

  public async resolveAsync<T>(key: RegistrationKey, injectionArgs: Array<any> = [], config?: any): Promise<T> {

    const registration = this.getRegistration<T>(key);
    const resolutionContext = this._createNewResolutionContext<T>(registration);

    const resolvedInstance = await this._resolveAsync<T>(registration, resolutionContext, injectionArgs, config);
  
    await this._performInvocationsAsync<T>(resolutionContext);

    return resolvedInstance;
  }



  protected _createNewResolutionContext<T>(registration: IRegistration): IInvocationResolutionContext<T> {
    const newResolutionContext = super._createNewResolutionContext<T>(registration);
    newResolutionContext.currentResolution.invocations = {};
    return newResolutionContext as IInvocationResolutionContext<T>;
  }

  protected _createChildResolutionContext<T>(registration: IRegistration, resolutionContext: IInvocationResolutionContext<T>): IInvocationResolutionContext<T> {

    const newResolutionContext = super._createChildResolutionContext(registration, resolutionContext);

    newResolutionContext.currentResolution.invocations = {};

    return newResolutionContext as IInvocationResolutionContext<T>;
  }

  protected async _resolveDependencyAsync<T>(registration: ITypeRegistration<T>, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): Promise<any> {

    const resolvedDependency = await super._resolveDependencyAsync(registration, dependencyKey, resolutionContext);

    this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);

    return resolvedDependency;
  }

  // protected async _resolveTypeInstanceAsync<T>(registration: ITypeRegistration<T>, resolutionContext: IResolutionContext, injectionArgs?: Array<any>, config?: any): Promise<T> {

  //   const resolvedInstance = await super._resolveTypeInstanceAsync<T>(registration, resolutionContext, injectionArgs, config);

  //   const invocationContext = this._createInvocationContext();

  //   resolutionContext.invocations.push(invocationContext);

  //   // await this._performInvocationsAsync<T>(registration, resolvedInstance);

  //   return resolvedInstance;
  // }

  protected _initializeDependencyInvocationContext<T>(registration: ITypeRegistration<T>, dependencyKey: RegistrationKey, resolutionContext: IInvocationResolutionContext<T>): void {
    
    const parentConventionCalls = registration.settings.conventionCalls[dependencyKey] || {};

    const conventionCalls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
    const invocations = {};

    for (let call of conventionCalls) {

      const callOverwritten = parentConventionCalls[call];
      const callUsed = callOverwritten || call;

      invocations[call] = callUsed;
    }

    resolutionContext.instanceLookup[resolutionContext.currentResolution.id].invocations = invocations;
  }

  protected async _performInvocationsAsync<T>(resolutionContext: IInvocationResolutionContext<T>): Promise<void> {

    const calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;

    if (!calls) {
      return;
    }

    for (let call of calls) {

      for (let instanceId of resolutionContext.instanceResolutionOrder) {

        const instanceWrapper = resolutionContext.instanceLookup[instanceId];
        
        const invocation = instanceWrapper.invocations[call] || call;

        await extensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
      }
    }
  }
  
}