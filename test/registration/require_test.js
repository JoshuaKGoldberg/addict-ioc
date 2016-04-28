'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration Require Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should register type for key', function testCallback() {
    const key = 'test';
    container.require(key);
    should(container.registrations[key]).not.be.null();
    should(container.registrations[key].settings.key).equal(key);
    should(container.registrations[key].settings.type).equal(key);
    should(container.registrations[key].settings.isRequire).be.true();
  });

  it('should register type for key with alias', function testCallback() {
    const key = 'test';
    const alias = 'alias';
    container.require(key).as(alias);
    should(container.registrations[alias]).not.be.null();
    should(container.registrations[alias].settings.key).equal(alias);
    should(container.registrations[alias].settings.type).equal(key);
    should(container.registrations[alias].settings.isRequire).be.true();
  });

  it('should throw error if key for type is not a string', function testCallback(next) {

    try {
      container.require(() => 'should not work', TestType);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if registration key is not set', function testCallback(next) {

    try {
      container.require(null);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
