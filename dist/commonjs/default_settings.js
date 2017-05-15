"use strict";
var resolver_1 = require("./resolver");
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

//# sourceMappingURL=default_settings.js.map
