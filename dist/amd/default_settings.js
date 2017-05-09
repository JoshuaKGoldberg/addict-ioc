define(["require", "exports", "./resolver"], function (require, exports, resolver_1) {
    "use strict";
    exports.DefaultSettings = {
        defaults: {
            isSingleton: false,
            wantsInjection: true,
        },
        resolver: new resolver_1.Resolver(),
        containerRegistrationKey: 'container',
    };
});

//# sourceMappingURL=default_settings.js.map
