// 'capture' will be a reference to our video DOM element
let capture;
// position & dimensions of our character
let xPos = 35;
let yPos = 425;
let size = 50;

let floorY = 450;
let speed = 6;

let player;
let box2;
let stop;
let gameBegin;
let gameOver;
let stopTimer;

// Classifier Variable
let classifier;

// Model URL
// let imageModelURL = 'https://teachablemachine.withgoogle.com/models/XPQoquOqG/';
let imageModelURL = 'tm-my-image-model-3/';

// Video
let video;
let flippedVideo;
// To store the classification
let label = "";
let prevLabel ="";

let p1 = 0;
let p2 = 640;

// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
  pikachu = loadImage('images/pikachu.png');
  enemy = loadImage('images/enemy.png')
  bgImage = loadImage('images/background.png')
}


function setup() {
  var canvasMain = createCanvas(640,480);
    // set the ID on the canvas element
  canvasMain.id("p5_mainCanvas");
  // set the parent of the canvas element to the element in the DOM with
  // an ID of "left"
  canvasMain.parent("#center");
  // Create the video
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  flippedVideo = ml5.flipImage(video);
  // Start classifyingww
  classifyVideo();


  player = new Player(35,425,50);
  box = new Obstacle(450,425,70,3);
  box2 = new Obstacle(450,425,70,2);
  gameOver = false;
  gameBegin = false;
  stop = false;

}

function draw() {
  if(label!=prevLabel && label == "FINGERS"){
    stopTimer = 6;
  }
  image(bgImage, p1, 0);
  image(bgImage, p2, 0);

  // move both positions a little bit to the left
  p1 -= 2;
  p2 -= 2;

  // did one of the backgrounds move fully off screen?
  if (p1 <= -640) {
    // move it back to the right of p2
    p1 = p2 + 640;
    console.log("cycle p1");
  }
  if (p2 <= -640) {
    // move it back to the right of p1
    p2 = p1 + 640;
    console.log("cycle p2");
  }

  // Draw the video
  image(flippedVideo, 0, 0);

  // Draw the label
  fill(0);
  textSize(12);
  textAlign(CENTER);
  console.log(label)
  fill(0);
  text("Gesture: " + label, 578,25);


  if(label != ""){
    gameBegin = true;
  }

  // console.log(gameOver);
  if(gameBegin == true){
    if(gameOver == false){
      player.display();
      player.move();

      box.display();
      box.move();
      box.collision();

      box2.display();
      box2.move();
      box2.collision();
    }
    else{
      textSize(40);
      text("GAME OVER", 320, 240)
    }
  }
  else{
    textSize(40);
    text("LOADING...", 320, 240)
  }

  // noStroke();
  // draw the floor
  fill(128);
  rect(0,floorY,width,height);
  prevLabel = label;
}

class Obstacle{
  constructor(x,y,size, speed){
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
  }
  display(){
    fill(120);
    imageMode(CENTER);
    image(enemy,this.x,this.y-5, this.size, this.size )
    imageMode(CORNER);
    // rect(this.x,this.y-this.size/2,this.size);

    this.Top = this.y-this.size/2 -1;
    this.Bottom = this.y+this.size/2 -1;
    this.Right = this.x+this.size/2 +1;
    this.Left = this.x - this.size/2-1;

    // fill(255);
    // ellipse(this.x+size/2, this.Top, 5,5)
    // ellipse(this.x+size/2, this.Bottom, 5,5)
    // ellipse(this.Right, this.y, 5,5)
    // ellipse(this.Left, this.y, 5,5)
  }
  move(){
    this.x-= this.speed;

    if(this.x <= 0){
      this.x = 600;
    }

  }

  collision(){
    if (!(player.Top > this.Bottom || player.Left > this.Right || player.Right < this.Left || player.Bottom < this.Top)){
      player.health -=10;
      this.x = 600;
      if(player.health <= 0){
        gameOver = true;
      }
    }
  }

}

class Player{
  constructor(x,y,size){
    this.x = x;
    this.y = y;
    this.size = size;
    this.health = 100;
    // jumping power -- this is how fast we should be moving up into the air when jumping
    this.jumpMode = false;
    this.jumpPower = 0;

    // gravity -- this will slightly reduce jump power every frame, eventually causing our
    // character to fall back to the ground
    this.gravity = 0.2;
  }

  move(){
    // movement mechanics - left and right
    if (keyIsDown(65)) {
      this.x -= speed;
    }
    if (keyIsDown(68)) {
      this.x  += speed;
    }

    if (label == "FINGERS") {
      stop = true;
      this.jumpPower = this.gravity;
    }
    else{
      stop = false;
    }

    // movement mechanics - initiate a jump
    if (label == "HAND" && this.jumpMode === false) {
      this.jumpMode = true
      this.jumpPower = -8
    }

    if (stop == false){
      // handle jumping
      if (this.jumpMode) {
        // adjust y position of character based on jumpPower
        this.y += this.jumpPower;

        // degrade jump power slightly using gravity
        this.jumpPower += this.gravity;
        // console.log("JUMPING")
        // did we go through the floor?  if so, stop jumping and put the player onto the floor
        if (this.y +this.size/2 >= floorY) {
          // console.log(this.y+this.size/2)
          this.y = floorY-this.size/2;
          this.jumpMode = false;
          this.jumpPower = 0;
        }
      }
    }
    else{
      if(frameCount % 30==0){
        stopTimer -=1;
      }
      if(stopTimer <=0){
        gameOver = true;
      }
      text("Timer: " + stopTimer, 578, 65)
    }

    if((xPos + this.size/2)>width){
      this.x =  width -  this.size/2;
    }
    if((xPos - this.size/2)<0){
      this.x = this.size/2;
    }
  }

  display(){
    fill(0);
    imageMode(CENTER);
    image(pikachu,this.x,this.y, this.size, this.size*1.36)
    imageMode(CORNER);
    // circle(this.x,this.y,this.size);
    textSize(13);
    text("Health: " + this.health + "%", 585, 45)


    this.Top = this.y-this.size/2 -1;
    this.Bottom = this.y+this.size/2 -1;
    this.Right = this.x + this.size/2 -1;
    this.Left = this.x -this.size/2 -1;
  }

}

// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video)
  classifier.classify(flippedVideo, gotResult);
  flippedVideo.remove();

}

// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
  // Classifiy again!
  classifyVideo();
}


function keyPressed(){
  if(keyCode == 83){
    stopTimer = 6;
  }
}
