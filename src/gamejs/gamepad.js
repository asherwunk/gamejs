var gamepad = require('./lib/gamepad');

/*  Modified by: Asher Wolfstein (asherwunk@gmail.com) June 18th, 2017
 *               For more information see my blog at http://wunk.me/
 *               Also the specific URL: http://wunk.me/programming-projects/pygjs
 */


exports.event = gamepad.Gamepad.Event
exports.joystick = new gamepad.Gamepad(new gamepad.Gamepad.UpdateStrategies.ManualUpdateStrategy());
