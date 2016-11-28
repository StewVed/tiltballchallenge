function gameCollisions(frameTime) {
  var volProp = .005;

  //quick local var for the ball
  /*
   * ball.posiX = Left-based position of the ball
   * ball.posiY = Top-based position of the ball
   * ball.speedX = speed Right; minus goes left, positive goes right
   * ball.speedY = speed down; minus goes up, positive goes down
   * ball.width = width of the ball
   * ball.height = height of the ball
   *
   * gameWindow.width|height = the size of the game area
  */
  // Check for Left Wall:
  if (gameVars.ball.posiX <= 0) {
    var zVol = soundProportion(gameVars.ball.speedX * volProp);
    var poziSpeed = ballBounce(0, frameTime, gameVars.ball.speedX, gameVars.ball.posiX);
    gameVars.ball.posiX = poziSpeed.zPozi;
    gameVars.ball.speedX = poziSpeed.zSpeed; 
    soundBeep('sine', 750, zVol, 100);
  }
  // Check for right wall:
  if (gameVars.ball.posiX >= (gameWindow.initWidth - gameVars.ball.width)) {
    var zVol = soundProportion(gameVars.ball.speedX * volProp);
    var poziSpeed = ballBounce((gameWindow.initWidth - gameVars.ball.width), frameTime, gameVars.ball.speedX, gameVars.ball.posiX);
    gameVars.ball.posiX = poziSpeed.zPozi;
    gameVars.ball.speedX = poziSpeed.zSpeed; 
    soundBeep('sine', 750, zVol, 100);
  }
  // Check for Ceiling:
  if (gameVars.ball.posiY <= 0) {
    var zVol = soundProportion(gameVars.ball.speedY * volProp);
    var poziSpeed = ballBounce(0, frameTime, gameVars.ball.speedY, gameVars.ball.posiY);
    gameVars.ball.posiY = poziSpeed.zPozi;
    gameVars.ball.speedY = poziSpeed.zSpeed;
    soundBeep('sine', 1000, zVol, 100);
  }
  //Check for floor:
  if (gameVars.ball.posiY >= (gameWindow.initHeight - gameVars.ball.height)) {
    var zVol = soundProportion(gameVars.ball.speedY * volProp);
    var poziSpeed = ballBounce((gameWindow.initHeight - gameVars.ball.height), frameTime, gameVars.ball.speedY, gameVars.ball.posiY);
    gameVars.ball.posiY = poziSpeed.zPozi;
    gameVars.ball.speedY = poziSpeed.zSpeed;
    soundBeep('sine', 500, zVol, 100);
  }
  // extra stuff here, like walls, objects, etc,
}

function gameCollisionCheckX() {
  var y = 0;
  // Check for Left Wall:
  if (gameVars.ball.posiX <= 0) {
    y = 1;
  }
  // Check for right wall:
  if (gameVars.ball.posiX >= (gameWindow.initWidth - gameVars.ball.width)) {
    y = 1;
  }
  return y;
}

function gameCollisionCheckY() {
  var y = 0;
  // Check for Ceiling:
  if (gameVars.ball.posiY <= 0) {
    y = 1;
  }
  //Check for floor:
  if (gameVars.ball.posiY >= (gameWindow.initHeight - gameVars.ball.height)) {
    y = 1;
  }

  if (y) {
    y = gameVars.ball.speedY;
  }

  return y;
}
function ballBounce(zEdge, frameTime, zSpeed, zPozi) {
  //emulate energy loss from heat, sound, inertia(?), conversion from kinetic to potential, then back, etc. as the ball bounces:
  //just take a guess at 10% loss of energy for the moment :)
  var squidgy = .9;

  //the position of the ball at the last frame
  var ballMovedlastFrame = -(zSpeed * frameTime);
  //how much is left over from when the ball contacted the edge:
  var bounceAmount = zEdge - zPozi;
  //find the percentage of how much of the ball's movement this frame was over the edge.
  var bouncePercent = (bounceAmount / ballMovedlastFrame);

  //Reverse ball's direction, and apply squidgy to take off some kinetic energy from the bounce:
  zSpeed = -(zSpeed * squidgy);

  var newPoz = zEdge + ((zSpeed * frameTime) * bouncePercent);
  //simple thing to emulate a ball's bounce being able to absorb some of the rebound by deforming.
  if (zSpeed > -1 && zSpeed < 1) {
    //essentialy, if the ball's [kinetic momentum/energy potential] is less than a number,
    //the ball will no longer bounce off the surface; that momentum would continue to 
    //deform the ball until all kinetic and potential are measurably lost by the squidgy.
    newPoz = zEdge;
    zSpeed = 0;
  }

  /*
    As I understand it, the actual process of a ball bouncing, is that the ball's
    momentum is converted over a small amount of time from kinetic to potential energy
    by the deformation of the ball.

    Potential energy woule be stored in the compression of the axis perpendicular to the
    surface, and expansion of the other axis.
    
    The force of the potential energy then takes over, slowing the ball's momentum further.
    
    Once there is no kinetic momentum left, the potential begins moving the ball back to being circular.
    
    If there is more force than just getting the ball to stretch out, the ball moves off the surface.

    With a very rigid ball, the entire bounce would take place within milliseconds if not less than that.
  */
  
  return {zPozi, zSpeed};
}

