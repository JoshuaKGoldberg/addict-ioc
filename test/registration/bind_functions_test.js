'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration With Function Binding Test', function describeCallback() {

  it('should configure registered type', function testCallback() {
    const key = 'test';
    container.register(key, TestType)
      .bindFunctions();

    should(container.registrations[key].settings.bindFunctions).equal(true);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.bindFunctions();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
