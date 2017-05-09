"use strict";
var resolver_1 = require("./resolver");
exports.DefaultSettings = {
    defaults: {
        isSingleton: false,
        wantsInjection: true,
    },
    resolver: new resolver_1.Resolver(),
    containerRegistrationKey: 'container',
};

//# sourceMappingURL=default_settings.js.map