function gameMainLoop() {
  if (!gameVars) {
    //happens when the window is closed.
    return;
  }
  /*
   * Find the amount of time that has gone by since last frams
  */
  var tNow = new Date().getTime();
  var frameTime = (tNow - gameVars.tWoz) / 100; //16ms would become .016s
  gameVars.tWoz = tNow;
  if (frameTime > 0 && !gameVars.paused) {
    //update any gamepads here; the mouse, touch, and keyboard inputs are updated as they change.
    gamePadUpdate();
    gameMoveBall(frameTime);
    gameCollisions(frameTime);
    gameRenderMain();

    showRawData();
  }
  gameVars.tFrame = window.requestAnimationFrame(function() {
    gameMainLoop()
  });
}

function showRawData() {

  gameVars.gameForeCTX.clearRect(0, 0, gameWindow.width, gameWindow.height);
  gameVars.gameForeCTX.font = '100% sans-serif';
  gameVars.gameForeCTX.fillStyle = 'hsla(120, 100%, 50%, .5)';

  var textHeight = parseFloat(gameVars.gameForeCTX.font) * 2 ;
    
  var devStuff = 'accelWithGrav (m/s2) ';
  devStuff += 'x ' + deviceVars.accelerationIncludingGravity.x.toFixed(1) + ' | ';
  devStuff += 'y ' + deviceVars.accelerationIncludingGravity.y.toFixed(1)  + ' | ';
  devStuff += 'z ' + deviceVars.accelerationIncludingGravity.z.toFixed(1) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 1));
  /*
  devStuff = 'acceleration     (m/s2) ';
  devStuff += 'x ' + deviceVars.acceleration.x.toFixed(1)  + ' | ';
  devStuff += 'y ' + deviceVars.acceleration.y.toFixed(1)  + ' | ';
  devStuff += 'z ' + deviceVars.acceleration.z.toFixed(1) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 2));

  devStuff = 'rotationRate     (°/s)    ';
  devStuff += 'a ' + deviceVars.rotationRate.alpha.toFixed(1)  + ' | ';
  devStuff += 'b ' + deviceVars.rotationRate.beta.toFixed(1)  + ' | ';
  devStuff += 'g ' + deviceVars.rotationRate.gamma.toFixed(1) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 3));

  devStuff = 'orientation        (°)       ';
  devStuff += 'a ' + deviceVars.orientation.alpha.toFixed(1)  + ' | ';
  devStuff += 'b ' + deviceVars.orientation.beta.toFixed(1)  + ' | ';
  devStuff += 'g ' + deviceVars.orientation.gamma.toFixed(1) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 4));

  devStuff = 'interval             (ms?) ' + deviceVars.interval;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 5));
  */
  gameVars.gameForeCTX.fillText('Xspeed: ' + gameVars.ball.speedX.toFixed(2), 3, (textHeight * 3));
  gameVars.gameForeCTX.fillText('Yspeed: ' + gameVars.ball.speedY.toFixed(2), 3, (textHeight * 4));
}

