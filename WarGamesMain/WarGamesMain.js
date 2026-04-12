
/*****TITLE SCREEN VARS*********/
var state;
var loading;
var screenCol; 
var backimg;
var scaleMult;
var barCount;
var clicked;
var dots;
var texts = ["GREETINGS PROFESSOR FALKEN", "SHALL WE PLAY A GAME?"]
var index
var displayText;
var writing;
var textInput = ""; 
/*************LOBBY AND SUCCESS****************/
let screen = "lobby"
let typedText = "";
let correctPassword = "open123";
let message = "";
/***********************************************/
function preload() {
  /****TITLE SCREEN PRELOAD****/
   backimg = loadImage("computerscreen.png"); 
   myFont = loadFont("VT323-Regular.ttf");
  /****************************/
}

function setup() {
  /****TITLESCREEN SETUP******/
   createCanvas(700, 650) 
   scaleMult = 1;
   colorMode(HSB, 360, 100, 100, 100)
   clicked = false; 
   state = 0;
   textFont(myFont);
   loading = true;
   screenCol = "rgb(52, 62, 87)";
   dots = 1;
   index = 0;
   writing = false;
  /***************************/
}


function draw() {
  if (state === 0) {
    titleScreen()
  } if (state === 1) {
   successlobby() 
   
  }

}


/***************SCREENS******************/
function titleScreen() {
    imageMode(CENTER)
    rectMode(CENTER);
        
    background(255)
    translate(width/2, height/2);
    scale(scaleMult)
    
    drawingContext.shadowBlur = 0
    fill(screenCol)
    rect(0, 0, 70, 50)
    
    image(backimg, 0, 10, 100, 100);   
    
    if (clicked) {
      if(scaleMult < 10) {
        scaleMult += 0.1;
      } else {
          if (loading) {  
                screenCol = "rgb(0,0,0)"
                drawingContext.shadowBlur = 100
                drawingContext.shadowColor = "rgb(255, 255, 255)"
                textSize(10)
                fill("rgb(232, 237, 250)")
                textAlign(CENTER, CENTER)
                for (var i = 0; i < 5; i++) {
                 text("Loading", 0, -10)  
                }
                
                if (frameCount % 60 == 0) {
                 if (dots != 3) {
                   dots++ 
                 } else {
                   dots = 1; 
                 }
                 
                }
                if (dots == 1) {
                   text(".", 0, -5)
                 } else if (dots == 2) {
                   text("..", 0, -5) 
                 } else {
                   text("...", 0, -5)
                 }
             if (frameCount == 480) {
               loading = false; 
             }
          } else {

            textAlign(LEFT, CENTER);
            drawingContext.shadowBlur = 50;
            drawingContext.shadowColor = "rgb(255, 255, 255)";
            textSize(3);
            fill("rgb(232, 237, 250)");
            if (frameCount % 10 == 0) {
              if (index <= texts[1].length) {
               displayText = texts[1].substring(0, index++)
               if (index < texts[1].length) {
                  displayText = displayText + "_" 
               }
              } else {
                writing = true; 
              }
            }
            text(displayText, -25, -20);
            if (writing) {
              text(textInput + "_", -25, -15)
            }
              
          }
      }
    }
}

function successlobby() {
  background(500);
  
  if (screen == "lobby") {
    drawDesk();
  } else if (screen == "challenge one") {
    background(255)
    drawPasswordScreen();
  } else if (screen == "success") {
    drawSuccessScreen();
  }
}
/*******************USER INPUT*************/
function keyTyped() {
  
  if (state === 0) {
    if (writing) {
     if (key.length === 1) {
        textInput += key.toUpperCase();
        startWidth = textInput; 
      } 
    }
  }
}

function mouseClicked() {
  if (state === 0) {
   if (mouseX <= 450 && mouseX >= 250 
           && mouseY <= 460 && mouseY >= 260) {
         clicked = true; 
      }
  } else if (state === 1) {
      let exitCondition = mouseX >= 30 && mouseX < 100 && mouseY >= 580 && mouseY < 630
  
  
  if (screen == "challenge one") {
    if (exitCondition) {
      screen = "lobby"
    }
  } else if (screen == "lobby") {
      screen = "challenge one"
  }
}
    
  
}

function keyPressed() {
  if (state === 0) {
    if (keyCode === BACKSPACE) {
      textInput = textInput.substring(0, textInput.length - 1);
    }
  
    if (keyCode === ENTER) {
      if(textInput === "YES") {
        state = 1;
      }
    }
  } else if (state === 1) {
      if (screen !== "challenge one") {
    return;
  }

  if (keyCode === BACKSPACE) {
    typedText = typedText.substring(0, typedText.length - 1);
  } else if (keyCode === ENTER || keyCode === RETURN) {
    if (typedText === correctPassword) {
      message = "ACCESS GRANTED";
      screen = "success";
    } else {
      message = "ACCESS DENIED";
      typedText = "";
    }
  } else if (key.length === 1) {
    typedText += key;
  }
    
    
    
  }
 
}



/************HELPERS****************/
function drawDesk() {
  let s = 1.66;

  line(0*s, 300*s, 30*s, 250*s);
  line(400*s, 300*s, 370*s, 250*s);
  line(0*s, 330*s, 400*s, 330*s);
  line(30*s, 250*s, 370*s, 250*s);

  line(0*s, 310*s, 400*s, 310*s);
  line(300*s, 330*s, 300*s, 400*s);

  rect(335*s, 350*s, 50*s, 10*s);
}

function drawPasswordScreen() {
  background(255);
  fill(0, 255, 0);
  textSize(24);

  text("> ENTER PASSWORD:", 30, 80);
  
  text("Exit", 30, 600)
  

  let hiddenText = "";
  for (let i = 0; i < typedText.length; i++) {
    hiddenText += typedText[i];
  }

  text("> " + hiddenText, 30, 130);

  textSize(18);
  text(message, 30, 190);
}

function drawSuccessScreen() {
  background(255);
  fill(0, 255, 0);
  textSize(24);
  text("> ACCESS GRANTED", 30, 80);
}
