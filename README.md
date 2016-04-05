
![logo](logo.png)

Addict IoC is a lightweight IoC container with a fluent declaration syntax easing your development and simplifying your code.

It is designed to be easily extensible for your own needs without complicating the architecture by abstractions.

## Basic Usage
### Import Package
The package exports a singleton container to be used all over your application.

The following example shows how you can override the default settings if needed and what the default settings are.

```js
const container = require('addict-ioc');

container.setDefaults({
  isSingleton: false,
  wantsInjection: true,
  isLazy: false
});
```

### Dependency Injection
For a regular dependency injection you just need to register one or more classes on the container. As soon as a class is registered, it can be referenced within another registrations `dependencies` declaration. When a class registered with dependencies gets instantiated by the container, its dependencies are injected into the constructor by default.

```js
container.register(SomeClass);

class SomeClass {}

container.register(SomeOtherClass);

class SomeOtherClass {}


container.register(YetAnotherClass)
  .dependencies(SomeClass, SomeOtherClass);

class YetAnotherClass {

  constructor(something, somethingOther) {
    this._someClass = something;
    this._someOtherClass = somethingOther;
  }
}
```

## Advanced Usage
### Registration
The registration is the entry point to declare settings for a type registration on the container.

The `register` method enables all other fluent declarations and needs to proceed them. If it somehow is missing before a fluent declaration, an error will be thrown.

#### By Type

```js
container.register(SomeClass);

class SomeClass {}
```

#### By Key

```js
container.register('SomeClassKeyName', SomeClass);

class SomeClass {}
```

### Dependencies
The `dependencies` declaration adds dependencies that have to be resolved before the registered class gets instantiated.

#### By Type

```js

container.register(SomeClass);

class SomeClass {}

container.register(YetAnotherClass)
  .dependencies(SomeClass);

class YetAnotherClass {

  constructor(something) {
    this._someClass = something;
  }
}
```

#### By Key

```js
container.register('SomeClassKeyName', SomeClass);

class SomeClass {}

container.register(SomeOtherClass);

class SomeOtherClass {}

container.register(YetAnotherClass)
  .dependencies('SomeClassKeyName', SomeOtherClass);


class YetAnotherClass {

  constructor(something, somethingOther) {
    this._someClass = something;
    this._someOtherClass = somethingOther;
  }
}
```

### Multiplicity
The `singleton` declaration determines whether the container instantiates a registration once or every time it is requested.

#### Transient
By default registrations are transient, causing any `dependencies` referencing the class to get a *`new instance`* injected. A `lazy` dependency and the service locater (`resolve`) will also return a *`new instance`* every time they are called.

```js
container.register(SomeClass);
  //.singleton(false); this can be configured explicitly as well

class SomeClass {}


container.register(SomeOtherClass)
  .dependencies(SomeClass, SomeClass);

class SomeOtherClass {

  constructor(something, alsoSomething) {
    console.log(something === alsoSomething); // "false"
  }
}
```

#### Singleton
The `singleton` declaration causes any `dependencies` referencing the class declared singleton to get the *`same instance`* injected. A `lazy` dependency and the service locater (`resolve`) will also return the *`same instance`* every time they are called.

```js
container.register(SomeClass)
  .singleton();
  //.singleton(true); this can be configured explicitly as well

class SomeClass {}


container.register(SomeOtherClass)
  .dependencies(SomeClass, SomeClass);

class SomeOtherClass {

  constructor(something, alsoSomething) {
    console.log(something === alsoSomething); // "true"
  }
}
```

### Targeted Injection
The `injectInto` declaration enables you to determine where `dependencies` declared for a registration get injected. The constructor of the registered class can then be used for other properties.

*Note: The `injectInto` declaration expects a `string`, not a reference to the target property or function.*

#### Property

```js
container.register(SomeClass);

class SomeClass {}


container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectInto('anyProperty');

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  set anyProperty(value) {
    this._someClass = value;
  }
}
```

#### Function

```js
container.register(SomeClass);

class SomeClass {}


container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectInto('anyFunction');

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  anyFunction(value) {
    this._someClass = value;
  }
}
```

### Lazy Injection
The `injectLazy` declaration allows you to determine the point in time a class gets instantiated yourself. The function injected resolves and injects all dependencies as configured. If a `config` function is declared for the registration, this function will then be executed as well.

```js
container.register(SomeClass);

class SomeClass {}


container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectInto('anyFunction');

class SomeOtherClass {

  constructor(someClassLazy) {
    this._someClassLazy = someClassLazy;
  }

  start() {
    const someClass = this._someClassLazy();
  }
}
```

### Configuration
The `configure` declaration allows you to set the `config` property of a class instantiated by the container.

#### Static configuration

```js
container.register(SomeClass);

class SomeClass {}


container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .config({aConfigValue: 'something'});

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
```

#### With Function Reference (defered)
As seen in the examle below, the `config` function gets executed when the registration it is declared for gets instantiated. In case this class gets injected lazy, the `config` function will not be executed until the lazy injection is resolved.

```js
container.register(SomeClass)
  .config(() => {
    console.log('config function executed');
    return { aConfigValue: 'something' }
  });

class SomeClass {

  get config() {
    return this._config;
  }

  set config(value) {
    this._config = value;
  }
}


container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .injectLazy();

class SomeOtherClass {

  constructor(someClassLazy) {
    this._someClassLazy = someClassLazy;
  }

  start() {
    const someClass = this._someClassLazy(); // config function executed
  }
}
```

### No Injection (Service Locator)
The `noInjection` declaration allows you to determine the point in time a class gets instantiated yourself.

```js
container.register(SomeClass);

class SomeClass {}


container.register(SomeOtherClass)
  .dependencies(SomeClass)
  .noInjection();

class SomeOtherClass {

  constructor(youCanUseThisParameterYourself) {
    this._somethingRegular = youCanUseThisParameterYourself;
  }

  start() {
    const someClass = container.resolve(SomeClass);
  }
}
```

## Possible future features
- Feature extension
  - Needs accessible extension hooks
  - Little abstraction to load other fluent elements and hook them into the container
