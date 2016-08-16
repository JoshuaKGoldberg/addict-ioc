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

```js
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

```js
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
## Registration
The registration is the entry point to declare settings for a type registration on the container.

The `register` method is used to register classes on the container and creates a registration object on which other fluent methods are available to further specify the registration. If it somehow is missing before a fluent declaration, an error will be thrown.

```js
class SomeClass {}

container.register('SomeClassKeyName', SomeClass);
```

### As Factory Functions
The method `registerFactory` is used to register a factory function instead of an ES6 class as the instantiation point for a given key.

```js
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

```js
const object = {
  'this-could-be': 'virtually-anything'
}

container.registerObject('objectKey', object);
```

## Dependencies
The `dependencies` declaration adds dependencies that have to be resolved before the registered class gets instantiated.

```js
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

## Multiplicity
The `singleton` declaration determines whether the container instantiates a registered class once or every time it is requested.

### Transient
By default registrations are transient, causing any `dependencies` referencing the class to get a _`new instance`_ injected. A `lazy` dependency and the service locater (`resolve`) will also return a _`new instance`_ every time they are called.

```js
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

```js
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

## Targeted Injection
The `injectInto` declaration enables you to determine where `dependencies` declared for a registration get injected. The constructor of the registered class can then be used for other properties.

_Note: The `injectInto` declaration expects a `string`, not a reference to the target property or function._

### Into Property

```js
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

```js
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

```js
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

```js
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

```js
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

```js
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

```js
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
