/*  Modified by: Asher Wolfstein (asherwunk@gmail.com) June 18th, 2017
 *               For more information see my blog at http://wunk.me/
 *               Also the specific URL: http://wunk.me/programming-projects/pygjs
 */

/**
 * @fileoverview
 * Only used by GameJs internally to provide a game loop.
 * @ignore
 */

var Callback = require('./utils/callback').Callback;

var gamepad = require('./gamepad')

var TIMER_LASTCALL = null;
var STARTTIME = null;

/** @ignore **/
var _CALLBACKS = exports._CALLBACKS = [];
// `window` is not accessible in webworker (would lead to TypeError)
// @@ this cross-browser fuckery has to go away ASAP.
var reqAnimationFrame = exports.reqAnimationFrame = typeof(window) != 'undefined' ?
                        window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        null : null;

var reqAniFrameRecursive = function() {
   perInterval();
   reqAnimationFrame(reqAniFrameRecursive);
};

var triggerCallbacks = function(msDuration) {
   _CALLBACKS.forEach(function(c) {
      c.trigger(msDuration);
   });
};

/**
 * @ignore
 */
exports.init = function() {
   STARTTIME = Date.now();

   if (reqAnimationFrame) {
      reqAnimationFrame(reqAniFrameRecursive);
   } else {
      setInterval(perInterval, 10);
   }
   return;
};

var perInterval = function() {
   var msNow = Date.now();
   triggerCallbacks(msNow - (TIMER_LASTCALL || msNow));
   if (typeof(gamepad.joystick) !== 'unknown') {
      gamepad.joystick._update()
   }
   
   TIMER_LASTCALL = msNow;
   return;
};
