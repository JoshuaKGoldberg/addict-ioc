"use strict";
const container_1 = require("./container");
const utils_1 = require("./utils");
class InvocationContainer extends container_1.Container {
    async resolveAsync(key, injectionArgs = [], config) {
        const registration = this.getRegistration(key);
        const resolutionContext = this._createNewResolutionContext(registration);
        const resolvedInstance = await this._resolveAsync(registration, resolutionContext, injectionArgs, config);
        await this._performInvocationsAsync(resolutionContext);
        console.log(resolutionContext);
        return resolvedInstance;
    }
    resolve(key, injectionArgs = [], config) {
        const registration = this.getRegistration(key);
        const resolutionContext = this._createNewResolutionContext(registration);
        const resolvedInstance = this._resolve(registration, resolutionContext, injectionArgs, config);
        this._performInvocations(resolutionContext);
        console.log(resolutionContext);
        return resolvedInstance;
    }
    _resolveLazy(registration, resolutionContext, injectionArgs = [], config) {
        return (lazyInjectionArgs, lazyConfig) => {
            const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);
            const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);
            const resolvedInstance = this._resolve(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
            this._performInvocations(resolutionContext);
            return resolvedInstance;
        };
    }
    _resolveLazyAsync(registration, resolutionContext, injectionArgs = [], config) {
        return async (lazyInjectionArgs, lazyConfig) => {
            const injectionArgsUsed = this._mergeArguments(injectionArgs, lazyInjectionArgs);
            const lazyConfigUsed = this._mergeConfigs(config, lazyConfig);
            const resolvedInstance = this._resolveAsync(registration, resolutionContext, injectionArgsUsed, lazyConfigUsed);
            await this._performInvocationsAsync(resolutionContext);
            return resolvedInstance;
        };
    }
    _createNewResolutionContext(registration) {
        const newResolutionContext = super._createNewResolutionContext(registration);
        newResolutionContext.currentResolution.invocations = {};
        return newResolutionContext;
    }
    _createChildResolutionContext(registration, resolutionContext) {
        const newResolutionContext = super._createChildResolutionContext(registration, resolutionContext);
        newResolutionContext.currentResolution.invocations = {};
        return newResolutionContext;
    }
    async _resolveDependencyAsync(registration, dependencyKey, resolutionContext) {
        const resolvedDependency = await super._resolveDependencyAsync(registration, dependencyKey, resolutionContext);
        this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
        return resolvedDependency;
    }
    _resolveDependency(registration, dependencyKey, resolutionContext) {
        const resolvedDependency = super._resolveDependency(registration, dependencyKey, resolutionContext);
        this._initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext);
        return resolvedDependency;
    }
    _initializeDependencyInvocationContext(registration, dependencyKey, resolutionContext) {
        const parentConventionCalls = registration.settings.conventionCalls[dependencyKey];
        const conventionCalls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
        let invocations = {};
        if (!parentConventionCalls) {
            invocations = conventionCalls;
        }
        else {
            for (let call of conventionCalls) {
                const callOverwritten = parentConventionCalls[call];
                const callUsed = callOverwritten || call;
                invocations[call] = callUsed;
            }
        }
        resolutionContext.instanceLookup[resolutionContext.currentResolution.id].invocations = invocations;
    }
    async _performInvocationsAsync(resolutionContext) {
        const calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
        if (!calls) {
            return;
        }
        for (let call of calls) {
            for (let instanceId of resolutionContext.instanceResolutionOrder) {
                const instanceWrapper = resolutionContext.instanceLookup[instanceId];
                const invocation = instanceWrapper.invocations[call] || call;
                await utils_1.executeAsExtensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
            }
        }
    }
    _performInvocations(resolutionContext) {
        const calls = this.settings.conventionCalls || this.settings.defaults.conventionCalls;
        if (!calls) {
            return;
        }
        for (const call of calls) {
            const instanceResolutionIndex = resolutionContext.instanceResolutionOrder.indexOf(resolutionContext.currentResolution.id);
            if (instanceResolutionIndex === -1) {
                throw new Error('that shouldn`t happen');
            }
            const instancesToInvoke = resolutionContext.instanceResolutionOrder.slice(0, instanceResolutionIndex);
            for (let instanceId of instancesToInvoke) {
                const instanceWrapper = resolutionContext.instanceLookup[instanceId];
                if (instanceWrapper.invoked.indexOf(call) === -1) {
                    continue;
                }
                else {
                    instanceWrapper.invoked.push(call);
                }
                const invocation = instanceWrapper.invocations[call] || call;
                utils_1.executeAsExtensionHook(instanceWrapper.instance[invocation], instanceWrapper.instance, []);
            }
        }
    }
}
exports.InvocationContainer = InvocationContainer;

//# sourceMappingURL=invocation_container.js.map
