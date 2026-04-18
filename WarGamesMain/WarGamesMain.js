
=======
//TODO:
//1. Change state names to be more descriptive

/*****TITLE SCREEN VARS*********/
var state;
var loading;
var screenCol;
var backimg;
var scaleMult;
var barCount;
var clicked;
var dots;
var texts = ["GREETINGS PROFESSOR FALKEN", "SHALL WE PLAY A GAME?"];
var index;
var displayText;
var writing;
var textInput = "";
var myFont;

/*************LOBBY AND SUCCESS****************/
let screen = "lobby";
let typedText = "";
let correctPassword = "open123";
let message = "";
let newspaperBuffer = null;   // caches the rendered newspaper
/***********************************************/

function preload() {
  backimg = loadImage("computerscreen.png");
  myFont = loadFont("VT323-Regular.ttf");
}

function setup() {
  createCanvas(700, 650);
  scaleMult = 1;
  colorMode(HSB, 360, 100, 100, 100);
  clicked = false;
  state = 0;
  textFont(myFont);
  loading = true;
  screenCol = "rgb(52, 62, 87)";
  dots = 1;
  index = 0;
  writing = false;
>>>>>>> Stashed changes
}

function draw() {
<<<<<<< Updated upstream

}
=======
  if (state === 0) {
    titleScreen();
  } else if (state === 1) {
    successlobby();
  }
}


/***************SCREENS******************/
function titleScreen() {
  imageMode(CENTER);
  rectMode(CENTER);

  background(255);
  translate(width / 2, height / 2);
  scale(scaleMult);

  drawingContext.shadowBlur = 0;
  fill(screenCol);
  rect(0, 0, 70, 50);

  image(backimg, 0, 10, 100, 100);

  if (clicked) {
    if (scaleMult < 10) {
      scaleMult += 0.1;
    } else {
      if (loading) {
        screenCol = "rgb(0,0,0)";
        drawingContext.shadowBlur = 100;
        drawingContext.shadowColor = "rgb(255, 255, 255)";
        textSize(10);
        fill("rgb(232, 237, 250)");
        textAlign(CENTER, CENTER);
        for (var i = 0; i < 5; i++) {
          text("Loading", 0, -10);
        }

        if (frameCount % 60 == 0) {
          if (dots != 3) {
            dots++;
          } else {
            dots = 1;
          }
        }
        if (dots == 1) {
          text(".", 0, -5);
        } else if (dots == 2) {
          text("..", 0, -5);
        } else {
          text("...", 0, -5);
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
            displayText = texts[1].substring(0, index++);
            if (index < texts[1].length) {
              displayText = displayText + "_";
            }
          } else {
            writing = true;
          }
        }
        text(displayText, -25, -20);
        if (writing) {
          text(textInput + "_", -25, -15);
        }
      }
    }
  }
}

function successlobby() {
  background(500);

  if (screen === "lobby") {
    drawDesk();
    drawDeskNewspaper();
    updateNewspaperHover();
  } else if (screen === "challenge one") {
    background(255);
    drawPasswordScreen();
  } else if (screen === "success") {
    drawSuccessScreen();
  } else if (screen === "newspaper") {
    drawNewspaperScreen();
  }
}


/*******************USER INPUT*************/
function keyTyped() {
  if (state === 0) {
    if (writing) {
      if (key.length === 1) {
        textInput += key.toUpperCase();
      }
    }
  }
}

function mouseClicked() {
  if (state === 0) {
    if (mouseX <= 450 && mouseX >= 250 &&
        mouseY <= 460 && mouseY >= 260) {
      clicked = true;
    }
    return;
  }

  if (state === 1) {
    let exitCondition = mouseX >= 30 && mouseX < 100 &&
                        mouseY >= 580 && mouseY < 630;

    if (screen === "challenge one") {
      if (exitCondition) {
        screen = "lobby";
      }
    } else if (screen === "lobby") {
      // prioritize newspaper click; otherwise fall through to the computer/challenge
      if (deskNewspaper.hovered) {
        screen = "newspaper";
      } else {
        screen = "challenge one";
      }
    } else if (screen === "newspaper") {
      // click anywhere to exit back to the lobby
      screen = "lobby";
    }
  }
}

