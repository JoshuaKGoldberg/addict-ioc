'use strict';

const should = require('should');

const Container = require('./../../dist/commonjs').Container;

const container = new Container();

class TestType {}

describe.skip('Type Registration With Subscription Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type', function testCallback() {
    const key = 'test';
    const subscriptionKey = 'anyKey';
    const subscriptionFunction = 'aFunction';
    container.register(key, TestType)
      .onNewInstance(subscriptionKey, subscriptionFunction);

    const subscription = container.registrations[key].settings.subscriptions.newInstance[0];

    should(subscription.key).equal(subscriptionKey);
    should(subscription.method).equal(subscriptionFunction);
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.onNewInstance('anyKey', 'anyFunction');

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
