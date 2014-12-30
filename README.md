propagating-hammerjs
====================

Extend hammer.js v2 with event propagation.

# Features

- Events emitted by hammer will propagate in order from child to parent
  elements.
- Events are extended with a function `event.stopPropagation()` to stop
  propagation to parent elements.
- Supports changing and rearranging the HTML DOM on the fly.
- Load via commonjs, AMD, or as a plain old JavaScript file.


# Install

    npm install propagating-hammerjs

## Load

## Browser

```html
<!DOCTYPE html>
<html>
<head>
  <script src="node_modules/hammerjs/hammer.js"></script>
  <script src="propagating.js"></script>
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

## Commonjs (Node.js + Browserify)

```js
var Hammer = require('hammerjs');
var propagating = require('propagating-hammerjs');

function init() {
  var hammer = propagating(new Hammer(element));
}
```


# Use

```html
<!DOCTYPE html>
<html>
<head>
  <script src="node_modules/hammerjs/hammer.js"></script>
  <script src="propagating.js"></script>
  <style>
    #parent {width: 400px; height: 400px; background: yellow;     border: 1px solid orange;}
    #child  {width: 200px; height: 200px; background: lightgreen; border: 1px solid green; margin: 10px;}
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

# Examples

- [demo1.html](demo1.html)
- [demo2.html](demo2.html)


# API

Construction:

    propagatingHammer(hammer: Hammer.Manager) : Hammer.Manager

**parameters**

- `hammer: Hammer.Manager` An hammer instance.

**returns**

Returns the same hammer instance with extended functionality.


# License

MIT
