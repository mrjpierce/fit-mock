import * as Fit from "./fit-mock";
import { TestClass } from "./test-utils";

describe("Integration Tests", () => {
  describe("constructor", () => {
    it("is of same type", () => {
      const testClassMock = new Fit.Mock(TestClass);

      expect(testClassMock.object instanceof TestClass).toBeTruthy();
    });

    it("passes through with no setup", () => {
      const testClassMock = new Fit.Mock(TestClass);

      expect(testClassMock.object.funcNumber(5)).toEqual(5);
    });

    it("provides unaltered error", () => {
      const testClassMock = new Fit.Mock(TestClass);

      expect(() => (testClassMock.object as any).funcNotExist(4))
        .toThrow(/funcNotExist is not a function/);
    });
  });

  describe(".setup", () => {
    it("hits the mocked function with setup", () => {
      const testClassMock = new Fit.Mock(TestClass);

      testClassMock
        .setup((x) => x.funcNumber(5), 7);

      expect(testClassMock.object.funcNumber(5)).toEqual(7);
    });

    it("ignores setup if func doesn't match", () => {
      const testClassMock = new Fit.Mock(TestClass);

      testClassMock
        .setup((x) => x.funcString("A"), "B");

      expect(testClassMock.object.funcNumber(5)).toEqual(5);
    });

    it("ignores setup if func arguments don't match", () => {
      const testClassMock = new Fit.Mock(TestClass);

      testClassMock
        .setup((x) => x.funcNumber(5), 7);

      expect(testClassMock.object.funcNumber(8)).toEqual(8);
    });
  });
});
