'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

describe('Type Registration With Factory Test', function describeCallback() {

  it('should register factory function for key', function testCallback() {
    const key = 'test';
    const factory = (something) => {
      return {
        logIt: () => {
          console.log(something);
        }
      }
    }

    container.registerFactory(key, factory);
    should(container.registrations[key]).not.be.null();
    should(container.registrations[key].settings.key).equal(key);
    should(container.registrations[key].settings.type).equal(factory);
    should(container.registrations[key].settings.isFactory).equal(true);
  });

  it('should throw error if key for factory is not a string', function testCallback(next) {

    const factory = (something) => {
      return {
        logIt: () => {
          console.log(something);
        }
      }
    }

    try {
      container.registerFactory(() => 'should not work', factory);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
