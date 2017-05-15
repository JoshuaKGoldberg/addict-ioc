import {IContainerSettings} from './interfaces';
import {Resolver} from './resolver';

export const DefaultSettings: IContainerSettings = {
  
  defaults: {
    isSingleton: false,
    wantsInjection: true,
    dependencies: [],
    lazyDependencies: [],
    lazyPromiseDependencies: [],
    ownedDependencies: [],
    functionsToBind: [],
    overwrittenKeys: {}
    // isLazy: false,
    // bindFunctions: false,
    // autoCreateMissingSubscribers: true
  },
  resolver: new Resolver(),
  containerRegistrationKey: 'container',
  circularDependencyCanIncludeSingleton: true,
  circularDependencyCanIncludeLazy: true,

}