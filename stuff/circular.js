'use strict';

const Container = require('./../dist/commonjs').Container;
const container = new Container();

const key = 'test';

const SecondType = class SecondType {};

container.register(key, SecondType)
  .dependencies(key);

try {
  container.validateDependencies(key);

} catch (error) {
  should(error).not.be.null();
  next();
}


