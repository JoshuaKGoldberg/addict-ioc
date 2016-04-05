# Addict IoC

## Basic Usage

### Import Package

```js
const container = require('addict-ioc');
```

### Dependency Injection

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

### Dependencies
tbd

### Configuration
tbd

### Singleton
tbd

### Targeted Injection
tbd

### Lazy Injection
tbd

### No Injection (Service Locator)
tbd
