'use strict';

const Container = require('./../dist/commonjs').Container;
const container = new Container();

const registrationSettings = [{
  key: 'Container',
  module: 'addict-ioc',
  isSingleton: true,
}];

const template = container.createRegistrationTemplate(registrationSettings[0]);

template.register()

container.importRegistrations(registrationSettings);

const template = container.registerModule('addict-ioc');
  .register('Container', Container)
  .singleton();

container.resolveAsync('Container')
  .then((instance) => {
    instance.register('something', class Test {});
  });

const instance = container.resolve('Container');


