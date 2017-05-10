import { IResolutionContext, ITypeRegistration, IDependencyOwners } from './interfaces';
export declare class ResolutionContext<T> implements IResolutionContext<T> {
    registration: ITypeRegistration<T>;
    history: Array<ITypeRegistration<any>>;
    owners: IDependencyOwners;
    isDependencyOwned: boolean;
    constructor(registration: ITypeRegistration<T>);
}
