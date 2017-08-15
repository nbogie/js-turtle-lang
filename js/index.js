"use strict";

var gProgram = [];
var gTurtle;
var gLoopPoints = [];

function Turtle(x0, y0) {
  this.x = 0;
  this.y = 0;
  this.px = 0;
  this.py = 0;
  this.direction = 0;
  this.penColor = 0;
  this.penState = 0;

  this.setPenColor = function(r,g,b) {
    this.penColor = color(r,g,b);
  };

  this.reset = function() {
    this.penState = 1;
    this.penColor = color("blue");
    this.x = x0;
    this.y = y0;
    this.px = this.x;

    this.py = this.y;
    this.direction = 0;
  };

  this.penUp = function() {
    this.penState = 0;
  };
  this.penDown = function() {
    this.penState = 1;
  };

  this.penToggle = function() {
    this.penState = 1 - this.penState;
  };

  this.reset();

  this.back = function(arg) {
    this.forward(-arg);
  };

  this.forward = function(arg) {
    this.y += arg;

    if (this.penState == 1) {
      stroke(this.penColor);      
      line(this.px, this.py, this.x, this.y);
    }
    this.py = this.y;
    this.px = this.x;
  };

  this.left = function(arg) {
    translate(this.x, this.y);
    rotate(-arg);
    translate(-this.x, -this.y);
    fill("green");
    ellipse(this.x, this.y, 10, 10);
  };

  this.right = function(arg) {
    this.left(-arg);
  };
  this.drawHead = function() {
    fill("yellow");
    stroke("orange");
    triangle(this.x, this.y, this.x - 8, this.y - 16, this.x + 8, this.y - 16);
  };

  this.executeCmd = function(cmd) {
    stroke(0);
    strokeWeight(4);
    var arg = parseFloatOrRandom(cmd[1]);
    switch (cmd[0]) {
      case "forward":
        this.forward(arg);
        break;
      case "back":
        this.back(arg);
        break;
      case "left":
        this.left(arg);
        break;
      case "right":
        this.right(arg);
        break;
      case "penUp":
        this.penUp();
        break;
      case "penDown":
        this.penDown();
        break;
      case "color":
        this.setPenColor(parseFloatOrRandom(cmd[1]), 
                  parseFloatOrRandom(cmd[2]), 
                  parseFloatOrRandom(cmd[3]));
        break;
      default:
        break;
    }
  };
}


function parseLine(line) {  
  return line.trim().toLowerCase().split(" ");
}

function parseProgram(str) {
  var prog = str.split("\n").map(parseLine);
  return prog;
}

function parseAndExecuteProgram() {
  clear();
  var text = select("#programTA").value();
  var prog = parseProgram(text);
  if (prog) {
    gProgram = prog;
    executeProgram();
  } else {
    console.log("Error in parsing program.  See log.");
  }
}
function relevantToFlow(item){
  return item[0] === "repeat";
}

function executeProgram() {
  gLoopPoints = [];
  gTurtle.reset();
  push();
  var ix = 0;
  var count = 0;
  
  while (ix < gProgram.length && count < 100) {
    var item = gProgram[ix];    
    if (item[0] === 'repeat') {
        gLoopPoints.push([1+ix, parseFloatOrRandom(item[1])]);
        console.log("REPEAT FOUND: " + gLoopPoints);
        ix++;
    } else if (item[0] === ']') {
      var current = gLoopPoints.pop();
      console.log("go back to " + current + " ? ");
      if (current[1] > 0) {
          console.log(current[1] + " > 0 so yes ");

          ix = current[0];
        gLoopPoints.push([ix, current[1] - 1]);
        console.log('gLoopPoints is now: ' + gLoopPoints);
      } else {
        ix++;
      }
    } else {
      gTurtle.executeCmd(item);
      ix++;
    }
    count++;
  }
  gTurtle.drawHead();
  pop();
}

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5CanvasParent");

  select("#runBtn").mousePressed(parseAndExecuteProgram);
  select("#clearBtn").mousePressed(clearProgram);
  select("#backBtn").mousePressed(addBack);
  select("#forwardBtn").mousePressed(addForward)
  select("#leftBtn").mousePressed(addLeft);
  select("#rightBtn").mousePressed(addRight);

  angleMode(DEGREES);
  
  gTurtle = new Turtle(width / 3, height / 3);
  noLoop();
}

function clearProgram() {
  gProgram = [];
  draw();
}

//the draw() function is run EVERY frame
function draw() {
  background("white");
  noStroke();

  displayTexts(programToText(gProgram), 12, 30, 30);
  executeProgram();
}

function displayTexts(txts, size, x, y) {
  var yCursor = y;
  txts.forEach(function(t) {
    textSize(size);
    text(t, x, yCursor);
    yCursor += 20;
  });
}

function programToText(prg) {
  var buf = [];
  function toStr(obj) {
    return ""+obj;
  }
  for (var i = 0; i < prg.length; i++) {
    buf.push(prg[i].map(toStr).join(' '));
  }
  return buf;
}

function addLeft() {
  gProgram.push(["left", 45]);
  draw();
}
function addRight() {
  gProgram.push(["right", 45]);
    draw();
}
function addForward() {
  gProgram.push(["forward", 40]);
    draw();
}
function addBack() {
  gProgram.push(["back", 40]);
    draw();
}
function keyPressed() {
  var handled = true;
  switch (keyCode) {
    case LEFT_ARROW:
      addLeft();
      break;
    case RIGHT_ARROW:
      addRight();
      break;
    case UP_ARROW:
      addForward();
      break;
    case DOWN_ARROW:
      addBack();
      break;
    case ENTER:
      executeProgram();
      break;
    case BACKSPACE:
      clearProgram();
      break;
    default:
      handled = false;
      break;
  }
  draw();
  return true; 
  //TODO: don't "handle" cursor keypressed if the focus is in the program text - we want those to move the cursor around.  DO "handle" them otherwise.  By returning false will prevent these arrows causing scrolling on the canvas container.
}

//REFERENCES:
//  P5 DOM Tutorial - https://github.com/processing/p5.js/wiki/Beyond-the-canvas

function parseFloatOrRandom(str) {
  if (str && str.length > 0 && str.charAt(0) === 'r') {
  if (str.charAt(1) === 'r') {
    var bounds = str.slice(2).split(':').map(parseFloat);
    return random(bounds[0], bounds[1]);
  } else {
    return random(parseFloat(str.slice(1)));    
  }
  } else {
    return parseFloat(str);
  }
}