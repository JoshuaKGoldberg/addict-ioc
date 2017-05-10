import {IResolutionContext, ITypeRegistration, IDependencyOwners} from './interfaces';

export class ResolutionContext<T> implements IResolutionContext<T> {

  public history: Array<ITypeRegistration<any>> = [];
  public owners: IDependencyOwners = {};
  public isDependencyOwned: boolean = false;

  constructor(public registration: ITypeRegistration<T>) {
  }

}