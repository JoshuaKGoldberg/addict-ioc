import {IResolutionContext, ITypeRegistration, IDependencyOwners} from './interfaces';

export class ResolutionContext<T> implements IResolutionContext<T> {

  public history: Array<ITypeRegistration<any>> = [];
  public owners: IDependencyOwners = {};

  constructor(public registration: ITypeRegistration<T>) {
  }

}