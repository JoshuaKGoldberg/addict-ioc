![logo](logo.png)

Addict IoC is a lightweight IoC container with a fluent declaration syntax easing your development and simplifying your code.

It is designed to be easily extensible for your own needs without complicating the architecture by abstractions.

[![Build Status](https://jenkins.mindassist.net/job/Addict.IoC/badge/icon)](https://jenkins.mindassist.net/job/Addict.IoC/?style=plastic)

# Features

```
* Fluent Declaration Syntax
* Fully covered by Unit Tests
* Written in Vanilla ES6 JavaScript
  * Lightweight
  * Well structured, easily understandable code
  * Without external dependencies
* Dependency Injection into
  * Constructor
  * Properties
  * Methods
* Discovery by Tags and Key/Value Matching
* Singleton or Transient Instantiation
* Injection with lazy instantiation
* Support for factory functions
* Circular Dependency Detection
* Configuration Injection
* Subscribe to instances created before they get injected
* Optional auto-bind methods (e.g.: EventHandler) to instance
* Validation of registered dependencies
* Service Locator
```

# Basic Usage

## Import Package

The package exports a singleton container to be used all over your application.

The following example shows how you can override the default settings if needed and what the default settings are.

```javascript
const container = require('addict-ioc');

container.setDefaults({
  isSingleton: false,
  wantsInjection: true,
  isLazy: false,
  bindFunctions: false,
  autoCreateMissingSubscribers: true
});
```

## Dependency Injection

For a regular dependency injection you just need to register one or more classes on the container. As soon as a class is registered, it can be referenced within another registrations `dependencies` declaration. When a class registered with dependencies gets instantiated by the container, its dependencies are injected into the constructor by default.

```javascript
class SomeClass {}

container.register('First', SomeClass);

class SomeOtherClass {}

container.register('Second', SomeOtherClass);

class YetAnotherClass {

  constructor(some, someOther) {
    this._someClass = some;
    this._someOtherClass = someOther;
  }
}

container.register('Third', YetAnotherClass)
  .dependencies('First', 'Second');

const yetAnotherClassInstance = container.resolve('Third');
// now the constructor has been called with the two dependency instances
// the instances of 'First' and 'Second' are created before the 'Third' instance
```

# Advanced Usage

## Patterns

### IoC Module

Since the IoC container is used to decouple your application, it is not favorable to use the container all over your application by directly referencing it via an import.

Consider the following example of the file test_class.js as an `ANTI`-pattern:

```javascript
const container = require('addict-ioc');

class TestClass {
// ...  
}

container.register('TestClass', TestClass);

module.exports = TestClass;
```

Let's consider a more modular approach where your application consists of several self-contained modules. Each of the modules should know how the dependencies of its inner classes interact and which external dependencies it has.

Now if we take a closer look at those external dependencies, the self-contained module needs a way to reference its external dependencies so that the external dependency itself can load its dependencies the same way (yep we're building a dependency tree here).

The easiest way to achieve this is to let each self-contained module expose a function that takes the container instance used for registration as a parameter and registers all dependencies on that instance.

modules/user/ioc_module.js

```javascript

function registerInContainer(container) {

  const ItemIocModule = require('item/ioc_module');

  ItemIocModule.registerInContainer(container);


  container.register('UserRepository')
    .singleton();

  container.register('UserService')
    .dependencies('UserRepository', 'ItemService')
    .singleton();

}

module.exports.registerInContainer = registerInContainer;
```

The following folder structure shows how functional modules can consist of several layers, in this case `service` and `repository` layers. Every module defines its dependencies via an `ioc_module.js` and can reference other modules' ioc modules as well like in the above example.

- modules

  - user

    - modules

      - user_service

        - lib

          - user_service.js

      - user_repository

        - lib

          - user_repository.js

    - index.js
    - ioc_module.js
    - package.json

  - item

    - modules

      - ...

    - index.js
    - ioc_module.js
    - package.json

- index.js
- ioc_module.js
- package.json

## Registration

The registration is the entry point to declare settings for a type registration on the container.

The `register` method is used to register classes on the container and creates a registration object on which other fluent methods are available to further specify the registration. If it somehow is missing before a fluent declaration, an error will be thrown.

_Note: The IoC container registers itself to the key `container` by default. You can adjust this by setting `container.config.injectContainerKey` to whatever key you'd like and calling the method `clear` afterwards (this also clears all registrations so you best do it before registering your components)._

```javascript
class SomeClass {}

container.register('SomeClassKeyName', SomeClass);
```

### As Factory Functions

The method `registerFactory` is used to register a factory function instead of an ES6 class as the instantiation point for a given key.

```javascript
const factory = (something) => {
  return {
    logIt: () => {
      console.log(something);
    }
  }
}

container.registerFactory('factoryKey', factory);
```

### As Static Object

In cases where you don't need the container to instantiate something, e.g. when you use an external singleton instance or decide to create the instance yourself, you can register the resulting object directly to the container.

```javascript
const object = {
  'this-could-be': 'virtually-anything'
}

container.registerObject('objectKey', object);
```

## Discovery

Since our main goals when using an IoC container are to decouple our applications components and establish clear patterns in our architecture, we should embrace that thought and use extension points in our application.

In this case extension points mean we have a component that uses the container to instantiate other components itself. Now if we want to decouple such a component from the components it instantiates, we need some kind of discovery, because otherwise we would need to reference those components the old fashioned way.

So for the discovery to work we need something to discover things by. Names would be one option, but not a very specific one and therefore likely to produce errors. The IoC container offers a fluent declaration to attach `tags` to registrations. These tags are just strings, but they are solely used for discovery and will not get mixed with registration keys.

```javascript
class TestClass {}

container.registerObject('TestClass', TestClass)
  .tags('discover-me');

class AnotherTestClass {}

container.registerObject('AnotherTestClass', AnotherTestClass)
  .tags('discover-me');
```

Both of our test classes are tagged with the same string `discover-me`. Now let's take a look at how to discover them:

```javascript

const discoveredKeys = container.getKeysByTags('discover-me');

console.log(discoveredKeys);
// 'TestClass'
// 'AnotherTestClass'
```

By calling the `getKeysByTags`-method we can retrieve all keys tagged with what we are looking for.

A real world example to this would be an express API that can discover router implementations this way, instantiate them and hook them up to the API.

### Attributes

For advanced discovery scenarios you can also use tags as key/value stores that can be used to match against.

With the fluent declaration `setAttribute` you can assign values to tags. On the container you can use the `getKeysByAttributes`-method to retrieve all keys that match the attributes object you supply.

Values can be any object and will be matched for full equality (===) by default.

```javascript

class TestType {}

container.register('TestType', TestType)
  .setAttribute('someTag', 'someValue')
  .setAttribute('someOtherTag', {
    'some-complex': 'value'
  });

container.getKeysByAttributes({
  someTag: 'someValue'
});
// ['TestType']

container.getKeysByAttributes({
  someTag: 'someValue',
  someOtherTag: {
    'some-complex': 'value'
  }
});
// ['TestType']

container.getKeysByAttributes({
  aMissingTag: 'this-will-not-match',
  someOtherTag: {
    'some-complex': 'value'
  }
});
// []

```

As mentioned before the fluent declaration `setAttribute` uses tags to store the values used for matching.
That means you can not only match against attributes with the method `getKeysByAttributes`, but also with the method `getKeysByTags`. It only matches the names of the tags, not their values.

```javascript

class TestType {}

container.register('TestType', TestType)
  .setAttribute('someTag', 'someValue')
  .setAttribute('someOtherTag', {
    'some-complex': 'value'
  });

container.getKeysByTags('someTag');
// ['TestType']

container.getKeysByTags('someTag', 'someOtherTag');
// ['TestType']

container.getKeysByTags('someMissingTag', 'someTag');
// []

```

## Dependencies

The `dependencies` declaration adds dependencies that have to be resolved before the registered class gets instantiated.

```javascript
class SomeClass {}

container.register('SomeClassKeyName', SomeClass);

class SomeOtherClass {}

container.register('SomeOtherClassKeyName', SomeOtherClass);

class YetAnotherClass {

  constructor(something, somethingOther) {
    this._someClass = something;
    this._someOtherClass = somethingOther;
  }
}

container.register(YetAnotherClass)
  .dependencies('SomeClassKeyName', 'SomeOtherClassKeyName');
```

### Overwrite

In special cases you might want to overwrite a registration without side effects to other registrations. For this scenario the IoC container offers the fluent declaration `overwrite`. You can use this multiple times on the same registration, once for every overwritten key. If you overwrite a key that means that if a dependency with the key you overwrite is to be resolved, instead of taking the original key to resolve the dependency, the overwritten key is used.

```javascript
class SomeClass {}

container.register('SomeClassKeyName', SomeClass);

class SomeOtherClass {}

container.register('SomeOtherClassKeyName', SomeOtherClass);

class YetAnotherClass {}

container.register('YetAnotherClassKeyName', YetAnotherClass)
  .dependencies('SomeClassKeyName')
  .overwrite('SomeClassKeyName', 'SomeOtherClassKeyName');
```

In this example you can see that we have declared the dependency on `SomeClassKeyName`, but overwrite it with `SomeOtherClassKeyName`. So when `YetAnotherClass` is instantiated, no instance of `SomeClass` gets instantiated as a dependency. Currently this only applies to dependencies directly declared on the registration containing the overwritten keys. In the future this might be extended to support the `overwrite`-feature for the whole dependency tree.

## Multiplicity

The `singleton` declaration determines whether the container instantiates a registered class once or every time it is requested.

### Transient

By default registrations are transient, causing any `dependencies` referencing the class to get a _`new instance`_ injected. A `lazy` dependency and the service locater (`resolve`) will also return a _`new instance`_ every time they are called.

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass);
  //.singleton(false); this can be configured explicitly as well

class SomeOtherClass {

  constructor(something, alsoSomething) {
    console.log(something === alsoSomething); // "false"
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey', 'SomeClassKey');
```

### Singleton

The `singleton` declaration causes any `dependencies` referencing the class declared singleton to get the _`same instance`_ injected. A `lazy` dependency and the service locater (`resolve`) will also return the _`same instance`_ every time they are called.

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass)
  .singleton();
  //.singleton(true); this can be configured explicitly as well

class SomeOtherClass {

  constructor(something, alsoSomething) {
    console.log(something === alsoSomething); // "true"
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey', 'SomeClassKey');
```

## Bind Functions to Instance

When you want to use a class instance as an event handler you might notice that by default ES6 class functions have no bound this context when referencing them. So if you want to use them like in the following example, you'll get an error because `this` is undefined.

```javascript
class TestType {
  constructor() {
    this.testString = 'this-is-a-test';
  }
  testMethod() {
    console.log(this.testString);
  }
};

const testType = new TestType();

const testFunction = (handlerFunction) => {
  return handlerFunction();
};

testFunction(testType.testMethod);
// TypeError: Cannot read property 'testString' of undefined
```

This is a common problem when passing handler functions. Normally you would simply alter the previous example.

```javascript
testFunction(testType.testMethod.bind(testType));
```

But if you got multiple of these it can be quite cumbersome to do this for every handler function. The IoC container exposes the fluent declaration `bindFunctions` to help out with this. If called `without parameters` it binds `all methods` of the class to the class itself so that you don't have to do manual binding. If you don't want all methods of the class to be bound you can supply the methods you'd like to bind as `string parameters` to `bindFunctions`.

```javascript
class TestType {
  constructor() {
    this.testString = 'this-is-a-test';
  }
  methodOne() {
    console.log(this.testString);
  }
  methodTwo() {
    console.log(this.testString);
  }
  methodThree() {    
    console.log(this.testString);
  }
}

container.register('TestType', TestType)
  .bindFunctions('methodOne', 'methodThree');

const testType = container.resolve('TestType');

const testFunction = (handlerFunction) => {
  return handlerFunction();
};

testFunction(testType.methodOne);
// 'this-is-a-test'
testFunction(testType.methodThree);
// 'this-is-a-test'
testFunction(testType.methodTwo);
// TypeError: Cannot read property 'testString' of undefined
```

## Targeted Injection

The `injectInto` declaration enables you to determine where `dependencies` declared for a registration get injected. The constructor of the registered class can then be used for other properties.

_Note: The `injectInto` declaration expects a `string`, not a reference to the target property or function._

### Into Property

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass);

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  set anyProperty(value) {
    this._someClass = value;
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey')
  .injectInto('anyProperty');
```

### Into Function

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass);

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  anyFunction(value) {
    this._someClass = value;
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey')
  .injectInto('anyFunction');
```

## Lazy Injection

The `injectLazy` declaration allows you to determine the point in time a class gets instantiated yourself. The function injected resolves and injects all dependencies as configured. If a `config` function is declared for the registration, this function will then be executed as well.

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass);

class SomeOtherClass {

  constructor(someClassLazy) {
    this._someClassLazy = someClassLazy;
  }

  start() {
    const someClass = this._someClassLazy();
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey')
  .injectLazy();
```

## Subscribe to instance creation

The `onNewInstance` declaration allows you to invoke a method of your choice every time an instance of a given type is created. The method call will happen before the instance is injected as a dependency. This enables you to perform operations with and on any instance before it is released for further use as a dependency.

```javascript
class FirstType {}

container.register('first', FirstType);

class SecondType {
  newFirstTypeCreated(firstTypeInstance) {
    console.log('test');
  }
}

container.register('second', SecondType)
  .onNewInstance('first', 'newFirstTypeCreated');

container.resolve('first');
container.resolve('first');
// test
// test
```

## Configuration

The `configure` declaration allows you to set the `config` property of a class instantiated by the container.

### Static configuration

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass);

class SomeOtherClass {

  constructor(someClass) {
    this._someClass = someClass;
  }

  set config(value) {
    this._config = value;
  }

  start() {
    console.log(this._config.aConfigValue); // something
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey')
  .config({aConfigValue: 'something'});
```

### With Function Reference (defered)

As seen in the examle below, the `config` function gets executed when the registered class it is declared for gets instantiated. In case this class gets injected lazy, the `config` function will not be executed until the lazy injection is resolved.

```javascript
class SomeClass {

  get config() {
    return this._config;
  }

  set config(value) {
    this._config = value;
  }
}

container.register('SomeClassKey', SomeClass)
  .config(() => {
    console.log('config function executed');
    return { aConfigValue: 'something' }
  });

class SomeOtherClass {

  constructor(someClassLazy) {
    this._someClassLazy = someClassLazy;
  }

  start() {
    const someClass = this._someClassLazy(); // config function executed
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey')
  .injectLazy();
```

## No Injection (Service Locator)

The `noInjection` declaration allows you to determine the point in time a class gets instantiated yourself.

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass);

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  start() {
    const someClass = container.resolve('SomeClassKey');
  }
}

container.register('SomeOtherClassKey', SomeOtherClass)
  .dependencies('SomeClassKey')
  .noInjection();
```

## Validation

Before you start an application that uses the IoC container you typically want to be sure that you declared all the dependencies correctly so that you won't get nasty errors during runtime. For this the IoC container exposes the validation method `validateDependencies`.

You can call it either without parameters to validate all dependencies or use a single string or an array of strings to validate just the given keys.

```javascript
class SomeClass {}

container.register('SomeClassKey', SomeClass)
  .dependencies('SomeMissingRegistrationKey');

try {

  container.validateDependencies();

} catch(error) {

  // this will throw because there is a dependency missing
}
```

The method will throw an error if the validation fails, but it won't stop the validation on the first error so that you can get all validation errors in a single run. The error description will contain a list of all the validation errors.
