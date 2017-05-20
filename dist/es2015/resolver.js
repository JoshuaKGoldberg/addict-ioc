var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { getPropertyDescriptor } from './utils';
var Resolver = (function () {
    function Resolver() {
    }
    Resolver.prototype.hash = function (anything) {
        if (typeof anything === 'undefined' || anything === null) {
            return undefined;
        }
        return anything.toString();
    };
    Resolver.prototype.hashType = function (type) {
        return this.hash(type);
    };
    Resolver.prototype.hashObject = function (object) {
        return this.hash(object);
    };
    Resolver.prototype.hashFactory = function (factory) {
        return this.hash(factory);
    };
    Resolver.prototype.hashConfig = function (config) {
        return this.hash(config);
    };
    Resolver.prototype.resolveType = function (container, registration) {
        return registration.settings.type;
    };
    Resolver.prototype.resolveTypeAsync = function (container, registration) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        resolve(registration.settings.type);
                    })];
            });
        });
    };
    Resolver.prototype.resolveObject = function (container, registration) {
        return registration.settings.object;
    };
    Resolver.prototype.resolveObjectAsync = function (container, registration) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        resolve(registration.settings.object);
                    })];
            });
        });
    };
    Resolver.prototype.resolveFactory = function (container, registration) {
        return registration.settings.factory;
    };
    Resolver.prototype.resolveFactoryAsync = function (container, registration) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        resolve(registration.settings.factory);
                    })];
            });
        });
    };
    Resolver.prototype.resolveConfig = function (config) {
        return config;
    };
    Resolver.prototype._configureInstance = function (instance, config) {
        if (!config) {
            return;
        }
        var configPropertyDescriptor = getPropertyDescriptor(instance, 'config');
        if (configPropertyDescriptor === undefined || (!configPropertyDescriptor.writable && !configPropertyDescriptor.set)) {
            var instancePrototype = Object.getPrototypeOf(instance);
            throw new Error("The setter for the config property on type '" + instancePrototype.constructor.name + "' is missing.");
        }
        instance.config = config;
    };
    Resolver.prototype.createObject = function (container, object, registration, dependencies, injectionArgs) {
        return this._createObject(object, registration, dependencies, injectionArgs);
    };
    Resolver.prototype._createObject = function (object, registration, dependencies, injectionArgs) {
        var argumentsToBeInjected = dependencies.concat(injectionArgs);
        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
            this._injectDependenciesIntoInstance(registration.settings, object, argumentsToBeInjected);
        }
        return object;
    };
    Resolver.prototype.createFactory = function (container, type, registration, dependencies, injectionArgs) {
        return this._createFactory(registration, dependencies, injectionArgs);
    };
    Resolver.prototype._createFactory = function (registration, dependencies, injectionArgs) {
        var argumentsToBeInjected = dependencies.concat(injectionArgs);
        if (registration.settings.wantsInjection && !registration.settings.injectInto && injectionArgs.length > 0) {
            return this._createInstanceByFactoryWithInjection(registration.settings.factory, argumentsToBeInjected);
        }
        var instance = this._createInstanceByFactory(registration.settings.factory);
        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
            this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
        }
        return instance;
    };
    Resolver.prototype.createInstance = function (container, type, registration, dependencies, injectionArgs) {
        return this._createInstance(type, registration, dependencies, injectionArgs);
    };
    Resolver.prototype._createInstance = function (type, registration, dependencies, injectionArgs) {
        var argumentsToBeInjected = dependencies.concat(injectionArgs);
        if (registration.settings.wantsInjection && !registration.settings.injectInto && argumentsToBeInjected.length > 0) {
            return this._createInstanceByConstructorWithInjection(type, argumentsToBeInjected);
        }
        var instance = this._createInstanceByConstructor(type);
        if (registration.settings.wantsInjection && typeof registration.settings.injectInto === 'string') {
            this._injectDependenciesIntoInstance(registration.settings, instance, argumentsToBeInjected);
        }
        return instance;
    };
    Resolver.prototype._createInstanceByFactory = function (factoryFunction) {
        var instance = factoryFunction();
        return instance;
    };
    Resolver.prototype._createInstanceByFactoryWithInjection = function (factoryFunction, argumentsToBeInjected) {
        var instance = factoryFunction.apply(undefined, argumentsToBeInjected);
        return instance;
    };
    Resolver.prototype._createInstanceByConstructor = function (type) {
        var instance = new type();
        return instance;
    };
    Resolver.prototype._createInstanceByConstructorWithInjection = function (type, argumentsToBeInjected) {
        var instance = new (type.bind.apply(type, [void 0].concat(argumentsToBeInjected)))();
        return instance;
    };
    Resolver.prototype._injectDependenciesIntoInstance = function (registrationSettings, instance, argumentsToBeInjected) {
        var propertySource;
        if (registrationSettings.isFactory) {
            propertySource = instance;
        }
        else {
            propertySource = Object.getPrototypeOf(instance);
        }
        var injectionTargetPropertyDescriptor = getPropertyDescriptor(propertySource, registrationSettings.injectInto);
        if (injectionTargetPropertyDescriptor) {
            if (typeof injectionTargetPropertyDescriptor.value === 'function') {
                this._injectDependenciesIntoFunction(instance, injectionTargetPropertyDescriptor.value, argumentsToBeInjected);
            }
            else if (injectionTargetPropertyDescriptor.set) {
                this._injectDependenciesIntoProperty(instance, registrationSettings.injectInto, argumentsToBeInjected);
            }
            else {
                throw new Error("The setter for the '" + registrationSettings.injectInto + "' property on type '" + Object.getPrototypeOf(instance).constructor.name + "' is missing.");
            }
        }
        else {
            throw new Error("The injection target '" + registrationSettings.injectInto + "' on type '" + Object.getPrototypeOf(instance).constructor.name + "' is missing.");
        }
    };
    Resolver.prototype._injectDependenciesIntoFunction = function (instance, targetFunction, argumentsToBeInjected) {
        targetFunction.apply(targetFunction, argumentsToBeInjected);
    };
    Resolver.prototype._injectDependenciesIntoProperty = function (instance, property, argumentsToBeInjected) {
        instance[property] = argumentsToBeInjected;
    };
    return Resolver;
}());
export { Resolver };

//# sourceMappingURL=resolver.js.map