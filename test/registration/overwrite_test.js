'use strict';

const should = require('should');

const Container = require('./../../dist/commonjs').Container;

const container = new Container();

class TestType {}

describe('Type Registration with Overwrite Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type if dependency for overwritten key is declared', function testCallback() {
    const key = 'test';
    const secondKey = 'secondKey';

    const SecondType = class SecondType {};

    container.register(secondKey, SecondType);

    container.register(key, TestType)
      .dependencies(key)
      .overwrite(key, secondKey);

    should(container.registrations[key].settings.overwrittenKeys[key]).equal(secondKey);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.injectInto('testTarget');

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });

  it('should throw error if no dependency for overwritten key is declared ', function testCallback(next) {

    try {
      const key = 'test';
      const secondKey = 'secondKey';

      const SecondType = class SecondType {};

      container.register(secondKey, SecondType);

      container.register(key, TestType)
        .overwrite(key, secondKey);

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
