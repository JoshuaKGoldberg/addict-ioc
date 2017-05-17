import { IResolutionContext, IRegistration, IDependencyOwners } from './interfaces';
export declare class ResolutionContext implements IResolutionContext {
    registration: IRegistration;
    history: Array<IRegistration>;
    owners: IDependencyOwners;
    isDependencyOwned: boolean;
    constructor(registration: IRegistration);
}
