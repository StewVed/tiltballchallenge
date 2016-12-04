/*
 * Ideally, I would have only two different tpes of input;
 * pointer (for touch and mouse)
 * gamepad for gamepads, and keybnoards
 *
 * having said that, I could make the mouse into a 3-button, 1 axis gamepad, and touches similar, but more axis and buttons.
 * and gamepads and keyboards could be used to move a pointer around too.
 *
 * Sensetivity should be adjustable, and axes and buttons would be configurable
*/
function bubbleStop(e) {
  if (!e) {
    var e = window.event;
  }
  if (e.cancelable) {
    e.preventDefault();
    e.stopPropagation();
  }
}
function findTarget(e) {
  if (!e) {
    var e = window.event;
  }
  targ = e.target || e.srcElement;
  if (targ.nodeType != 1) {
    //element nodes are 1, attribute, text, comment, etc. nodes are other numbers... I want the element.
    targ = targ.parentNode;
  }
  return targ;
}
function gamePadUpdate() {
  //overwrite with the current gamepad statuses
  var gamePads = navigator.getGamepads();
  //Chrom[e/ium] appears to have a bug where it reports 4 undefined gamepads instead of nothing! woraround here:
  for (var x = 0; x < gamePads.length; x++) {
    if (gamePads[x]) {
      //only add if the gamepad exists - NOT FOOLPROOF!
      //only shallow-copy the buttons and axes - don't need the rest (yet!)
      gamePadVars[x] = [];
      gamePadVars[x].buttons = gamePads[x].buttons.slice(0);
      gamePadVars[x].axes = gamePads[x].axes.slice(0);
    }
  }
}
function keyNum(e) {}
function keyDown(e) {
  var theKey = keyNum(e);
  if (keysIgnore.indexOf(theKey) != -1) {
    bubbleStop();
    keyVars.push(theKey);
    //simply add the newly pressed key into the WinKeys array.
  }
}
function keyRedefine(theKey) {
  // left,up,right,down,A,B,X,Y   you can add more should your game require it.
  var theKey = keyNum(e);
  if (keysCurrent.indexOf(theKey) != -1) {
    bubbleStop();
    keyVars.push(theKey);
    //simply add the newly pressed key into the WinKeys array.
  }
}
function keyUp(e) {
  var theKey = keyNum(e);
  while (keyVars.indexOf(theKey) != -1) {
    bubbleStop();
    keyVars.splice(keyVars.indexOf(theKey), 1);
    //updates array length while delete() doesn't
  }
}
function mouseClear() {
  if (mouseVars.clickTimer) {
    window.clearTimeout(mouseVars.clickTimer);
  }
  mouseVars = {
    button: null ,
    type: null ,
    cursorStyle: null ,
    clickTimer: null ,
    targetCurrent: null ,
    targetStart: null ,
    timeStart: null ,
    moved: 0,
    xCurrent: null ,
    xStart: null ,
    yCurrent: null ,
    yStart: null
  }
  document.body.style.cursor = 'default';
}
function mouseDown(e) {
  if (!e.touch2Mouse) {
    bubbleStop(e);
  }
  var targ = findTarget(e);
  mouseVars.button = null == e.which ? e.button : e.which;
  mouseVars.type = 'click';
  mouseVars.clickTimer = window.setTimeout(function() {
    mouseLongClick()
  }, 500);
  mouseVars.targetCurrent = targ;
  mouseVars.targetStart = targ;
  mouseVars.timeStart = new Date();
  mouseVars.xCurrent = e.clientX;
  mouseVars.xStart = e.clientX;
  mouseVars.yCurrent = e.clientY;
  mouseVars.yStart = e.clientY;

  //anything that is needed on a mousedown/when a finger touches the screen goes here.
}
function mouseMove(e) {
  if (!e.touch2Mouse) {
    bubbleStop(e);
  }
  if (mouseVars.moved) {
    return;
    //only accept an input every frame. - probably won't work though
  }
  mMoved = 1;
  window.requestAnimationFrame(function() {
    mMoved = 0;
  });
  //make sure that only one mouse movement is done per frame to reduce cpu usage.
  var targ = findTarget(e);
  //check for onmouseout/onmousein events!
  if (mouseVars.targetCurrent != targ) {
    mouseMoveEnter(targ);
    mouseMoveOut(targ);
  }
  //now onmouseover - this one is done always.
  mouseMoveOver(targ);
  /*
   * do stuff here if needed?
   *
   * likely all movement/scrolling/panning would be done in the mainloop
   */
  //update the mouse object with the current stuff:
  mouseVars.targetCurrent = targ;
  mouseVars.xCurrent = e.clientX;
  mouseVars.yCurrent = e.clientY;
  if (mouseVars.type == 'click') {
    if (((mouseVars.xStart + 5) < e.clientX) || ((mouseVars.xStart - 5) > e.clientX) || ((mouseVars.yStart + 5) < e.clientY) || ((mouseVars.yStart - 5) > e.clientY)) {
      //user has moved the cursor more than 5 pixels in any direction.
      //turn the click into a move...
      mouseVars.type = 'drag';
      window.clearTimeout(mouseVars.clickTimer);
    }
  }
}
function mouseMoveEnter(targ) {
  /*
   * use this for hovering over things.
   * eg. when you enter a new thing, highlight it.
  */
}
function mouseMoveOut(targ) {
  /*
   * opposite of enter...
   * eg. unhighlight something as the mouse moves off of it.
   *
  */
}
function mouseMoveOver(targ) {
  /*
   * for actively tracking while on an object.
   * eg. moving, dynamic tooltip.
  */
}
function mouseUp(e) {
  if (!e.touch2Mouse) {
    bubbleStop(e);
  }
  
  //do any mouseup stuff here, eg. flinging or animated panning
  if (mouseVars.type == 'click') {
    if (mouseVars.button = 1) {
      mouseClick();
    } else if (mouseVars.button = 2) {
      mouseLongClick();
    }
  }
  mouseClear();
}
function mouseWheel(e) {/*
   * for zooming in/out, changing speed, etc.
  */
}
function mouseClick() {
  //if you need something done on a mouse click or tap, lob it here :D
  if (!gameVars.running) {
    gameVars.tWoz = (new Date().getTime()) - 1;
    gameVars.running = 1;
    gameMainLoop();
  }
}
function mouseLongClick() {//this is also the right-click.
  //right-click / long tap stuff - custom menu for example.
}
function touchChange(e) {
  return {
    button: 1,
    target: e.target,
    id: e.identifier,
    clientX: e.clientX,
    clientY: e.clientY,
    touch2Mouse:1
  };
  //return a new event object back with only the things I want in it :)
}
function touchDown(e) {
  bubbleStop(e);
  var cTouches = e.changedTouches;
  for (var x = 0; x < cTouches.length; x++) {
    var zID = cTouches[x].identifier;
    touchVars[zID] = touchChange(cTouches[x]);
    //would overwrite existing event if a finger was not deleted - from aen error for example.
    if (touchVars[zID].target) {
      if (zID == 0) {
        //only do the mouse events on the first finger.
        mouseMove(touchVars[zID]);
        //should change the mouse cursor if needed.
        mouseDown(touchVars[zID]);
      }
    }
  }
}
function touchMove(e) {
  bubbleStop(e);
  var cTouches = e.changedTouches;
  for (var x = 0; x < cTouches.length; x++) {
    var zID = cTouches[x].identifier;
    if (zID >= 0) {
      touchVars.splice(zID, 1, touchChange(cTouches[x]));
      // swap in the new touch record
    }
    if (touchVars[zID]) {
      mouseMove(touchVars[zID]);
    }
  }
}
function touchUp(e) {
  bubbleStop(e);
  var cTouches = e.changedTouches;
  //new array for all current events
  for (var x = 0; x < cTouches.length; x++) {
    var zID = cTouches[x].identifier;
    if (zID >= 0) {
      if (touchVars[zID]) {
        mouseMoveOut(touchVars[zID].target);
      } else {
        touchVars[zID].target = document.body;
      }
      mouseUp(touchVars[zID]);
      //should change the mouse cursor if needed.
      delete touchVars[zID];
    }
  }
}
/*
https://developer.mozilla.org/en/docs/Web/API/DeviceOrientationEvent
window.addEventListener('deviceorientation', function(event) {
  console.log(event.alpha + ' : ' + event.beta + ' : ' + event.gamma);
});

https://developers.google.com/web/fundamentals/native-hardware/device-orientation/
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', deviceOrientationEvent, false);
}
*/
/*
function deviceOrient(e) {
  //Moz    : A number representing the motion of the device around the z axis, express in degrees with values ranging from 0 to 360
  //WebKit : The rotation around the z axis. The alpha value is 0° when the top of the device is pointed directly north. As the device is rotated counter-clockwise, the alpha value increases.
  deviceVars.orientation.alpha = null2zero(e.alpha);

  //Moz    : A number representing the motion of the device around the x axis, express in degrees with values ranging from -180 to 180. This represents a front to back motion of the device.
  //WebKit : The rotation around the x axis. The beta value is 0° when the top and bottom of the device are equidistant from the surface of the earth. The value increases as the top of the device is tipped toward the surface of the earth.
  deviceVars.orientation.beta = null2zero(e.beta);

  //Moz    : A number representing the motion of the device around the y axis, express in degrees with values ranging from -90 to 90. This represents a left to right motion of the device.
  //WebKit : The rotation around the y axis. The gamma value is 0° when the left and right edges of the device are equidistant from the surface of the earth. The value increases as the right side is tipped towards the surface of the earth.
  deviceVars.orientation.gamma = null2zero(e.gamma);
}
*/

