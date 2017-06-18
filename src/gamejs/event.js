var display = require('./display');
var Callback = require('./utils/callback').Callback;
var time = require('./time');
var gamepad = require('./gamepad');

/*  Modified by: Asher Wolfstein (asherwunk@gmail.com) June 18th, 2017
 *               For more information see my blog at http://wunk.me/
 *               Also the specific URL: http://wunk.me/programming-projects/pygjs
 */

/**
 * @fileoverview
 * Deal with mouse and keyboard events.
 *
 * You can either handle all events in one callback with `gamejs.event.onEvent()`:
 *
 *     gamejs.onEvent(function(event) {
 *        if (event.type === gamejs.event.MOUSE_UP) {
 *          gamejs.logging.info(event.pos, event.button);
 *        } else if (event.type === gamejs.event.KEY_UP) {
 *          gamejs.logging.info(event.key);
 *        }
 *     });
 *
 * Or recieve more specific callbacks, e.g. only for `KEY\_UP` with  `gamejs.event.onKeyUp()`:
 *
 *     gamejs.onKeyUp(function(event) {
 *          gamejs.logging.info(event.key);
 *     });
 *
 * All events passed to your callback are instances of `gamejs.event.Event` and have a `type` property to help
 * you distinguish between the different events. This `type` property is set to one of those constants:
 *
 *  * gamejs.event.MOUSE\_UP
 *  * gamejs.event.MOUSE\_MOTION
 *  * gamejs.event.MOUSE\_DOWN
 *  * gamejs.event.KEY\_UP
 *  * gamejs.event.KEY\_DOWN
 *  * gamejs.event.DISPLAY\_FULLSCREEN\_ENABLED
 *  * gamejs.event.DISPLAY\_FULLSCREEN\_DISABLED
 *  * gamejs.event.QUIT
 *  * gamejs.event.MOUSE_WHEEL
 *  * gamejs.event.TOUCH\_DOWN
 *  * gamejs.event.TOUCH\_UP
 *  * gamejs.event.TOUCH\_MOTION
 *
 * ### Keyboard constants
 *
 * There are also a lot of keyboard constants for ASCII. Those are all prefixed with `K\_`, e.g. `gamejs.event.K\_a` would be the "a"
 * key and `gamejs.event.K_SPACE` is the spacebar.
 *
 * ## Touch events
 *
 * Touch events do not have a single position but for all `TOUCH\_*` events you get an array of
 * `touches`, which each have their own `pos` attribute and a unique `identifier` for tracking
 * this touch across multiple `TOUCH\_MOTION` events.
 *
 * ## User defined events
 *
 * All user defined events can have the value of `gamejs.event.USEREVENT` or higher.
 * Make sure your custom event ids follow this system.
 *
 * @example
 *     gamejs.onEvent(function(event) {
 *        if (event.type === gamejs.event.MOUSE_UP) {
 *          gamejs.logging.log(event.pos, event.button);
 *        } else if (event.type === gamejs.event.KEY_UP) {
 *          gamejs.logging.log(event.key);
 *        }
 *     });
 *
 */

var _CALLBACKS = [];

exports.JOYSTICK_CONVERT_TO_HAT = true;
exports.PROCESS_ON_FOCUS = true;

// support for pygame.key and pygame.mouse
exports.pressed_keys = [];
exports.pressed_buttons = [];
exports.mouse_pos = [0,0];

/** @ignore **/
var _triggerCallbacks = exports._triggerCallbacks = function() {
  // only process events if the canvas is the active element
  if (exports.PROCESS_ON_FOCUS && !display._hasFocus) {
    return;
  }
  
  var args = arguments;
  _CALLBACKS.forEach(function(cb) {
    if (cb.type === 'all' || args[0].type === cb.type) {
      cb.callback.apply(cb.scope, args);
    }
  });
};

/*
exports.onQuit(callback)
exports.onVisiblityChange(callback)
*/

exports.onAnimationFrame = function(callback, scope) {
  if (typeof(callback) !== 'function') {
    throw new Error('Callback must be a function');
  }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.ANIMATIONFRAME
  });
}

