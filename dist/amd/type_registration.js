define(["require", "exports", "./type_registration_settings"], function (require, exports, type_registration_settings_1) {
    "use strict";
    var TypeRegistration = (function () {
        function TypeRegistration(defaults, key, type, isFactory) {
            this._settings = undefined;
            this._settings = new type_registration_settings_1.TypeRegistrationSettings(defaults, key, type, isFactory);
        }
        Object.defineProperty(TypeRegistration.prototype, "settings", {
            get: function () {
                return this._settings;
            },
            set: function (value) {
                this._settings = value;
            },
            enumerable: true,
            configurable: true
        });
        TypeRegistration.prototype.dependencies = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var resolvedDepedencyConfigurations = [];
            args.forEach(function (currentDependencyConfiguration) {
                var dependencyType = typeof currentDependencyConfiguration;
                if (Array.isArray(currentDependencyConfiguration)) {
                    Array.prototype.push.apply(resolvedDepedencyConfigurations, currentDependencyConfiguration);
                }
                else if (dependencyType === 'string' || dependencyType === 'function') {
                    resolvedDepedencyConfigurations.push(currentDependencyConfiguration);
                }
                else {
                    throw new Error("The type '" + dependencyType + "' of your dependencies declaration is not yet supported.\n                Supported types: 'Array', 'String', 'Function(Type)'");
                }
            });
            this.settings.dependencies = resolvedDepedencyConfigurations;
            return this;
        };
        TypeRegistration.prototype.configure = function (config) {
            var configType = typeof config;
            if (configType !== 'function' && configType !== 'object' && configType !== 'string') {
                throw new Error("The type '" + configType + "' of your dependencies declaration is not yet supported.\n              Supported types: 'Function', 'Object'");
            }
            this.settings.config = config;
            return this;
        };
        TypeRegistration.prototype.singleton = function (isSingleton) {
            this.settings.isSingleton = !!isSingleton ? isSingleton : true;
            return this;
        };
        TypeRegistration.prototype.noInjection = function (injectionDisabled) {
            if (this.settings.injectInto) {
                throw new Error("'noInjection' induces a conflict to the 'injectInto' declaration.");
            }
            if (this.settings.isLazy) {
                throw new Error("'noInjection' induces a conflict to the 'injectLazy' declaration.");
            }
            this.settings.wantsInjection = !!injectionDisabled ? !injectionDisabled : false;
            return this;
        };
        TypeRegistration.prototype.injectInto = function (targetFunction) {
            if (!this.settings.wantsInjection) {
                throw new Error("'injectInto' induces a conflict to the 'noInjection' declaration.");
            }
            this.settings.injectInto = targetFunction;
            return this;
        };
        TypeRegistration.prototype.injectLazy = function () {
            if (!this.settings.wantsInjection) {
                throw new Error("'injectLazy' induces a conflict to the 'noInjection' declaration.");
            }
            this.settings.isLazy = true;
            if (arguments.length > 0) {
                Array.prototype.push.apply(this.settings.lazyKeys, arguments);
            }
            return this;
        };
        TypeRegistration.prototype.onNewInstance = function (key, targetFunction) {
            var subscription = {
                key: key,
                method: targetFunction
            };
            this.settings.subscriptions['newInstance'].push(subscription);
            return this;
        };
        TypeRegistration.prototype.bindFunctions = function () {
            this.settings.bindFunctions = true;
            if (arguments.length > 0) {
                Array.prototype.push.apply(this.settings.functionsToBind, arguments);
            }
            return this;
        };
        TypeRegistration.prototype.tags = function (tagOrTags) {
            var _this = this;
            for (var argumentIndex = 0; argumentIndex < arguments.length; argumentIndex++) {
                var argument = arguments[argumentIndex];
                var argumentType = typeof argument;
                if (Array.isArray(argument)) {
                    argument.forEach(function (tag) {
                        _this.settings.tags[tag] = {};
                    });
                }
                else if (argumentType === 'string') {
                    this.settings.tags[argument] = {};
                }
                else {
                    throw new Error("The type '" + argumentType + "' of your tags declaration is not yet supported.\n                Supported types: 'Array', 'String'");
                }
            }
            return this;
        };
        TypeRegistration.prototype.setAttribute = function (tag, value) {
            if (!tag) {
                throw new Error("You have to specify a tag for your attribute.");
            }
            this.settings.tags[tag] = value;
            return this;
        };
        TypeRegistration.prototype.hasTags = function (tags) {
            var declaredTags = Object.keys(this.settings.tags);
            if (!Array.isArray(tags)) {
                tags = [tags];
            }
            var isTagMissing = tags.some(function (tag) {
                if (declaredTags.indexOf(tag) < 0) {
                    return true;
                }
            });
            return !isTagMissing;
        };
        TypeRegistration.prototype.hasAttributes = function (attributes) {
            var _this = this;
            var attributeKeys = Object.keys(attributes);
            var attributeMissing = attributeKeys.some(function (attribute) {
                var attributeValue = _this.settings.tags[attribute];
                if (attributeValue !== attributes[attribute]) {
                    return true;
                }
            });
            return !attributeMissing;
        };
        TypeRegistration.prototype.overwrite = function (originalKey, overwrittenKey) {
            if (this.settings.dependencies.indexOf(originalKey) < 0) {
                throw new Error("there is no dependency declared for original key '" + originalKey + "'.");
            }
            this.settings.overwrittenKeys[originalKey] = overwrittenKey;
            return this;
        };
        return TypeRegistration;
    }());
    exports.TypeRegistration = TypeRegistration;
});

//# sourceMappingURL=type_registration.js.map
