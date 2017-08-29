# Lifecycle

If you didn't look into the [Discovery](discovery.md) give it a quick visit as we're slightly advancing what we previously did.

## Lifecycle hooks

You're likely to end up with quite some classes after some time developing a project.

What gave me a headache more than once for sure is the need to `initialize` things in the right order all over the application. Especially when things get asynchronously it can get really nasty.

That's where a lifecycle hook can make your life easier.

---

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

When we declare the lifecycle hook `initialize` we're implicitly stating that:

Many (but not necessarily all) of our classes implement a method that virtually does the same.


The declaration for this dependency graph looks like this:

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

This time we used the `InvocationContainer` in order to use the lifecycle hooks.

When we declare the lifecycle hook `initialize` we're implicitly stating that:

Many (but not necessarily all) of our classes implement a method that virtually does the same.

```javascript
export class Hello {
  constructor() {
    console.log('Hello');
  }
  initialize() {
    console.log('initialize Hello');
  }
}
```

```javascript
export class World {
  constructor() {
    console.log('World');
  }
  initialize() {
    console.log('initialize World');
  }
}
```

Normally if we wanted out `initialize`-methods to be called, we would have to take care of that ourselves.

But now the `InvocationContainer` can take care of that for us. So we can remove the manual `initialize`-call we used in our `MainApp`.

```javascript
export class MainApp {

  private container;

  constructor(container) {
    this.container = container;
  }

  initialize() {

    const pluginKeys = this.container.getKeysByTags('MyPlugin');

    for (const pluginKey of pluginKeys) {

      const pluginInstance = this.container.resolve(pluginKey);

      // we don't need to call this anymore
      // pluginInstance.initialize();
    }
  }
}
```

```javascript
const mainApp = container.resolve('MainApp');
// Hello
// World
// initialize Hello
// initialize World
```

Not only has the `InvocationContainer` called `initialize` on our `MainApp`. It also called `initialize` in the order of the dependency tree on all classes instantiated by the `InvocationContainer`.
