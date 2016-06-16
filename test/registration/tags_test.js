'use strict';

const should = require('should');

const container = require('./../../lib/container.js');

class TestType {}

describe('Type Registration With Tags Test', function describeCallback() {

  beforeEach(() => {
    container.clear();
  });

  it('should configure registered type', function testCallback() {
    const key = 'test';
    const tag1 = 'exampleTag1';
    const tag2 = 'exampleTag2';
    container.register(key, TestType)
      .tags(tag1, tag2);

    should(container.registrations[key].settings.tags[tag1]).not.be.undefined();
    should(container.registrations[key].settings.tags[tag2]).not.be.undefined();
  });

  it('should throw error if no registration is started', function testCallback(next) {

    try {
      container.tags();

    } catch (error) {
      should(error).not.be.null();
      next();
    }

  });
});
