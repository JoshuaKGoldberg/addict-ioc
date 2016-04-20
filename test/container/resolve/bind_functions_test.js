'use strict';

const should = require('should');

const container = require('./../../../lib/container');

describe('Dependency Injection Container Bind Functions To Instance Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should bind functions to instance', function testCallback() {

    const testString = 'this should not work';

    const TestType = class TestType {
      constructor() {
        this.testString = testString;
      }
      testMethod() {
        return this.testString;
      }
    };

    container.register(TestType)
      .bindFunctions();

    const instance = container.resolve(TestType);

    const testFunction = (paramFunction) => {
      return paramFunction();
    };

    const resultString = testFunction(instance.testMethod);

    should(resultString).equal(testString);
  });

  it('should throw error with unbound functions', function testCallback(next) {

    // This test is not ensuring the correct behavior of the actual IoC container
    // It is meant to ensure, that the implementation of this declaration is still needed
    //
    // This is due to a possible official implementation in the future ES7 proposal
    // as this is a shortcoming of the ES6 class implementation

    const testString = 'this should not work';

    const TestType = class TestType {
      constructor() {
        this.testString = testString;
      }
      testMethod() {
        return this.testString;
      }
    };

    container.register(TestType);

    const instance = container.resolve(TestType);

    const testFunction = (paramFunction) => {
      return paramFunction();
    };

    try {
      const resultString = testFunction(instance.testMethod);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should only bind defined functions if explicitly declared', function testCallback(next) {

    const testString = 'this should not work';

    const TestType = class TestType {
      constructor() {
        this.testString = testString;
      }
      testMethod() {
        return this.testString;
      }
      secondTestMethod() {
        return this.testString;
      }
      thirdTestMethod() {
        return this.testString;
      }
    };

    container.register(TestType)
      .bindFunctions('testMethod', 'thirdTestMethod');

    const instance = container.resolve(TestType);

    const testFunction = (paramFunction) => {
      return paramFunction();
    };

    const firstValidResultString = testFunction(instance.testMethod);
    const secondValidResultString = testFunction(instance.thirdTestMethod);

    should(firstValidResultString).equal(testString);
    should(secondValidResultString).equal(testString);

    try {
      const failingResultString = testFunction(instance.secondTestMethod);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
