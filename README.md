![logo](logo.png)

Addict IoC is a lightweight IoC container with a fluent declaration syntax easing your development and simplifying your code.

It is designed to be easily extensible for your own needs without complicating the architecture by abstractions.

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
  autoCreateMissingSubscribers: true,
  autoCreateMissingRegistrations: false
});
```

## Dependency Injection
For a regular dependency injection you just need to register one or more classes on the container. As soon as a class is registered, it can be referenced within another registrations `dependencies` declaration. When a class registered with dependencies gets instantiated by the container, its dependencies are injected into the constructor by default.

```js
class SomeClass {}

container.register(SomeClass);

class SomeOtherClass {}

container.register(SomeOtherClass);

class YetAnotherClass {

  constructor(something, somethingOther) {
    this._someClass = something;
    this._someOtherClass = somethingOther;
  }
}

container.register(YetAnotherClass)
  .dependencies(SomeClass, SomeOtherClass);
```

# Advanced Usage
## Registration
The registration is the entry point to declare settings for a type registration on the container.

The `register` method enables all other fluent declarations and needs to proceed them. If it somehow is missing before a fluent declaration, an error will be thrown.

### By Type

```js
class SomeClass {}

container.register(SomeClass);
```

### By Key

```js
class SomeClass {}

container.register('SomeClassKeyName', SomeClass);
```

### As Factory Functions
The method `registerFactory` is used to register a factory function instead of an ES6 class as the instantiation point for a given key.

```js
const key = 'test';
const factory = (something) => {
  return {
    logIt: () => {
      console.log(something);
    }
  }
}

container.registerFactory(key, factory);
```

## Dependencies
The `dependencies` declaration adds dependencies that have to be resolved before the registered class gets instantiated.

### By Type

```js
class SomeClass {}

container.register(SomeClass);

class YetAnotherClass {

  constructor(something) {
    this._someClass = something;
  }
}

container.register(YetAnotherClass)
  .dependencies(SomeClass);
```

### By Key

```js
class SomeClass {}

container.register('SomeClassKeyName', SomeClass);

class SomeOtherClass {}

container.register(SomeOtherClass);

class YetAnotherClass {

  constructor(something, somethingOther) {
    this._someClass = something;
    this._someOtherClass = somethingOther;
  }
}

container.register(YetAnotherClass)
  .dependencies('SomeClassKeyName', SomeOtherClass);
```

## Multiplicity
The `singleton` declaration determines whether the container instantiates a registered class once or every time it is requested.

### Transient
By default registrations are transient, causing any `dependencies` referencing the class to get a _`new instance`_ injected. A `lazy` dependency and the service locater (`resolve`) will also return a _`new instance`_ every time they are called.

```js
class SomeClass {}

container.register(SomeClass);
  //.singleton(false); this can be configured explicitly as well

class SomeOtherClass {

  constructor(something, alsoSomething) {
    console.log(something === alsoSomething); // "false"
  }
}

container.register(SomeOtherClass)
  .dependencies(SomeClass, SomeClass);
```

### Singleton
The `singleton` declaration causes any `dependencies` referencing the class declared singleton to get the _`same instance`_ injected. A `lazy` dependency and the service locater (`resolve`) will also return the _`same instance`_ every time they are called.

```js
class SomeClass {}

container.register(SomeClass)
  .singleton();
  //.singleton(true); this can be configured explicitly as well

class SomeOtherClass {

  constructor(something, alsoSomething) {
    console.log(something === alsoSomething); // "true"
  }
}

container.register(SomeOtherClass)
  .dependencies(SomeClass, SomeClass);
```

## Targeted Injection
The `injectInto` declaration enables you to determine where `dependencies` declared for a registration get injected. The constructor of the registered class can then be used for other properties.

_Note: The `injectInto` declaration expects a `string`, not a reference to the target property or function._

### Property

```js
class SomeClass {}

container.register(SomeClass);

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  set anyProperty(value) {
    this._someClass = value;
  }
}

container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectInto('anyProperty');
```

### Function

```js
class SomeClass {}

container.register(SomeClass);

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  anyFunction(value) {
    this._someClass = value;
  }
}

container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectInto('anyFunction');
```

## Lazy Injection
The `injectLazy` declaration allows you to determine the point in time a class gets instantiated yourself. The function injected resolves and injects all dependencies as configured. If a `config` function is declared for the registration, this function will then be executed as well.

```js
class SomeClass {}

container.register(SomeClass);

class SomeOtherClass {

  constructor(someClassLazy) {
    this._someClassLazy = someClassLazy;
  }

  start() {
    const someClass = this._someClassLazy();
  }
}

container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectLazy();
```

## Subscribe to instance creation
The `onNewInstance` declaration allows you to invoke a method of your choice every time an instance of a given type is created. The method call will happen before the instance is injected as a dependency. This enables you to perform operations with and on any instance before it is released for further use as a dependency.

```js
class FirstType {}

container.register(FirstType);

class SecondType {
  newFirstTypeCreated(firstTypeInstance) {
    console.log('test');
  }
}

container.register(SecondType)
  .onNewInstance(FirstType, 'newFirstTypeCreated');

container.resolve(FirstType);
container.resolve(FirstType);
// test
// test
```

## Configuration
The `configure` declaration allows you to set the `config` property of a class instantiated by the container.

### Static configuration

```js
class SomeClass {}

container.register(SomeClass);

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

container.register(SomeOtherClass)
  .dependencies(SomeClass)
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

container.register(SomeClass)
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

container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectLazy();
```

## No Injection (Service Locator)
The `noInjection` declaration allows you to determine the point in time a class gets instantiated yourself.

```js
class SomeClass {}

container.register(SomeClass);

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  start() {
    const someClass = container.resolve(SomeClass);
  }
}

container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .noInjection();
```
