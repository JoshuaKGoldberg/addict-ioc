import {IContainerSettings} from './interfaces';
import {Resolver} from './resolver';

export const DefaultSettings: IContainerSettings = {
  
  defaults: {
    isSingleton: false,
    wantsInjection: true,
    // isLazy: false,
    // bindFunctions: false,
    // autoCreateMissingSubscribers: true
  },
  resolver: new Resolver(),
  containerRegistrationKey: 'container',
}