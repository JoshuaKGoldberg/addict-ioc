'use strict';

const Container = require('./../dist/commonjs').Container;

const container = new Container();

const TestType = class TestType {
};


container.register('1', TestType)
  .dependencies('2');
container.register('2', TestType)
  .dependencies('4');
container.register('3', TestType)
  .dependencies('2');
container.register('4', TestType)
  .dependencies('3');
container.register('5', TestType)
  .dependencies('1');

const dependencyResolutionOrder = [];
const missingDependencies = [];
const recursiveDependencyResolutionGraphs = [];

const registration = container.getRegistration('1');

container._orderDependencies(registration, dependencyResolutionOrder, missingDependencies, recursiveDependencyResolutionGraphs);

console.log(dependencyResolutionOrder);
