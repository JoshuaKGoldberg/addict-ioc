'use strict';

const should = require('should');

const container = require('./../../lib/container');

describe('Dependency Injection Container Get Property Descriptor Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should get property descriptor of derived class', function testCallback() {

    class BaseClass {
      get config() {
        return this._config;
      }
      set config(value) {
        this._config = value;
      }
    }

    class DerivedClass extends BaseClass {}

    const testKey = 'test';

    container.register(testKey, DerivedClass);

    const instance = container.resolve(testKey);

    const propertyDescriptor = container._getPropertyDescriptor(instance, 'config');

    should(propertyDescriptor).not.be.undefined();
  });

});
