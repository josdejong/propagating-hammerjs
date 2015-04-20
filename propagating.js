'use strict';

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    window.propagating = factory();
  }
}(function () {
  var _firstTarget = null; // singleton, will contain the target element where the touch event started
  var _processing = false; // singleton, true when a touch event is being handled

  /**
   * Extend an Hammer.js instance with event propagation.
   *
   * Features:
   * - Events emitted by hammer will propagate in order from child to parent
   *   elements.
   * - Events are extended with a function `event.stopPropagation()` to stop
   *   propagation to parent elements.
   * - An option `preventDefault` to stop all default browser behavior.
   *
   * Usage:
   *   var hammer = propagatingHammer(new Hammer(element));
   *   var hammer = propagatingHammer(new Hammer(element), {preventDefault: true});
   *
   * @param {Hammer.Manager} hammer   An hammer instance.
   * @param {Object} [options]        Available options:
   *                                  - `preventDefault: true | 'mouse' | 'touch' | 'pen'`.
   *                                    Enforce preventing the default browser behavior.
   *                                    Cannot be set to `false`.
   * @return {Hammer.Manager} Returns the same hammer instance with extended
   *                          functionality
   */
  return function propagating(hammer, options) {
    if (options && options.preventDefault === false) {
      throw new Error('Only supports preventDefault == true');
    }
    var _options = options || {
      preventDefault: false
    };

    if (hammer.Manager) {
      // This looks like the Hammer constructor.
      // Overload the constructors with our own.
      var Hammer = hammer;

      var PropagatingHammer = function(element, options) {
        return propagating(new Hammer(element, options), _options);
      };
      Hammer.extend(PropagatingHammer, Hammer);
      PropagatingHammer.Manager = function (element, options) {
        return propagating(new Hammer.Manager(element, options), _options);
      };

      return PropagatingHammer;
    }

    // attach to DOM element
    var element = hammer.element;
    element.hammer = hammer;

    // move the original functions that we will wrap
    hammer._on = hammer.on;
    hammer._off = hammer.off;
    hammer._emit = hammer.emit;
    hammer._destroy = hammer.destroy;

    /** @type {Object.<String, Array.<function>>} */
    hammer._handlers = {};

    // register an event to catch the start of a gesture and store the
    // target in a singleton
    hammer._on('hammer.input', function (event) {
      if (_options.preventDefault === true || (_options.preventDefault === event.pointerType)) {
        event.preventDefault();
      }
      if (event.isFirst) {
        _firstTarget = event.target;
        _processing = true;
      }
      if (event.isFinal) {
        _processing = false;
      }
    });

    /**
     * Register a handler for one or multiple events
     * @param {String} events    A space separated string with events
     * @param {function} handler A callback function, called as handler(event)
     * @returns {Hammer.Manager} Returns the hammer instance
     */
    hammer.on = function (events, handler) {
      // register the handler
      split(events).forEach(function (event) {
        var _handlers = hammer._handlers[event];
        if (!_handlers) {
          hammer._handlers[event] = _handlers = [];

          // register the static, propagated handler
          hammer._on(event, propagatedHandler);
        }
        _handlers.push(handler);
      });

      return hammer;
    };

    /**
     * Unregister a handler for one or multiple events
     * @param {String} events      A space separated string with events
     * @param {function} [handler] Optional. The registered handler. If not
     *                             provided, all handlers for given events
     *                             are removed.
     * @returns {Hammer.Manager}   Returns the hammer instance
     */
    hammer.off = function (events, handler) {
      // unregister the handler
      split(events).forEach(function (event) {
        var _handlers = hammer._handlers[event];
        if (_handlers) {
          _handlers = handler ? _handlers.filter(function (h) {
            return h !== handler;
          }) : [];

          if (_handlers.length > 0) {
            hammer._handlers[event] = _handlers;
          }
          else {
            // remove static, propagated handler
            hammer._off(event, propagatedHandler);
            delete hammer._handlers[event];
          }
        }
      });

      return hammer;
    };

    /**
     * Emit to the event listeners
     * @param {string} eventType
     * @param {Event} event
     */
    hammer.emit = function(eventType, event) {
      if (!_processing) {
        _firstTarget = event.target;
      }
      hammer._emit(eventType, event);
    };

    hammer.destroy = function () {
      // Detach from DOM element
      var element = hammer.element;
      delete element.hammer;

      // clear all handlers
      hammer._handlers = {};

      // call original hammer destroy
      hammer._destroy();
    };

    // split a string with space separated words
    function split(events) {
      return events.match(/[^ ]+/g);
    }

    /**
     * A static event handler, applying event propagation.
     * @param {Object} event
     */
    function propagatedHandler(event) {
      // let only a single hammer instance handle this event
      if (event.type !== 'hammer.input') {
        // it is possible that the same srcEvent is used with multiple hammer events,
        // we keep track on which events are handled in an object _handled
        if (!event.srcEvent._handled) {
          event.srcEvent._handled = {};
        }

        if (event.srcEvent._handled[event.type]) {
          return;
        }
        else {
          event.srcEvent._handled[event.type] = true;
        }
      }

      // attach a stopPropagation function to the event
      var stopped = false;
      event.stopPropagation = function () {
        stopped = true;
      };

      // attach firstTarget property to the event
      event.firstTarget = _firstTarget;

      // propagate over all elements (until stopped)
      var elem = _firstTarget;
      while (elem && !stopped) {
        var _handlers = elem.hammer && elem.hammer._handlers[event.type];
        if (_handlers) {
          for (var i = 0; i < _handlers.length && !stopped; i++) {
            _handlers[i](event);
          }
        }

        elem = elem.parentNode;
      }
    }

    return hammer;
  };
}));
