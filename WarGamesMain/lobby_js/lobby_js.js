let screen = "challenge one"
let typedText = "";
let correctPassword = "open123";
let message = "";

function setup() {
  createCanvas(664, 664);
}

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



function draw() {
  background(500);
  
  if (screen == "lobby") {
    drawDesk();
  } else if (screen == "challenge one") {
    background(0)
    drawPasswordScreen();
  } else if (screen == "success") {
    drawSuccessScreen();
  }
}


function drawPasswordScreen() {
  background(0);
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
  background(0);
  fill(0, 255, 0);
  textSize(24);
  text("> ACCESS GRANTED", 30, 80);
}

function keyPressed() {
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
