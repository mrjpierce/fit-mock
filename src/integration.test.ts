import { TestClass } from "./test-utils";
import * as Fit from "./fit-mock";

describe('Integration Tests', () => {
  describe('Mocking', () => {
    it('is of same type', () => {
      const testClassMock = new Fit.Mock(TestClass);

      expect(testClassMock.object instanceof TestClass).toBeTruthy();
    });
  });

  describe('Setup', () => {
    it('passes through with no setup', () => {
      const testClassMock = new Fit.Mock(TestClass);

      expect(testClassMock.object.funcNumber(5)).toEqual(5)
    });

    it.only('hits the mocked function with setup', () => {
      const testClassMock = new Fit.Mock(TestClass);

      testClassMock
        .setup(x => { 
          console.log("setup:", x); 
          return x.funcNumber(5); 
        }, 7);

      expect(testClassMock.object.funcNumber(5)).toEqual(7);
      expect(testClassMock.object.funcNumber(5)).toEqual(7);
      expect(testClassMock.object.funcNumber(6)).toEqual(6);
    });
  });

  it('', () => {
    
  });
});
