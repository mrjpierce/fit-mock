import { sign } from "crypto";

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
  private _mockedObject2: T;
  private _proxy: T;
  private _handler: ProxyHandler<T>;
  private _callSignatures: ICallSignature[];

  private _areArgsEqual(argsA, argsB) {
    if (argsA === argsB) return true;
    if (argsA == null || argsB == null) return false;
    if (argsA.length != argsB.length) return false;

    for (var i = 0; i < argsA.length; ++i) {
      if (argsA[i] !== argsB[i]) return false;
    }

    return true;
  }

  private _intercept(target: T, prop: string | number | symbol): any {
    console.log("intercept start");

    if(target[prop]) {
      return (...args: any[]) => {
        const correctSig = this._callSignatures.find((sig) => {
          console.log("prop: ", sig.prop, prop);
          console.log("args: ", sig.args, args);
          if(sig.prop === prop && this._areArgsEqual(sig.args, args)) {
            return true;
          }
        });

        if (correctSig) {
          console.log('has sig');
          return correctSig.returns;
        } else {
          console.log("target[prop]", target[prop]);
          return target[prop](...args);
        }
      }
    }
    // const args = 

    // const func = this._callSignatures.find((sig) => {
    //   if(sig.prop === prop) {
    //     return (...args: any[]) => {
    //       if(this._areArgsEqual(sig.args, args)) {
    //         return sig.returns;
    //       }

    //       return target[prop](...args);
    //     }
    //   }
    // });
    // if (func) {
    //   console.log('SUCCESS for ' + prop.toString());
    // }
  }

  private _scapeCallSignature<TResult>(call: Func<T, TResult>): ICallSignature {
    let scrapedProp;
    let scrapedArgs;
    const callProxy = new Proxy<T>(this._mockedObject2, { 
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
    this._mockedObject2 = new ctor(...args);
    this._callSignatures = [];
    this._handler = { get: (t, p) => this._intercept(t, p) };
    this._proxy = new Proxy<T>(this._mockedObject, this._handler);
  }

  public get object(): T {
    return this._proxy;
  }

  public setup<TResult>(call: Func<T, TResult>, returns: TResult): Mock<T> {
    // console.log("call: " + call);
    // console.log("call.toString(): " + call.toString());
    // console.log("call.length:     " + call.length);
    // console.log("call.caller:     " + call.caller);
    // console.log("call.arguments:  " + call.arguments);

    // this._intercepts.push(call);
   
    console.log('setup start');
    const callSignature = this._scapeCallSignature(call);
    callSignature.returns = returns;
    this._callSignatures.push(callSignature);
    console.log("-", callSignature);
    console.log('setup end');
    // call(this._proxy)
    
    // call(<any>{ 
    //   funcNumber(num) {
    //     console.log("got:", num);
    //   } 
    // })

    // call.call({ 
    //   funcNumber(num) {
    //     console.log("got:", num);
    //   } 
    // })

    // call(this.object);

    return this;
  }
}
