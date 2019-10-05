export type CtorWithArgs<T> = {
  new(...ctorArgs: any[]): T;
  prototype: Object;
}

export interface ICallSignature {
  prop: string | number | symbol;
  args: any[];
  returns?: any;
}

export type Func<T, TResult> = (x: T) => TResult;

export class Mock<T extends object> {
  private _mockedObject: T;
  private _scraperObject: T;
  private _proxy: T;
  private _handler: ProxyHandler<T>;
  private _callSignatures: ICallSignature[];

  private static _argsEqual(argsA: any[], argsB: any[]): boolean {
    if (argsA === argsB) return true;
    if (argsA == null || argsB == null) return false;
    if (argsA.length != argsB.length) return false;

    for (var i = 0; i < argsA.length; ++i) {
      if (argsA[i] !== argsB[i]) return false;
    }

    return true;
  }

  private _intercept(target: T, prop: string | number | symbol): any {
    return (...args: any[]) => {
      const correctSig = this._callSignatures.find((sig) => {
        if(sig.prop === prop && Mock._argsEqual(sig.args, args)) {
          return true;
        }
      });

      if (correctSig) {
        console.log("-intercept-", correctSig);
        return correctSig.returns;
      } else {
        console.log("-pass-though-", target[prop]);
        return target[prop](...args);
      }
    }
  }

  private _scapeCallSignature<TResult>(call: Func<T, TResult>): ICallSignature {
    let scrapedProp: string | number | symbol;
    let scrapedArgs: any[];

    const callProxy = new Proxy<T>(this._scraperObject, { 
      get(target, prop) {
        if(target[prop]) {
          scrapedProp = prop;
          return (...args: any[]) => {
            scrapedArgs = args;
          }
        }
      }
    });

    call(callProxy);

    return {
      prop: scrapedProp,
      args: scrapedArgs
    };
  }

  constructor(ctor: CtorWithArgs<T>, ...args: any[]) {
    this._mockedObject = new ctor(...args);
    this._scraperObject = new ctor(...args);
    this._callSignatures = [];
    this._handler = { 
      get: (target, prop) => { 
        if(target[prop]) {
          return this._intercept(target, prop); 
        }
      }
    };
    this._proxy = new Proxy<T>(this._mockedObject, this._handler);
  }

  public get object(): T {
    return this._proxy;
  }

  public setup<TResult>(call: Func<T, TResult>, returns?: TResult): Mock<T> {
    const callSignature = this._scapeCallSignature(call);
    callSignature.returns = returns;
    this._callSignatures.push(callSignature);
    console.log("-setup-", callSignature);

    return this;
  }
}
