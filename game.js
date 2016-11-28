var rubbing = .75;
var squidgy = .50;

function gameCollisions() {
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
    gameVars.ball.posiX = -gameVars.ball.posiX;
    // for instance, if it was -3, it will now be + 3
    gameVars.ball.speedX = -(gameVars.ball.speedX * squidgy);
    //give the ball some shock absorbtion and reverse it
    //advanced physics stuff could be done with ball spin, and other 'real' variables if you want.
    soundBeep('sine', 750, 1, 100);
  }
  // Check for right wall:
  if (gameVars.ball.posiX >= (gameWindow.initWidth - gameVars.ball.width)) {
    gameVars.ball.posiX = (gameWindow.initWidth - gameVars.ball.width) + ((gameWindow.initWidth - gameVars.ball.width) - gameVars.ball.posiX);
    gameVars.ball.speedX = 0 - (gameVars.ball.speedX * squidgy);
    soundBeep('sine', 750, 1, 100);
  }
  // Check for Ceiling:
  if (gameVars.ball.posiY <= 0) {
    gameVars.ball.posiY = -gameVars.ball.posiY;
    gameVars.ball.speedY = -(gameVars.ball.speedY * squidgy);
    soundBeep('sine', 1000, 1, 100);
  }
  //Check for floor:
  if (gameVars.ball.posiY >= (gameWindow.initHeight - gameVars.ball.height)) {
    gameVars.ball.posiY = (gameWindow.initHeight - gameVars.ball.height) + ((gameWindow.initHeight - gameVars.ball.height) - gameVars.ball.posiY);
    gameVars.ball.speedY = -(gameVars.ball.speedY * squidgy);
    soundBeep('sine', 500, 1, 100);
  }
  // extra stuff here, like walls, objects, etc,
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
  var frameTime = (tNow - gameVars.tWoz);
  gameVars.tWoz = tNow;
  if (frameTime > 0 && !gameVars.paused) {
    //update any gamepads here; the mouse, touch, and keyboard inputs are updated as they change.
    gamePadUpdate();
    gameMoveBall(frameTime / 500);
    gameCollisions();
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
  gameVars.gameForeCTX.fillStyle = '#4f3';

  var textHeight = parseFloat(gameVars.gameForeCTX.font) * 2 ;
  
  devStuff = 'accelWithGrav (m/s2) ';
  devStuff += 'x ' + deviceVars.accelerationIncludingGravity.x.toFixed(2) + ' | ';
  devStuff += 'y ' + deviceVars.accelerationIncludingGravity.y.toFixed(2)  + ' | ';
  devStuff += 'z ' + deviceVars.accelerationIncludingGravity.z.toFixed(2) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 1));
   
  devStuff = 'acceleration     (m/s2) ';
  devStuff += 'x ' + deviceVars.acceleration.x.toFixed(2)  + ' | ';
  devStuff += 'y ' + deviceVars.acceleration.y.toFixed(2)  + ' | ';
  devStuff += 'z ' + deviceVars.acceleration.z.toFixed(2) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 2));

  devStuff = 'rotationRate     (°/s)    ';
  devStuff += 'a ' + deviceVars.rotationRate.alpha.toFixed(2)  + ' | ';
  devStuff += 'b ' + deviceVars.rotationRate.beta.toFixed(2)  + ' | ';
  devStuff += 'g ' + deviceVars.rotationRate.gamma.toFixed(2) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 3));

  devStuff = 'orientation        (°)       ';
  devStuff += 'a ' + deviceVars.orientation.alpha.toFixed(2)  + ' | ';
  devStuff += 'b ' + deviceVars.orientation.beta.toFixed(2)  + ' | ';
  devStuff += 'g ' + deviceVars.orientation.gamma.toFixed(2) ;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 4));

  devStuff = 'interval             (ms?) ' + deviceVars.interval;
  gameVars.gameForeCTX.fillText(devStuff, 3, (textHeight * 5));
}

function gameMoveBall(frameTime) {
  /*
  //this should mean you can move the ball about kind of as a ixed inertia object!
  gameVars.ball.speedX += deviceVars.accelerationIncludingGravity.x;
  gameVars.ball.speedY += deviceVars.accelerationIncludingGravity.y;
  */
  //this should ber more like a spirit level, which is the original idea by Belinda Robinson;
  gameVars.ball.speedX += deviceVars.orientation.beta;
  gameVars.ball.speedY += -deviceVars.orientation.gamma;

  //add ball friction... depends on the ball type of course.
  gameVars.ball.speedX *= rubbing;
  gameVars.ball.speedY *= rubbing;


  gameVars.ball.posiX += (gameVars.ball.speedX * frameTime);

  gameVars.ball.posiY += (gameVars.ball.speedY * frameTime);
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
function soundBeep(type, frequency, volume, duration) {
  var zOscillator = WinAudioCtx.createOscillator();
  var zGain = WinAudioCtx.createGain();
  zOscillator.connect(zGain);
  zGain.connect(WinAudioCtx.destination);
  zOscillator.type = type;
  //default = 'sine' — other values are 'square', 'sawtooth', 'triangle' and 'custom'
  zOscillator.frequency.value = frequency;
  zGain.gain.value = volume;
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
