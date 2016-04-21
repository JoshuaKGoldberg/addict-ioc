'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration Register Test', function describeCallback() {

  it('should register type for key', function testCallback() {
    const key = 'test';
    container.register(key, TestType);
    should(container.registrations[key]).not.be.null();
    should(container.registrations[key].settings.key).equal(key);
    should(container.registrations[key].settings.type).equal(TestType);
  });

  it('should register type', function testCallback() {
    container.register(TestType);
    should(container.registrations[TestType]).not.be.null();
    should(container.registrations[TestType].settings.key).equal(TestType);
    should(container.registrations[TestType].settings.type).equal(TestType);
  });

  it('should throw error if key for type is not a string', function testCallback(next) {

    try {
      container.register(() => 'should not work', TestType);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if type is registered with second argument', function testCallback(next) {

    try {
      container.register(TestType, TestType);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if registration key is not set', function testCallback(next) {

    try {
      container.register(null, TestType);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if registration type is not set', function testCallback(next) {

    try {
      container.register('anyKey', null);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
