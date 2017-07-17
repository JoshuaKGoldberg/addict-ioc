define(["require", "exports", "./resolver"], function (require, exports, resolver_1) {
    "use strict";
    exports.DefaultSettings = {
        defaults: {
            isSingleton: false,
            wantsInjection: true,
            dependencies: [],
            lazyDependencies: [],
            lazyPromiseDependencies: [],
            ownedDependencies: [],
            functionsToBind: [],
            overwrittenKeys: {}
        },
        resolver: new resolver_1.Resolver(),
        containerRegistrationKey: 'container',
        circularDependencyCanIncludeSingleton: true,
        circularDependencyCanIncludeLazy: true,
    };
});

//# sourceMappingURL=default_settings.js.map
