# Addict IoC
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
tbd

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
tbd

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
tbd

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

### Configuration
tbd

#### Static configuration
tbd

#### With Function Reference (defered)
tbd

### Multiplicity
tbd

#### Transient
tbd

#### Singleton
tbd

### Targeted Injection
tbd

#### Property
tbd

#### Function
tbd

### Lazy Injection
tbd

### No Injection (Service Locator)
tbd
