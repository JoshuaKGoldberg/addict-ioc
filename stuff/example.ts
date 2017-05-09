import {IFactory} from 'addict-ioc';

export class LazySomething {}

export class LazyExample {

  private _injectionClassFactory: IFactory<LazySomething>;
  private _injectionClass: LazySomething;

  constructor(injectionClassFactory: IFactory<LazySomething>) {
    this._injectionClassFactory = injectionClassFactory; 
  }

  private get injectionClass(): LazySomething {
    if (!this._injectionClass) {
      this._injectionClass = this._injectionClassFactory();
    }
    return this._injectionClass;
  }


}



  private get datastoreService(): IDatastoreService {
    if (!this._datastoreService) {
      this._datastoreService = this._datastoreServiceFactory();
    }
    return this._datastoreService;
  }