import { IResolutionContext, ITypeRegistration, IDependencyOwners } from './interfaces';
export declare class ResolutionContext<T> implements IResolutionContext<T> {
    registration: ITypeRegistration<T>;
    history: Array<ITypeRegistration<any>>;
    owners: IDependencyOwners;
    constructor(registration: ITypeRegistration<T>);
}
