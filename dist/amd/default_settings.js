define(["require", "exports", "./resolver"], function (require, exports, resolver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        },
        resolver: new resolver_1.Resolver(),
        containerRegistrationKey: 'container',
        circularDependencyCanIncludeSingleton: true,
        circularDependencyCanIncludeLazy: true,
    };
});

//# sourceMappingURL=default_settings.js.map
