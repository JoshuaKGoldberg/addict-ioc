"use strict";
class Registration {
    constructor(settings) {
        this._settings = this._ensureSettings(settings);
    }
    _ensureSettings(settings) {
        const baseSettings = {
            overwrittenKeys: {},
            tags: {}
        };
        return Object.assign(baseSettings, settings);
    }
    get settings() {
        return this._settings;
    }
    configure(config) {
        this.settings.config = config;
        return this;
    }
    dependencies(...dependencies) {
        this.settings.dependencies = dependencies;
        return this;
    }
    singleton(isSingleton = true) {
        this.settings.isSingleton = isSingleton;
        return this;
    }
    transient(isTransient = true) {
        this.settings.isSingleton = !isTransient;
        return this;
    }
    injectLazy(...lazyDependencies) {
        this.settings.lazyDependencies = lazyDependencies;
        this.settings.wantsLazyInjection = true;
        return this;
    }
    injectPromiseLazy(...lazyPromiseDependencies) {
        this.settings.lazyPromiseDependencies = lazyPromiseDependencies;
        this.settings.wantsPromiseLazyInjection = true;
        return this;
    }
    injectInto(targetFunction) {
        this.settings.injectInto = targetFunction;
        return this;
    }
    bindFunctions(...functionsToBind) {
        this.settings.functionsToBind = functionsToBind;
        return this;
    }
    tags(...tags) {
        for (const tag of tags) {
            if (!this.settings.tags[tag]) {
                this.settings.tags[tag] = {};
            }
        }
        return this;
    }
    setTag(tag, value) {
        this.settings.tags[tag] = value;
        return this;
    }
    overwrite(originalKey, overwrittenKey) {
        this.settings.overwrittenKeys[originalKey] = overwrittenKey;
        return this;
    }
    owns(...ownedDependencies) {
        this.settings.ownedDependencies = ownedDependencies;
        return this;
    }
}
exports.Registration = Registration;

//# sourceMappingURL=registration.js.map
