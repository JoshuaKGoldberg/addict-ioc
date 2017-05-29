'use strict';

class TestClass {

  constructor(a, b) {

    console.log('test created');
    console.log(a);
    console.log(b);
  }
  initialize() {
    console.log('test init');
  }

  start() {
    console.log('test start');

  }

}

class SecondClass {

  constructor() {

    console.log('second created');
  }
  initialize() {
    console.log('second init');

  }

  start() {
    console.log('second start');

  }

}

class ThirdClass {

  constructor() {

    console.log('third created');
  }
  initialize() {
    console.log('third init');

  }

  start() {
    console.log('third start');

  }

}

class FourthClass {

  constructor() {

    console.log('fourth created');
  }

  initialize() {
    console.log('fourth init');

  }

  start() {
    console.log('fourth start');

  }

}

// container.callByConvention('initialize', 'start');


const InvocationContainer = require('./../dist/commonjs').InvocationContainer;

const container = new InvocationContainer({
  defaults: {
    conventionCalls: ['initialize', 'start'],
  },
});


container.register('Second', SecondClass)
  .dependencies('Third');
container.register('Third', ThirdClass)
  .dependencies('Fourth');
container.register('Fourth', FourthClass)
  .singleton();

container.register('Test', TestClass)
  .dependencies('Second', 'Fourth');
  // .injectInState('Second', 'started');

// container.register('Test', TestClass)
//   .dependencies('SecondClass');
  // .callByConvention({
  //   initialize: {
  //     'Second': 'initialized'
  //   }
  // });


// container.resolveAsync('Test').then((instance) => {
//   console.log(instance);
// });


const bla = container.resolve('Test');

container.validateDependencies();

// function async iterateOverResults(resolutionContext, conventionalCall) {
//   for (let instanceId in resolutionContext.instanceResolutionOrder) {
//     const instance = resolutionContext.instanceLookup[instanceId];
//     const invocationTarget = instance[conventionalCall];
//     await extensionHook(invocationTarget, instance);

//   }
// }
