# Hello World

Let's start with the good old "Hello World" example - the IoC way.

## Start a new npm package

```
npm init
```

## Add classes

In order to check out what the addict-ioc does, let's create two classes: 

```javascript
export class Hello {
  constructor() {
    console.log('Hello');
  }
}
```

```javascript
export class World {
  constructor() {
    console.log('World');
  }
}
```

## Add a dependency

Now let's assume that the class `World` has a dependency on the class `Hello`.

When using dependency injection we need to decide where we want to get those dependencies injected.
The best practice for this is to use the constructor.

We should modify our `World` class to reflect that dependency like so:

```javascript
export class World {
  constructor(hello) {
    console.log('World');
  }
}
```

## Declare the registrations

Before we can use the IoC container to instantiate our classes, we need to create the container and register our classes to it.

```javascript
import {Hello} from './hello';
import {World} from './world';

import {Container} from 'addict-ioc';

// from now on, this is the only `new`-call you're gonna need :)
const container = new Container();

// register the `Hello` class
container.register('Hello', Hello);

// register the `World` class with a dependency on `Hello` 
container.register('World', World)
  .dependencies('Hello');
```

As you can see we declared 'World' to have a dependency on 'Hello'.

## Instantiate the world

Time for some magic! By calling `resolve` with the key `World`, we tell the IoC container to instantiate that class for us. If there are dependencies they will be resolved as well.

```javascript
// Remember we placed the log statements in the constructors?
// We can now see in which order the classes get instantiated
const world = container.resolve('World');
// Hello
// World
```

You can tell by the order of the log statements that the IoC container instantiated the class `Hello` first. This is because the `World` class depends on it. We need to have a `Hello` instance to supply it to the constructor of `World`.