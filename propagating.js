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
  // will contain the target element where the gesture started
  var _firstTarget = null; // singleton

  /**
   * Extend an Hammer.js instance with event propagation.
   *
   * Features:
   * - Events emitted by hammer will propagate in order from child to parent
   *   elements.
   * - Events are extended with a function `event.stopPropagation()` to stop
   *   propagation to parent elements.
   *
   * Usage:
   *   var hammer = propagatingHammer(new Hammer(element));
   *
   * @param {Hammer.Manager} hammer   An hammer instance.
   * @return {Hammer.Manager} Returns the same hammer instance with extended
   *                          functionality
   */
  return function propagating(hammer) {
    if (hammer.Manager) {
      // This looks like the Hammer constructor.
      // Overload the constructors with our own.
      var Hammer = hammer;

      var PropagatingHammer = function(element, options) {
        return propagating(new Hammer(element, options));
      };
      Hammer.extend(PropagatingHammer, Hammer);
      PropagatingHammer.Manager = function (element, options) {
        return propagating(new Hammer.Manager(element, options));
      };

      return PropagatingHammer;
    }

    // attach to DOM element
    var element = hammer.element;
    element.hammer = hammer;

    // move the original functions that we will wrap
    hammer._on = hammer.on;
    hammer._off = hammer.off;
    hammer._destroy = hammer.destroy;

    /** @type {Object.<String, Array.<function>>} */
    hammer._handlers = {};

    // register an event to catch the start of a gesture and store the
    // target in a singleton
    hammer._on('hammer.input', function (event) {
      if (event.isFirst) {
        _firstTarget = event.target;
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
        if (event.srcEvent._handled && event.srcEvent._handled[event.type]) {
          return;
        }
        else {
          // it is possible that the same srcEvent is used with multiple hammer events
          event.srcEvent._handled = {};
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
