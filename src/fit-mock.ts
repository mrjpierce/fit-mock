export interface ICtorWithArgs<T> {
  prototype: object;
  new(...ctorArgs: any[]): T;
}

export interface ICallSignature {
  args: any[];
  prop: string | number | symbol;
  returns?: any;
}

export type Func<T, TResult> = (x: T) => TResult;

export class Mock<T extends object> {

  get object(): T {
    return this._proxy;
  }

  private static _argsEqual(argsA: any[], argsB: any[]): boolean {
    if (argsA === argsB) { return true; }
    if (argsA === undefined || argsB === undefined) { return false; }
    if (argsA.length !== argsB.length) { return false; }

    for (let i = 0; i < argsA.length; i += 1) {
      if (argsA[i] !== argsB[i]) { return false; }
    }

    return true;
  }
  private readonly _callSignatures: ICallSignature[];
  private readonly _handler: ProxyHandler<T>;
  private readonly _mockedObject: T;
  private readonly _proxy: T;
  private readonly _scraperObject: T;

  constructor(ctor: ICtorWithArgs<T>, ...args: any[]) {
    this._mockedObject = new ctor(...args);
    this._scraperObject = new ctor(...args);
    this._callSignatures = [];
    this._handler = {
      get: (target, prop) => {
        if (target[prop]) {
          return this._intercept(target, prop);
        }
      },
    };
    this._proxy = new Proxy<T>(this._mockedObject, this._handler);
  }

  public setup<TResult>(call: Func<T, TResult>, returns?: TResult): Mock<T> {
    const callSignature = this._scapeCallSignature(call);
    callSignature.returns = returns;
    this._callSignatures.push(callSignature);
    console.log("-setup-", callSignature);

    return this;
  }

  private _intercept(target: T, prop: string | number | symbol): any {
    return (...args: any[]) => {
      const correctSig = this._callSignatures.find((sig) => {
        if (sig.prop === prop && Mock._argsEqual(sig.args, args)) {
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
    };
  }

  private _scapeCallSignature<TResult>(call: Func<T, TResult>): ICallSignature {
    let scrapedProp: string | number | symbol;
    let scrapedArgs: any[];

    const callProxy = new Proxy<T>(this._scraperObject, {
      get(target, prop) {
        if (target[prop]) {
          scrapedProp = prop;

          return (...args: any[]) => {
            scrapedArgs = args;
          };
        }
      },
    });

    call(callProxy);

    return {
      args: scrapedArgs,
      prop: scrapedProp,
    };
  }
}
