'use strict';

const InvocationContainer = require('./../dist/commonjs').InvocationContainer;
const container = new InvocationContainer({
  defaults: {
    conventionCalls: ['initialize', 'start'],
  },
});

class TestClass {
  initialize() {
    console.log('test init');
  }

  start() {
    console.log('test start');

  }
}

class SecondClass {

  initialize() {
    console.log('second init');

  }

  start() {
    console.log('second start');

  }
}

// container.callByConvention('initialize', 'start');

container.register('Second', SecondClass);

container.register('Test', TestClass)
  .dependencies('Second');
  // .injectInState('Second', 'started');

// container.register('Test', TestClass)
//   .dependencies('SecondClass');
  // .callByConvention({
  //   initialize: {
  //     'Second': 'initialized'
  //   }
  // });

container.resolveAsync('Test').then((instance) => {
  console.log(instance);
});

// function async iterateOverResults(resolutionContext, conventionalCall) {
//   for (let instanceId in resolutionContext.instanceResolutionOrder) {
//     const instance = resolutionContext.instanceLookup[instanceId];
//     const invocationTarget = instance[conventionalCall];
//     await extensionHook(invocationTarget, instance);

//   }
// }