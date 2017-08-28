# Discovery

In the [Hello World](hello-world.md) example, you learned the most common case of how to deal with dependencies.

Those dependencies are statically declared so at design time we can already tell what will happen at runtime.

In more complex scenarios you often have dynamic dependencies - that means you can't or don't want to declare some dependencies statically.

For those cases a _discovery_ comes in handy.

## Let's build a plugin architecture in 5 minutes

So, for a discovery you need to have criteria to discover things by.

addict-ioc does this by using tags - and the simplest use case of those tags is to use them as string labels.

To identify our plugin registrations we're going to tag them with the label `MyPlugin`.

```javascript
import {Plugin1} from './plugin-one';
import {Plugin2} from './plugin-two';
import {MainApp} from './main-app';

import {Container} from 'addict-ioc';

const container = new Container();

container.register('MainApp', MainApp)
  .dependencies('container');

container.register('Plugin1', Plugin1)
  .tags('MyPlugin');

container.register('Plugin2', Plugin2)
  .tags('MyPlugin');
```

You might have noticed that we declared the `container` as a dependency of our `MainApp`. `container` is the default key under which the IoC container registers itself. So instead of creating a new container, you can inject the one that created you (creepy, huh?).

Let's take a look at the `MainApp` class to understand why the `container` is used as a dependency.

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

      // do whatever you like ;)
      pluginInstance.initialize();
    }
  }
}
```

In the `initialize`-method we call `getKeysByTags` on the `container` to get the keys of the registrations that are marked with the given tags. If we then iterate over that array we can retrieve an instance of each plugin and do programming stuff with it.