import { Resolver } from './resolver';
export var DefaultSettings = {
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
    resolver: new Resolver(),
    containerRegistrationKey: 'container',
    circularDependencyCanIncludeSingleton: true,
    circularDependencyCanIncludeLazy: true,
};

//# sourceMappingURL=default_settings.js.map
