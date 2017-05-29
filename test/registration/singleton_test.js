'use strict';

const should = require('should');

const Container = require('./../../dist/commonjs').Container;

const container = new Container();

class TestType {}

describe('Type Registration As Singleton Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type', function testCallback() {
    const key = 'test';
    container.register(key, TestType)
             .singleton();
    should(container.registrations[key].settings.isSingleton).equal(true);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.singleton();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