function gameMoveBall(frameTime) {
  //inertia - give the ball mass!
  //just shave off a little of the acceleration... you got the f=ma and p=mv equations
  //this should mean that speedX and Y are added to by the force applied to the ball, 
  //then friction is applied after that
  var zMass = .5;
  var zFriction = .98; 

  //how about checking to see if the ball is currently on a surface here?
  //both speeds are set to 0.0001 to begin with.
  if (gameVars.ball.speedX !== 0 && !gameCollisionCheckX()) {
    gameVars.ball.speedX += ((deviceVars.accelerationIncludingGravity.x * frameTime) * zMass);
    gameVars.ball.speedX *= zFriction;
    gameVars.ball.posiX += (gameVars.ball.speedX * frameTime);
  }

  if (!gameCollisionCheckY()) {
    gameVars.ball.speedY += ((deviceVars.accelerationIncludingGravity.y * frameTime) * zMass);
    gameVars.ball.speedY *= zFriction;
    gameVars.ball.posiY += (gameVars.ball.speedY * frameTime);
  }

  //this should mean you can move the ball about kind of as a fixed inertia object!
  //could do z as well, but this will be 2D... like the old games :)
  /*
  //this should be more like a spirit level, though could the angle be calculated from
  //the 3 axis of accelerationIncludingGravity?
  gameVars.ball.speedX += deviceVars.orientation.beta;
  gameVars.ball.speedY += -deviceVars.orientation.gamma;
  */

  
}
function gamePause(yes) {
  // needs a conditional to check for focus really
  if (yes) {}
  gameVars.paused = yes;
}
function gameRenderBack() {// use this canvas for backgrounds and paralax type stuff.
}
function gameRenderMain() {
  gameVars.gameMainCTX.clearRect(0, 0, gameWindow.width, gameWindow.height);
  var ballWidth = (gameVars.ball.width * gameVars.scale);
  //if height is different, do that too.
  gameVars.gameMainCTX.drawImage(//needs 3, 5, or 9 inputs, so if you clip then you need to stretch even if there is no stretch!!!! weird""
  gameVars.sprite, // Specifies the image, canvas, or video element to use
  0, // Optional. The x coordinate where to start clipping
  0, // Optional. The y coordinate where to start clipping
  ballWidth, // Optional. The width of the clipped image
  ballWidth, // Optional. The height of the clipped image
  (gameVars.ball.posiX * gameVars.scale), // The x coordinate where to place the image on the canvas
  (gameVars.ball.posiY * gameVars.scale), // The y coordinate where to place the image on the canvas
  ballWidth, // Optional. The width of the image to use (stretch or reduce the image)
  ballWidth // Optional. The height of the image to use (stretch or reduce the image)
  );
}
function gameRenderFore() {
  // Use this canvas for scores and messages.
  gameVars.gameForeCTX.font = '150% Arial';
  //
  gameVars.gameForeCTX.fillStyle = '#0f0';
  //proper green
  gameVars.gameForeCTX.textAlign = 'right';
  //
  //add the score, top-right with 3 pixels from edge
  gameVars.gameForeCTX.fillText('Score:' + gameVars.score, (gameVars.Width - 3), 3);
}

function soundProportion(zVol) {
  //make sure the volume is a positive number
  if (zVol < 0) {
    zVol = -zVol;
  }
  //make sure the volume isn't about 1 (Max)
  if (zVol > 1) {
    zVol = 1
  }
  return zVol;
}

function soundBeep(type, frequency, volume, duration) {
  var zOscillator = WinAudioCtx.createOscillator();
  var zGain = WinAudioCtx.createGain();
  zOscillator.connect(zGain);
  zGain.connect(WinAudioCtx.destination);
  zOscillator.type = type;
  //default = 'sine' — other values are 'square', 'sawtooth', 'triangle' and 'custom'
  zOscillator.frequency.value = frequency;
  zGain.gain.value = (volume * globVol);
  zOscillator.start();
  setTimeout(function() {
    zOscillator.stop()
  }, duration);
  //default to qurter of a second for the beep if no time is specified
}
function soundPlay(soundVariable, startTime) {
  /*
   * the example is just for a single sound
   * If you have all your sounds in a single file, then the startTime would be different.
  */
  soundVariable.pause();
  if (soundVariable.readyState > 0) {
    // maybe just set the currentTime regardless?
    soundVariable.currentTime = startTime;
  }
  soundVariable.play();
}