function keyPressed() {
  if (state === 0) {
    if (keyCode === BACKSPACE) {
      textInput = textInput.substring(0, textInput.length - 1);
    }
    if (keyCode === ENTER) {
      if (textInput === "YES") {
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


/************PUZZLES****************/


/********Clues************/
let deskNewspaper = {
  x: 70,
  y: 430,
  w: 115,
  h: 78,
  hovered: false
};


/************HELPERS****************/
function drawDesk() {
  let s = 1.66;

  line(0 * s, 300 * s, 30 * s, 250 * s);
  line(400 * s, 300 * s, 370 * s, 250 * s);
  line(0 * s, 330 * s, 400 * s, 330 * s);
  line(30 * s, 250 * s, 370 * s, 250 * s);

  line(0 * s, 310 * s, 400 * s, 310 * s);
  line(300 * s, 330 * s, 300 * s, 400 * s);

  rect(335 * s, 350 * s, 50 * s, 10 * s);
}

function updateNewspaperHover() {
  deskNewspaper.hovered =
    mouseX >= deskNewspaper.x &&
    mouseX <= deskNewspaper.x + deskNewspaper.w &&
    mouseY >= deskNewspaper.y &&
    mouseY <= deskNewspaper.y + deskNewspaper.h;
}

// Draws the small newspaper sitting on the desk (a clickable thumbnail).
// Uses its own RGB color mode locally so the cream paper color renders correctly
// even though the main canvas is in HSB mode.
function drawDeskNewspaper() {
  push();
  colorMode(RGB, 255);
  rectMode(CORNER);

  const nx = deskNewspaper.x;
  const ny = deskNewspaper.y;
  const nw = deskNewspaper.w;
  const nh = deskNewspaper.h;

  // soft drop shadow
  noStroke();
  fill(0, 0, 0, 40);
  rect(nx + 3, ny + 3, nw, nh);

  // paper
  fill(246, 242, 232);
  stroke(40);
  strokeWeight(0.8);
  rect(nx, ny, nw, nh);

  // masthead
  noStroke();
  fill(20);
  textFont("Times New Roman");
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(9);
  text("Herald Tribune", nx + nw / 2, ny + 3);

  // double rule under masthead
  stroke(40);
  strokeWeight(0.4);
  line(nx + 4, ny + 17, nx + nw - 4, ny + 17);
  line(nx + 4, ny + 19, nx + nw - 4, ny + 19);

  // headline
  noStroke();
  fill(20);
  textStyle(BOLD);
  textSize(7);
  text("TITLE", nx + nw / 2, ny + 22);

  // rule under headline
  stroke(40);
  strokeWeight(0.3);
  line(nx + 4, ny + 32, nx + nw - 4, ny + 32);

  // three columns of mini lines suggesting body text
  noStroke();
  fill(60);
  const colW = (nw - 16) / 3;
  const widths = [1.0, 0.82, 0.92, 0.72, 0.88, 0.95];
  for (let c = 0; c < 3; c++) {
    const cx = nx + 5 + c * (colW + 3);
    for (let i = 0; i < 8; i++) {
      rect(cx, ny + 36 + i * 4, colW * widths[i % widths.length], 1);
    }
  }

  // vertical column dividers
  stroke(60);
  strokeWeight(0.3);
  line(nx + 4 + colW,         ny + 35, nx + 4 + colW,         ny + nh - 4);
  line(nx + 4 + 2 * colW + 3, ny + 35, nx + 4 + 2 * colW + 3, ny + nh - 4);

  // hover highlight
  if (deskNewspaper.hovered) {
    noFill();
    stroke(255, 220, 0);
    strokeWeight(1.5);
    rect(nx - 2, ny - 2, nw + 4, nh + 4);
  }

  pop();
}

// Full-size newspaper view, shown when the desk newspaper is clicked.
function drawNewspaperScreen() {
  push();
  colorMode(RGB, 255);

  background(40);

  // build once, cache thereafter
  if (newspaperBuffer === null) {
    newspaperBuffer = createGraphics(500, 600);
    newspaperBuffer.textFont("Times New Roman");
    buildNewspaper(newspaperBuffer);
  }

  imageMode(CORNER);
  image(newspaperBuffer, (width - 500) / 2, (height - 600) / 2);

  // hint to close
  fill(255);
  noStroke();
  textFont(myFont);
  textStyle(NORMAL);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("click anywhere to return", width / 2, height - 15);

  pop();
}

function drawPasswordScreen() {
  background(255);
  fill(0, 255, 0);
  textSize(24);

  text("> ENTER PASSWORD:", 30, 80);
  text("Exit", 30, 600);

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

function drawMiniLines(x, y, maxWidth, count, gap) {
  let widths = [1.0, 0.82, 0.92, 0.72, 0.88];
  rectMode(CORNER);
  for (let i = 0; i < count; i++) {
    let lineW = maxWidth * widths[i % widths.length];
    rect(x, y + i * gap, lineW, 2);
  }
}


function buildNewspaper(g) {
  g.background(255);

  // page
  g.fill(246, 242, 232);
  g.stroke(50);
  g.strokeWeight(1.2);
  g.rect(10, 10, 480, 580);

  addPaperTexture(g);

  // ===== masthead =====
  g.fill(20);
  g.noStroke();
  g.textAlign(CENTER, TOP);

  g.textSize(10);
  g.textStyle(NORMAL);
  g.text("NEW YORK", 250, 18);

  g.textSize(30);
  g.textStyle(BOLD);
  g.text("Herald Tribune", 250, 30);

  g.textSize(10);
  g.textStyle(BOLD);
  g.text("LATE CITY", 440, 28);
  g.text("EDITION", 440, 40);

  // top rules
  g.stroke(30);
  g.strokeWeight(1);
  g.line(20, 66, 470, 66);
  g.line(20, 84, 470, 84);

  g.noStroke();
  g.fill(20);
  g.textStyle(NORMAL);
  g.textSize(7);

  g.textAlign(LEFT, TOP);
  g.text("Vol. LXXVII", 20, 71);
  g.textAlign(CENTER, TOP);
  g.text("SUNDAY, MAY 22, 1927", 250, 71);
  g.textAlign(RIGHT, TOP);
  g.text("PRICE TWO CENTS", 470, 71);

  // ===== main headline =====
  g.fill(15);
  g.textAlign(CENTER, TOP);
  g.textStyle(BOLD);
  g.textSize(24);
  g.text("TITLE", 250, 98);

  g.textStyle(ITALIC);
  g.textSize(9);
  g.text("Subtitle.", 250, 132);

  // rule under headline
  g.stroke(60);
  g.strokeWeight(0.6);
  g.line(20, 152, 470, 152);

  // ===== layout guides =====
  const topY = 162;
  const midY = 378;
  const bottomY = 572;

  const leftX = 20,     leftW = 95;
  const leftMidX = 122, leftMidW = 88;
  const centerX = 217,  centerW = 145;
  const rightX = 369,   rightW = 101;

  const headerY = topY + 2;
  const bodyY   = topY + 28;

  // upper vertical dividers (stop before the horizontal rule)
  g.stroke(60);
  g.strokeWeight(0.8);
  g.line(118, topY, 118, midY - 3);
  g.line(213, topY, 213, midY - 3);
  g.line(365, topY, 365, midY - 3);

  // ===== left column =====
  g.noStroke();
  g.fill(20);
  g.textAlign(LEFT, TOP);
  g.textStyle(BOLD);
  g.textSize(8.5);
  g.text("Section 1", leftX, headerY);

  g.textStyle(NORMAL);
  g.textSize(6.5);
  g.text(
    "Today generally fair.\nCooler by evening.\nWinds shifting north.\n\nMorning bulletins indicate\ncontinued attention from\ncity offices after clerks\nreported coded markings\nfound among papers and\ndesk materials.\n\nWitnesses described a\nseries of notes arranged\nin a deliberate order,\nsuggesting the message\nwas meant to be solved\nrather than merely read.",
    leftX, bodyY, leftW, midY - bodyY - 8
  );

  // ===== left middle column =====
  g.fill(20);
  g.textStyle(BOLD);
  g.textSize(8.5);
  g.text("Officials\nReview Notes", leftMidX, headerY, leftMidW, 24);

  g.textStyle(NORMAL);
  g.textSize(6.5);
  g.text(
    "Messengers and clerks say\nseveral papers appeared to\nrefer to a defense term,\nthough one final character\nremained uncertain.\n\nThe arrangement of the\nmessage led some readers\nto suspect a childlike or\nsymbol-based cipher.",
    leftMidX, bodyY, leftMidW, midY - bodyY - 8
  );

  // ===== center section =====
  g.fill(20);
  g.textStyle(BOLD);
  g.textSize(8.5);
  g.textAlign(CENTER, TOP);
  g.text('"Recovered Note"', centerX + centerW / 2, headerY);

  g.stroke(50);
  g.strokeWeight(1);
  g.noFill();
  g.rect(centerX + 5,  bodyY,      centerW - 10, 140);
  g.rect(centerX + 18, bodyY + 14, centerW - 36, 112);

  g.noStroke();
  g.fill(30);
  g.textStyle(NORMAL);
  g.textSize(8);
  g.textAlign(CENTER, CENTER);
  g.text("[ PLACE CLUE OR IMAGE HERE ]",
         centerX + centerW / 2, bodyY + 70);

  g.textAlign(LEFT, TOP);
  g.textSize(6.5);
  g.text(
    "Editors withheld the contents of the recovered material pending further examination.",
    centerX + 5, bodyY + 148, centerW - 10, 30
  );

  // ===== right column =====
  g.fill(20);
  g.textAlign(LEFT, TOP);
  g.textStyle(BOLD);
  g.textSize(8.5);
  g.text("Late Report", rightX, headerY);

  g.textStyle(NORMAL);
  g.textSize(6.5);
  g.text(
    "Police sources state that\nsmall details may prove\nimportant. Readers are\nadvised to observe any\nfinal letter carefully.\n\nSome believe the message\nmust be translated exactly\nrather than guessed from\nsound or memory alone.",
    rightX, bodyY, rightW, midY - bodyY - 8
  );

  // ===== horizontal divider =====
  g.stroke(60);
  g.strokeWeight(0.9);
  g.line(20, midY, 470, midY);

  // ===== lower section =====
  const lowerHeaderY = midY + 14;
  const lowerBodyY   = midY + 36;
  const lowerDivX    = 245;

  g.stroke(60);
  g.strokeWeight(0.8);
  g.line(lowerDivX, midY + 8, lowerDivX, bottomY);

  // lower left
  g.noStroke();
  g.fill(20);
  g.textAlign(LEFT, TOP);
  g.textStyle(BOLD);
  g.textSize(11);
  g.text("Public Notice", 20, lowerHeaderY);

  g.textStyle(NORMAL);
  g.textSize(6.8);
  g.text(
    "Records indicate a symbol-based cipher was used in several of the documents. Investigators believe the marks translate directly into letters when read in order.\n\nOfficials remind citizens that small details matter. Space is reserved elsewhere for the final recovered note.",
    20, lowerBodyY, lowerDivX - 30, bottomY - lowerBodyY
  );

  // lower right
  g.fill(20);
  g.textStyle(BOLD);
  g.textSize(11);
  g.text("Editorial", lowerDivX + 10, lowerHeaderY);

  g.textStyle(NORMAL);
  g.textSize(6.8);
  g.text(
    "In times of uncertainty, clarity comes from observation. A hidden phrase may be built from familiar parts, but only careful reading reveals the intended result.\n\nThis panel can stay as flavor text, or you can replace it with another clue block.",
    lowerDivX + 10, lowerBodyY, 470 - (lowerDivX + 10), bottomY - lowerBodyY
  );
}


function addPaperTexture(g) {
  for (let i = 0; i < 1400; i++) {
    let px = random(10, 490);
    let py = random(10, 590);
    g.noStroke();
    g.fill(150, 130, 100, 10);
    g.ellipse(px, py, random(1, 2.2), random(1, 2.2));
  }

  for (let i = 0; i < 70; i++) {
    let x1 = random(20, 470);
    let y1 = random(20, 570);
    let x2 = x1 + random(-10, 10);
    let y2 = y1 + random(-10, 10);
    g.stroke(130, 110, 85, 18);
    g.strokeWeight(0.6);
    g.line(x1, y1, x2, y2);
  }
}
>>>>>>> Stashed changes
