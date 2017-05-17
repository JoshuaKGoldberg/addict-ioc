import {IResolutionContext, IRegistration, IDependencyOwners} from './interfaces';

export class ResolutionContext implements IResolutionContext {

  public history: Array<IRegistration> = [];
  public owners: IDependencyOwners = {};
  public isDependencyOwned: boolean = false;

  constructor(public registration: IRegistration) {
  }

}