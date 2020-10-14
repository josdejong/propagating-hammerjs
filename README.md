# propagating-hammerjs

Extend [hammer.js](https://github.com/hammerjs/hammer.js) v2 with event propagation.

## Features

- Events emitted by hammer will propagate in order from child to parent
  elements.
- Events are extended with a function `event.stopPropagation()` to stop
  propagation to parent elements.
- Events are extended with a property `event.firstTarget` containing the
  element where a gesture started.
- Supports changing and rearranging the HTML DOM on the fly.
- Load via commonjs, AMD, or as a plain old JavaScript file.

## Install

```sh
npm install propagating-hammerjs
```

## Load

### Browser

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/hammerjs@latest/hammer.js"></script>
  <script src="https://unpkg.com/propagating-hammerjs@latest/propagating.js"></script>
  <script>
    function init() {
      var hammer = propagating(new Hammer(element));
    }
  </script>
</head>
<body>
</body>
</html>
```

### Commonjs (e.g. Node.js, Browserify)

```js
var Hammer = require('hammerjs');
var propagating = require('propagating-hammerjs');

function init() {
  var hammer = propagating(new Hammer(element));
}
```

### ESM (e.g. ES6, typescript)

```typescript
import Hammer from 'hammerjs';
import propagating from 'propagating-hammerjs';

function init() {
  const hammer = propagating(new Hammer(element));
}
```

## Use

To extend individual hammer.js instances with event propagation:

```js
var hammer = propagating(new Hammer(element));
```

To extend the global hammer.js constructor

```js
Hammer = propagating(Hammer);
```

## Examples

Here a basic usage example.
More examples are available in the folder [/examples](./examples/).

```html
<!DOCTYPE html>
<html>
<head>
  <script src="node_modules/hammerjs/hammer.js"></script>
  <script src="propagating.js"></script>
  <style>
    div     {border: 1px solid black;}
    #parent {width: 400px; height: 400px; background: lightgreen;}
    #child  {width: 200px; height: 200px; background: yellow; margin: 10px;}
  </style>
</head>
<body>

<div id="parent">
  parent
  <div id="child">
    child
  </div>
</div>

<script>
  var parent = document.getElementById('parent');
  var hammer1 = propagating(new Hammer(parent))
      .on('tap', function (event) {
        alert('tap on parent');
      });

  var child = document.getElementById('child');
  var hammer2 = propagating(new Hammer(child))
      .on('tap', function (event) {
        alert('tap on child');

        // stop propagation from child to parent
        event.stopPropagation();
      });
</script>
</body>
</html>
```

## API

Construction:

```typescript
propagating(hammer: Hammer.Manager, options?: {
  preventDefault?: true | 'mouse' | 'touch' | 'pen'
}): Hammer.Manager
```

### parameters

- `hammer: Hammer.Manager` An hammer instance or the global hammer constructor.

- `options: Object` An optional object with options. Available options:

  - `preventDefault: true | 'mouse' | 'touch' | 'pen'`. Optional.
    Enforce preventing the default browser behavior. Cannot be set to `false`.

### returns

Returns the same hammer instance with extended functionality.

### events

The emitted [hammer.js events](http://hammerjs.github.io/api/#event-object) are
extended with:

- `event.stopPropagation()`

  If called, the event will not further propagate the elements parents.

- `event.firstTarget`

  Contains the HTML element where a gesture started (where as `event.target`
  contains the element where the pointer is right now).

## Develop

To generate the UMD bundle for commonjs and browser, run:

```sh
npm run build
```

## License

MIT