exports.onMouseWheel = function(callback, scope) {
  if (typeof(callback) !== 'function') {
    throw new Error('Callback must be a function');
  }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.MNOUSE_WHEEL
  });
}

/**
 * Pass a callback function to be called when Fullscreen is enabled or disabled.
 * Inspect `event.type` to distinguis between entering and exiting fullscreen.
 *
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onFullscreen = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
      callback: callback,
      scope: scope,
      type: exports.DISPLAY_FULLSCREEN_ENABLED
   });
   _CALLBACKS.push({
      callback: callback,
      scope: scope,
      type: exports.DISPLAY_FULLSCREEN_DISABLED
   });
};

/**
 * The function passsed to `onEvent` will be called whenever
 * any event (mouse, keyboard, etc) was triggered.
 *
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onEvent = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: 'all'
  });
};


/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onDisplayResize = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   };

  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.DISPLAY_RESIZE
  });
}

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onMouseMotion = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.MOUSE_MOTION
  });
};

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onMouseUp = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.MOUSE_UP
  });
};

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onMouseDown = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.MOUSE_DOWN
  });
};

exports.onJoystickConnect = function(callback, scope) {
  if (typeof(callback) !== 'function') {
    throw new Error('Callback must be a function');
  }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_CONNECT
  });
}

exports.onJoystickDisconnect = function(callback, scope) {
  if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_DISCONNECT
   });
}

exports.onJoystickUnsupported = function(callback, scope) {
  if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_UNSUPPORTED
   });
}

exports.onJoystickTick = function(callback, scope) {
  if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_TICK
   });
}

exports.onJoystickButtonDown = function(callback, scope) {
  if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_BUTTON_DOWN
   });
}

exports.onJoystickButtonUp = function(callback, scope) {
  if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_BUTTON_UP
   });
}

exports.onJoystickAxisMotion = function(callback, scope) {
  if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_AXIS_MOTION
   });
}

exports.onJoystickHatMotion = function(callback, scope) {
  if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
   _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.JOYSTICK_HAT_MOTION
   });
}

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onTouchMotion = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.TOUCH_MOTION
  });
};

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onTouchUp = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.TOUCH_UP
  });
};

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onTouchDown = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.TOUCH_DOWN
  });
};

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onKeyDown = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.KEY_DOWN
  });
};

/**
 * @param {Function} callback to be called
 * @param {Object} scope within which the callback should be called. It's `this` during invocation. (optional)
 */
exports.onKeyUp = function(callback, scope) {
   if (typeof(callback) !== 'function') {
      throw new Error('Callback must be a function');
   }
  _CALLBACKS.push({
    callback: callback,
    scope: scope,
    type: exports.KEY_UP
  });
};

// key constants
exports.K_UP = 38;
exports.K_DOWN = 40;
exports.K_RIGHT = 39;
exports.K_LEFT = 37;

exports.K_SPACE = 32;
exports.K_BACKSPACE = 8;
exports.K_TAB = 9;
exports.K_ENTER = 13;
exports.K_SHIFT = 16;
exports.K_CTRL = 17;
exports.K_ALT = 18;
exports.K_ESC = 27;

exports.K_0 = 48;
exports.K_1 = 49;
exports.K_2 = 50;
exports.K_3 = 51;
exports.K_4 = 52;
exports.K_5 = 53;
exports.K_6 = 54;
exports.K_7 = 55;
exports.K_8 = 56;
exports.K_9 = 57;
exports.K_a = 65;
exports.K_b = 66;
exports.K_c = 67;
exports.K_d = 68;
exports.K_e = 69;
exports.K_f = 70;
exports.K_g = 71;
exports.K_h = 72;
exports.K_i = 73;
exports.K_j = 74;
exports.K_k = 75;
exports.K_l = 76;
exports.K_m = 77;
exports.K_n = 78;
exports.K_o = 79;
exports.K_p = 80;
exports.K_q = 81;
exports.K_r = 82;
exports.K_s = 83;
exports.K_t = 84;
exports.K_u = 85;
exports.K_v = 86;
exports.K_w = 87;
exports.K_x = 88;
exports.K_y = 89;
exports.K_z = 90;

