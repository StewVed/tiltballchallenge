//mousewheel event, based on the all-encompassing mozDev version
var mouseWheelType = 'onwheel' in document.createElement('div') ? 'wheel' : document.onmousewheel ? 'mousewheel' : 'DOMMouseScroll';

var gameWindow, //vars to hold variables for the window
    gameVars, // vars for the game itself
    gameSprite; // a var to hold the sprite image for the game.

/*
 * Keys to ignore... alt-tab is annoying, so don't bother with alt for example
 * 16 = shift
 * 17 = Ctrl
 * 18 = Alt (and 17 if altGr)
 * 91 = windows key
 * 116 = F5 - browser refresh
 * 122 = F11 - Full Screen Toggle
*/
var keysIgnore = [0, 16, 17, 18, 91, 116, 122];
/*
 * left,up,right,down,A,B,X,Y   you can add more should your game require it.
*/
var keysDefault = [37, 38, 39, 40, 0, 0, 0, 0];
/*
 * the currently used keys are loaded on init
*/
var keysCurrent = [0, 0, 0, 0, 0, 0, 0, 0];


//Input events vars to hold the event info:
var inputType; // touch|gamePad|mouse|keyboard - depending on game type you could add GPS or whatever else HTML supports...
//Mouse:
var mouseVars = [];
//Gamepad:
var gamePadVars = [];
//keyboard:
var keyVars = [];
//For touch-enabled devices
var touchVars = []; //global array to handle ongoing touch events
//DeviceOrientation
//var turnPitchYaw = {'alpha':0, 'beta':0, 'gamma':0};
//Device Movement (acceleration), and deviceOrientataion in one :)
var deviceVars = {
  accelerationIncludingGravity:{x:0, y:0, z:0},
  acceleration:{x:0, y:0, z:0},
  rotationRate:{alpha:0, beta:0, gamma:0},
  orientation:{alpha:0, beta:0, gamma:0},
  interval:0
}

// Create the main sound var
var WinAudioCtx = new (window.AudioContext || window.webkitAudioContext); //webkit prefix for safari according to caniuse
//add a global volume control variable, set to 50% for the moment.
var globVol = .5;


/*
 * To make the game run when the JS file is loaded, we would call the init function:
 * Init();
 * but because I am using a loader which tracks the loading of the images and sounds, Init is called by that.
*/

function Init() {
  gameWindow = {
    initWidth:640, initHeight:360, width:0, weight:0, scale:1
  };

  gameVars = {
    tWoz:0, tFrame:0, running:0,
    gameBack:null, gameMain:null, gameFore:null,
    gameBackCTX:null, gameMainCTX:null, gameForeCTX:null,
    ball:{width:32, height:32, flinging:0, posiX:0, posiY:1, speedX:0.0001, speedY:0.0001},
    sound:null, sprite:null
  };

  //center the ball to the game area:
  gameVars.ball.posiX = ((gameWindow.initWidth / 2) - (gameVars.ball.width / 2));
  gameVars.ball.posiY = ((gameWindow.initHeight / 2) - (gameVars.ball.height / 2));
  
  //Create the canvas elements for the game:
  document.getElementById('gameContainer').innerHTML =
  '<canvas id="gameSprite" style="position:absolute;"></canvas>' +
  '<canvas id="gameBack" style="position:absolute;margin:0;left:0;"></canvas>' +
  '<canvas id="gameMain" style="position:absolute;margin:0;left:0;"></canvas>' +
  '<canvas id="gameFore" style="position:absolute;margin:0;left:0;"></canvas>';

  //Add event listeners to the game elenemt
  addEventListeners();
  //Initialize the mouse event
  mouseClear();

  /*
   * I will assume that making a permanent var of elements means faster access to them...
  */

  //make a link to the game areas in memory for quicker access:
  gameVars.sprite = document.getElementById('gameSprite');
  gameVars.gameBack = document.getElementById('gameBack');
  gameVars.gameMain = document.getElementById('gameMain');
  gameVars.gameFore = document.getElementById('gameFore');

  //Make links to the 2D contexts of each canvas
  gameVars.spriteCTX = gameVars.sprite.getContext('2d');
  gameVars.gameBackCTX = gameVars.gameBack.getContext('2d');
  gameVars.gameMainCTX = gameVars.gameMain.getContext('2d');
  gameVars.gameForeCTX = gameVars.gameFore.getContext('2d');

  //for the moment, just use the default keyset:
  keysCurrent = keysDefault;


  //generate sounds natively
  //create waveforms for sounds? for example soundBeep('sine', 1000, 1, 75);
  /*
   * example for ogg and mp3: - stupidly, not all devices support either, so you gotta use both!
   * gameVars.sound1 = document.createElement('audio');
   * gameVars.sound1.src = 'sounds/1.mp3';
   * gameVars.sound1.src = 'sounds/1.ogg';
   *
   * call it by doing
   * soundPlay(gameVars.sound1, 0); //0 is the startTime of the sound.
  */
  
  //make sure that the window is focused.
  window.blur();
  window.setTimeout(function(){window.focus()}, 0);
  

  InitSet();
}


function InitSet() {
  //this can be used for reseting as well as the initial setup.
  window.clearInterval(gameVars.tFrame);
  gameVars.score = 0;

  //Draw sprites onto offscreen canvas or maybe use svg images? afik they are pretty much the same thing.
  resizeGame();

  gameVars.tWoz = new Date().getTime();
  gameMainLoop();
}

function addEventListeners() {
  var zElem = document.getElementById('gameFore');
  //window.addEventListener('error', Win_errorHandler, false); //now done from the main index.html file
  window.addEventListener('resize', resizeGame, false);
  /*
   * I only want to pick up input events on the game,
   * if this doesn't work, go back to window/document
   * and use blur/focus/pause.
   */
  window.addEventListener('contextmenu', bubbleStop, false);
  window.addEventListener('dblclick', bubbleStop, false);
  //all below used to be document.getElementById('Wallpaper')
  window.addEventListener(mouseWheelType, mouseWheel, false);

  zElem.addEventListener('touchstart', touchDown, false);
  zElem.addEventListener('touchmove', touchMove, false);
  //zElem.addEventListener('touchcancel', touchUp, false);
  zElem.addEventListener('touchend', touchUp, false);
  zElem.addEventListener('touchleave', touchUp, false);

  zElem.addEventListener('mousedown', mouseDown, false);
  zElem.addEventListener('mousemove', mouseMove, false);
  zElem.addEventListener('mouseup', mouseUp, false);

  window.addEventListener('keydown', keyDown, false);
  window.addEventListener('keyup', keyUp, false);

  //hopefully this will let me pause/resume depending on whether
  //the game element is focused.
  //proilly have to be canvasFore element - dunno cos of bubbling.
  //document.getElementById('gameFore').addEventListener('focus', function(){gamePause(1)});
  window.addEventListener('blur', gamePause, true);
  /*
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', deviceOrient);
  }
  */
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMove);
  }
}
