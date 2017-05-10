'use strict';

const Container = require('./../dist/commonjs').Container;

const container = new Container();

const registrationSettings = [{
  key: 'Container',
  module: 'addict-ioc',
  isSingleton: true,
}];

container.importRegistrations(registrationSettings);

container.resolveAsync('Container')
  .then((instance) => {
    instance.register('something', class Test {});
  });

const instance = container.resolve('Container');


