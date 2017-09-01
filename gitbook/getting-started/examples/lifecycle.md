# Lifecycle

You're likely to end up with quite some classes after some time developing a project.

What gave me a headache more than once for sure is the need to `initialize` things in the right order all over the application. Especially when things get asynchronously it can get really nasty.

That's where a lifecycle hook can make your life easier.

## The problem

Let's assume a little complex dependency graph:
```
A -> B -> D -> E
A -> C -> D
     C -> E
```

This reads as `A has a dependency on B`, `B has a dependency on D`, and so on...

The correct order of instantiation for this dependency graph (beginning with the first instantiation) would be:
```
E -> D -> C -> B -> A
```

In this case we might try something like this for initialization:

```javascript
export class D {
  constructor(e) {
    this.e = e;
  }
  initialize() {
    this.e.initialize();
  }
}
```

Looks fine you say? Ok, but then we might do this as well:

```javascript
export class C {
  constructor(d, e) {
    this.d = d;
    this.e = e;
  }
  initialize() {
    this.d.initialize();
    this.e.initialize();
  }
}
```

Now we've got a problem.

`C` should not be aware of `D` also having a dependency on `E`.

Because of that it naively calls `initialize` on both of its dependencies. As a result the `initialize` method of `E` would be called twice in this example. There can occur numerous side effects in scenarios like this, for example:
* multiple connection attempts on the same ressource
  * possibly ghost connections that are not closed as a result of that
* dead locks in case of unintentional promise calls
* broken state in classes where only a single method call is expected

## Lifecycle Hooks

When we declare the lifecycle hook `initialize` we're implicitly stating that:

* any class can have an `initialize` method - it is not mandatory to have one though
* all the `initialize` methods virtually have the same purpose
* `initialize` methods must return a promise if they do asynchronous stuff

The declaration for the aforementioned dependency graph looks like this:

```javascript
import {A, B, C, D, E} from './examples';
import {InvocationContainer} from 'addict-ioc';

const container = new InvocationContainer({
  defaults: {
    conventionCalls: ['initialize'],
  },
});

container.register('A', A)
  .dependencies('B', 'C');
container.register('B', B)
  .dependencies('D');
container.register('C', C)
  .dependencies('D', 'E');
container.register('D', D)
  .dependencies('E');
container.register('E', E);
```

Instead of the `Container`, this time we use the `InvocationContainer` from addict-ioc.

The basic `Container` does not provide lifecycle hooks.

The `InvocationContainer` extends the `Container` and adds that functionality.

We can configure our lifecycle hooks by using the `conventionCalls` property in the config we provide to the `InvocationContainer`. The order in which you specify the lifecycle hooks in `conventionCalls` will be the order in which they are executed.

Lifecycle Hooks are like phases that are sequentially executed after class instantiation.

Let's pretend every class of our dependency tree looks like this:

```javascript
export class A {
  constructor() {
    console.log('constructor A');
  }
  initialize() {
    console.log('initialize A');
  }
}
```

Now that we're using the `InvocationContainer` we don't need to call any `initialize` method ourselves.

```javascript
const instanceA = container.resolve('A');
// constructor E
// constructor D
// constructor C
// constructor B
// constructor A
// -------------
// initialize E
// initialize D
// initialize C
// initialize B
// initialize A
```

After the `InvocationContainer` created our classes it called the `initialize` method on every class instantiated **in the correct order**.

The `InvocationContainer` guarantees that before `initialize` is called on a class, it was successfully called and finished on all instances it has a dependency on.

## Asynchronous Lifecycle Hooks

In our previous example the `initialize` methods were implemented synchronously. That was rather easy.

Let's return a promise in one of the `initialize` methods to see how it works asynchronously:

```javascript
export class D {
  constructor(e) {
    this.e = e;
  }
  initialize() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }
}
```

If we now try the same as before using `container.resolve()` it won't work properly.

Instead we have to use `container.resolveAsync()`. The reason for that is that we need to retrieve a promise for our asynchronous operation.

One promise in any `initialize` method of our dependency graph is enough to require the whole dependency graph to be asynchronous by definition - and therefore use `container.resolveAsync()`.

That does not mean you have to return a promise in every `initialize` method though, you just have the freedom to do it whenever you need to.

Let's put that knowledge to use:

```javascript
container.resolveAsync('A')
  .then((instanceA) => {
    // constructor E
    // constructor D
    // constructor C
    // constructor B
    // constructor A
    // -------------
    // initialize E
    // initialize D
    // (waits 2 seconds)
    // initialize C
    // initialize B
    // initialize A
  });
```

This can save you hours (even days) of frustration and gives you much cleaner code to work with.