function deviceMove(e) {
  /*
    The event returns four properties:
    * accelerationIncludingGravity (m/s2)
    * acceleration, which excludes the effects of gravity (m/s2)
    * rotationRate (°/second)
    * interval.

    now, if this event has rotationRate, can't I just use that instead of orientation?
    I mean if you quickly tilt right, wouldn't the ball move left first cos of inertia?
    are the numbers returned divided by the interval?, an average of that time?


    prototype for the entire device:

    var deviceVars = [
      {accelerationIncludingGravity:{x:0, y:0, z:0}},
      {acceleration:{x:0, y:0, z:0}},
      {rotation:{x:0, y:0, z:0}},
      {orientation:{alpha:0, beta:0, gamma:0}},
      {interval:0}
    ]
  */

  //swapped these round because I am exclusively doing landscape, and x and y are for portrait.
  deviceVars.accelerationIncludingGravity.y = null2zero(e.accelerationIncludingGravity.x);
  deviceVars.accelerationIncludingGravity.x = -null2zero(e.accelerationIncludingGravity.y);
  //deviceVars.accelerationIncludingGravity.z = null2zero(e.accelerationIncludingGravity.z);
/*
  deviceVars.acceleration.x = null2zero(e.acceleration.x);
  deviceVars.acceleration.y = null2zero(e.acceleration.y);
  deviceVars.acceleration.z = null2zero(e.acceleration.z);
*/
  deviceVars.rotationRate.alpha = null2zero(e.rotationRate.alpha);
  deviceVars.rotationRate.beta = null2zero(e.rotationRate.beta);
  deviceVars.rotationRate.gamma = null2zero(e.rotationRate.gamma);

  deviceVars.interval = null2zero(e.interval);


  //or the sake of testing, add a little acceleration here:
  //deviceVars.accelerationIncludingGravity.x = 3.9;
  //deviceVars.accelerationIncludingGravity.y = 9.8;
}

function null2zero(num) {
  if (num == null) {
    num = 0;
  }
  return num;
}


