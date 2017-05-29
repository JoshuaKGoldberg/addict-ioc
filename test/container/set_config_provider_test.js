'use strict';

const should = require('should');

const Container = require('./../../dist/commonjs').Container;

const container = new Container();

class TestType {}

describe('Dependency Injection Container Set Config Provider Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should set valid config provider', function testCallback() {
    const testConfig = {
      test: '1'
    };
    const testConfigProvider = () => {
      return testConfig;
    };

    container.setConfigProvider(testConfigProvider);

    const returnedConfig = container.externalConfigProvider();

    should(returnedConfig).equal(testConfig);
  });

  it('should throw error on invalid config provider', function testCallback(next) {

    const invalidConfigProvider = {
      something: 'false'
    };

    try {

      container.setConfigProvider(invalidConfigProvider);

    } catch (error) {
      should(error).not.be.null();
      next();
    }
  });
});