exports.K_KP1 = 97;
exports.K_KP2 = 98;
exports.K_KP3 = 99;
exports.K_KP4 = 100;
exports.K_KP5 = 101;
exports.K_KP6 = 102;
exports.K_KP7 = 103;
exports.K_KP8 = 104;
exports.K_KP9 = 105;

// event type constants
exports.NOEVENT = 0;
exports.NUMEVENTS = 32000;

exports.DISPLAY_FULLSCREEN_ENABLED = 300;
exports.DISPLAY_FULLSCREEN_DISABLED = 301;
exports.DISPLAY_RESIZE = 302;

exports.QUIT = 0;
exports.KEY_DOWN = 1;
exports.KEY_UP = 2;
exports.MOUSE_MOTION = 3;
exports.MOUSE_UP = 4;
exports.MOUSE_DOWN = 5;
exports.MOUSE_WHEEL = 6;
exports.TOUCH_UP = 7;
exports.TOUCH_DOWN = 8;
exports.TOUCH_MOTION = 9;
exports.ANIMATIONFRAME = 10;
exports.USEREVENT = 2000;

exports.JOYSTICK_AXIS_MOTION = 3000;
exports.JOYSTICK_HAT_MOTION = 3001;
exports.JOYSTICK_BUTTON_UP = 3002;
exports.JOYSTICK_BUTTON_DOWN = 3003;
exports.JOYSTICK_CONNECT = 3004;
exports.JOYSTICK_DISCONNECT = 3005;
exports.JOYSTICK_UNSUPPORTED = 3006;
exports.JOYSTICK_TICK = 3007;

/**
 * Properties of the `event` object argument passed to the callbacks.
 * @class
 */

exports.Event = function() {
    /**
     * The type of the event. e.g., gamejs.event.QUIT, KEYDOWN, MOUSEUP.
     */
    this.type = null;
    /**
     * key the keyCode of the key. compare with gamejs.event.K_a, gamejs.event.K_b,...
     */
    this.key = null;
    /**
     * relative movement for a mousemove event
     */
    this.rel = null;
    /**
     * the number of the mousebutton pressed
     */
    this.button = null;
    /**
     * pos the position of the event for mouse events
     */
    this.pos = null;
};

/**
 * @ignore
 */
