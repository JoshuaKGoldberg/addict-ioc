'use strict';

const should = require('should');

const container = require('./../../../lib/container');

describe('Dependency Injection Container Bind Functions To Instance Test', function describeCallback() {


  it('should bind functions to instance', function testCallback() {

    const TestType = class TestType {
      constructor(testString) {
        this.testString = testString;
      }
      testMethod() {
        return this.testString;
      }
    };
    const testString = 'this should work';

    const instance = new TestType(testString);

    container._bindFunctionsToInstance(instance);

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

    const TestType = class TestType {
      constructor(testString) {
        this.testString = testString;
      }
      testMethod() {
        return this.testString;
      }
    };
    const testString = 'this should not work';

    const instance = new TestType(testString);

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
});
