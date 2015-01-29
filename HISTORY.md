# History

## 2015-01-29, version 1.2.1

- Removed using top level `this`, attaching `propagating` immediately to
  `window instead`.


## 2015-01-05, version 1.2.0

- Added an event property `event.firstTarget`, always containing the element
  where a gesture started.
- Fixed the `hammer.input` event blocking the emit of real events.
- Fixed `panend` not being emitted when `pan` was used too.


## 2015-01-02, version 1.1.1

- Fixed the module not working via commonjs.


## 2014-12-30, version 1.1.0

- Added support for applying `propagating` to the Hammer constructor.


## 2014-12-30, version 1.0.0

- Initial, fully functional release.
