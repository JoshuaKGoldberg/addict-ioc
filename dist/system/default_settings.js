System.register(["./resolver"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var resolver_1, DefaultSettings;
    return {
        setters: [
            function (resolver_1_1) {
                resolver_1 = resolver_1_1;
            }
        ],
        execute: function () {
            exports_1("DefaultSettings", DefaultSettings = {
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
            });
        }
    };
});

//# sourceMappingURL=default_settings.js.map
