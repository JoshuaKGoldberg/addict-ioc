'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

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
