"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resolver_1 = require("./resolver");
exports.defaultSettings = {
    defaults: {
        isSingleton: false,
        wantsInjection: true,
        dependencies: [],
        lazyDependencies: [],
        lazyDependenciesAsync: [],
        ownedDependencies: [],
        functionsToBind: [],
        overwrittenKeys: {},
        overwrittenConventionCalls: {},
        injectConventionCalled: {},
    },
    resolver: new resolver_1.Resolver(),
    containerRegistrationKey: 'container',
    circularDependencyCanIncludeSingleton: true,
    circularDependencyCanIncludeLazy: true,
};

//# sourceMappingURL=default_settings.js.map