exports.init = function() {

   var lastPos = [];

   // anonymous functions as event handlers = memory leak, see MDC:elementAddEventListener

   function onMouseDown (ev) {
      var canvasOffset = display._getCanvasOffset();
      
      if (exports.pressed_buttons.indexOf(ev.button) == -1) {
        exports.pressed_buttons.push(ev.button);
      }
      
      _triggerCallbacks({
         'type': exports.MOUSE_DOWN,
         'pos': [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
         'button': ev.button,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });
   }

   function onMouseUp (ev) {
      var canvasOffset = display._getCanvasOffset();
      
      // for pygame.key.get_pressed support
      exports.pressed_buttons = exports.pressed_buttons.filter(function (elm) { return !(elm == ev.button); });
      
      _triggerCallbacks({
         'type':exports.MOUSE_UP,
         'pos': [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
         'button': ev.button,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });
   }

   function onKeyDown (ev) {
      var key = ev.keyCode || ev.which;
      
      // for pygame.key.get_pressed support
      if (exports.pressed_keys.indexOf(key) == -1) {
        exports.pressed_keys.push(key);
      }
      
      _triggerCallbacks({
         'type': exports.KEY_DOWN,
         'key': key,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });

      // if the display has focus, we surpress default action
      // for most keys
      if (display._hasFocus() && (!ev.ctrlKey && !ev.metaKey &&
         ((key >= exports.K_LEFT && key <= exports.K_DOWN) ||
         (key >= exports.K_0    && key <= exports.K_z) ||
         (key >= exports.K_KP1  && key <= exports.K_KP9) ||
         key === exports.K_SPACE ||
         key === exports.K_TAB ||
         key === exports.K_ENTER)) ||
         key === exports.K_ALT ||
         key === exports.K_BACKSPACE) {
        ev.preventDefault();
      }
   }

   function onKeyUp (ev) {
      var key = ev.keyCode || ev.which;
      
      // for pygame.key.get_pressed support
      exports.pressed_keys = exports.pressed_keys.filter(function (elm) { return !(elm == key); });
      
      _triggerCallbacks({
         'type': exports.KEY_UP,
         'key': key,
         'shiftKey': ev.shiftKey,
         'ctrlKey': ev.ctrlKey,
         'metaKey': ev.metaKey
      });
   }

   function onMouseMove (ev) {
      var canvasOffset = display._getCanvasOffset();
      var currentPos = [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]];
      var relativePos = [];
      if (lastPos.length) {
         relativePos = [
            lastPos[0] - currentPos[0],
            lastPos[1] - currentPos[1]
         ];
      }
      
      exports.mouse_pos = currentPos;
      
      _triggerCallbacks({
         'type': exports.MOUSE_MOTION,
         'pos': currentPos,
         'rel': relativePos,
         'buttons': null, // FIXME, fixable?
         'timestamp': ev.timeStamp,
         'movement': [ev.movementX       ||
                      ev.mozMovementX    ||
                      ev.webkitMovementX || 0,
                      ev.movementY       ||
                      ev.mozMovementY    ||
                      ev.webkitMovementY || 0
                      ]
      });
      lastPos = currentPos;
      return;
   }

   function onMouseScroll(ev) {
      var canvasOffset = display._getCanvasOffset();
      var currentPos = [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]];
      _triggerCallbacks({
         type: exports.MOUSE_WHEEL,
         pos: currentPos,
         delta: ev.detail || (- ev.wheelDeltaY / 40)
      });
      return;
   }

   function onBeforeUnload (ev) {
      _triggerCallbacks({
         'type': exports.QUIT
      });
      return;
   };

   // convert a w3c touch event into gamejs event
   function w3cTouchConvert(touchList) {
      var canvasOffset = display._getCanvasOffset();
      var tList = [];
      for (var i = 0; i < touchList.length; i++) {
         var touchEvent = touchList.item(i);
         tList.push({
            identifier: touchEvent.identifier,
            pos: [touchEvent.clientX - canvasOffset[0], touchEvent.clientY - canvasOffset[1]]
         });
      }
      return tList;
   }

   function onTouchDown(ev) {
      var canvasOffset = display._getCanvasOffset();
      var changedTouches = w3cTouchConvert(ev.changedTouches);
      _triggerCallbacks({
         'type': exports.TOUCH_DOWN,
         'touches': changedTouches
      });
   };

   function onTouchUp(ev) {
      var changedTouches = w3cTouchConvert(ev.changedTouches);
      _triggerCallbacks({
         'type': exports.TOUCH_UP,
         'touches': changedTouches,
      });
   }
   function onTouchMotion(ev) {
      var changedTouches = w3cTouchConvert(ev.changedTouches);
      _triggerCallbacks({
         'type': exports.TOUCH_MOTION,
         'touches': changedTouches
      });
      ev.preventDefault();
   }
   
   function onJoystickConnection(device) {
      _triggerCallbacks({
        'type': exports.JOYSTICK_CONNECT,
        'device': device
      });
      return;
   }
   
   function onJoystickDisconnection(device) {
      _triggerCallbacks({
        'type': exports.JOYSTICK_DISCONNECT,
        'device': device
      });
      return;
   }
   
   function onJoystickUnsupported(device) {
      _triggerCallbacks({
        'type': exports.JOYSTICK_UNSUPPORTED,
      });
      return;
   }
   
   function onJoystickButtonDown(ev) {
      // I proceed to treat d-pads as hat switches
      if (exports.JOYSTICK_CONVERT_TO_HAT && (ev.control == 'DPAD_LEFT' || ev.control == "DPAD_RIGHT" || ev.control == "DPAD_UP" || ev.control == "DPAD_DOWN")) {
        _triggerCallbacks({
          'type': exports.JOYSTICK_HAT_MOTION,
          'hat': ev.control,
          'value': 1,
          'gamepad': ev.gamepad
        });
      } else {
        _triggerCallbacks({
          'type': exports.JOYSTICK_BUTTON_DOWN,
          'value': ev.control,
          'gamepad': ev.gamepad
        });
      }
   }
   
   function onJoystickButtonUp(ev) {
      // I proceed to treat d-pads as hat switches
      if (exports.JOYSTICK_CONVERT_TO_HAT && (ev.control == 'DPAD_LEFT' || ev.control == "DPAD_RIGHT" || ev.control == "DPAD_UP" || ev.control == "DPAD_DOWN")) {
        _triggerCallbacks({
          'type': exports.JOYSTICK_HAT_MOTION,
          'hat': ev.control,
          'value': 1,
          'gamepad': ev.gamepad
        });
      } else {
        _triggerCallbacks({
          'type': exports.JOYSTICK_BUTTON_UP,
          'value': ev.control,
          'gamepad': ev.gamepad
        });
      }
   }
   
   function onJoystickAxischanged(ev) {
      // I proceed to treat d-pads as hat switches
      if (ev.axis == 'DPAD_LEFT' || ev.axis == "DPAD_RIGHT" || ev.axis == "DPAD_UP" || ev.axis == "DPAD_DOWN") {
        _triggerCallbacks({
          'type': exports.JOYSTICK_HAT_MOTION,
          'hat': ev.axis,
          'value': (ev.value > 0.1 ? 1 : (ev.value < -0.1 ? -1 : 0)),
          'gamepad': ev.gamepad
        });
      } else {
        _triggerCallbacks({
          'type': exports.JOYSTICK_AXIS_MOTION,
          'axis': ev.axis,
          'value': ev.value,
          'gamepad': ev.gamepad
        });
      }
      return;
   }
   
   function onJoystickTick(gamepads) {
      _triggerCallbacks({
        'type': exports.JOYSTICK_TICK,
        'gamepads': gamepads
      });
      return;
   }

   // IE does not support addEventListener on document itself
   // FX events don't reach body if mouse outside window or on menubar
   var canvas = display._getCanvas();
   document.addEventListener('mousedown', onMouseDown, false);
   document.addEventListener('mouseup', onMouseUp, false);
   document.addEventListener('keydown', onKeyDown, false);
   document.addEventListener('keyup', onKeyUp, false);
   document.addEventListener('mousemove', onMouseMove, false);
   canvas.addEventListener('mousewheel', onMouseScroll, false);
   // MOZFIX
   // https://developer.mozilla.org/en/Code_snippets/Miscellaneous#Detecting_mouse_wheel_events
   canvas.addEventListener('DOMMouseScroll', onMouseScroll, false);
   canvas.addEventListener('beforeunload', onBeforeUnload, false);
   // touchs
   canvas.addEventListener("touchstart", onTouchDown, false);
   canvas.addEventListener("touchend", onTouchUp, false);
   canvas.addEventListener("touchcancel", onTouchUp, false);
   canvas.addEventListener("touchleave", onTouchUp, false);
   canvas.addEventListener("touchmove", onTouchMotion, false);
   // joystick
   gamepad.joystick.bind(gamepad.event.CONNECTED, onJoystickConnection);
   gamepad.joystick.bind(gamepad.event.DISCONNECTED, onJoystickDisconnection);
   gamepad.joystick.bind(gamepad.event.UNSUPPORTED, onJoystickUnsupported);
   gamepad.joystick.bind(gamepad.event.BUTTON_DOWN, onJoystickButtonDown);
   gamepad.joystick.bind(gamepad.event.BUTTON_UP, onJoystickButtonUp);
   gamepad.joystick.bind(gamepad.event.AXIS_CHANGED, onJoystickAxischanged);
   gamepad.joystick.bind(gamepad.event.TICK, onJoystickTick);
   
   time._CALLBACKS.push(new Callback(
      function(msduration){_triggerCallbacks({
        'type': exports.ANIMATIONFRAME,
        'duration': msduration
      })}
    ));
};
