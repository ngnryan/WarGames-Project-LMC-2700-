//TODO:
//1. Change state names to be more descriptive
//2. The circuits game will provide a pattern, which one of the stray clues has a key for, spelling out tictactoe

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
let newspaperBuffer = null;

/**************PIGEON CIPHER*******************/
let images = [];
let currentIndex = 0;
let lastSwitch = 0;
const INTERVAL = 1000;
/***********************************************/

/**************CIRCUITS PUZZLE*******************/
let circuitStates = [
  false, false, false,
  false, false, false,
  false, false, false
];

let circuitSolution = [
  true, false, true,
  true, false, true,
  true, false, false
];

let circuitMessage = "";
let circuitSolved = false;

/***********************************************/

function preload() {
  backimg = loadImage("computerscreen.png");
  myFont = loadFont("VT323-Regular.ttf");

  // PIGEON CIPHER IMAGES
  images[0] = loadImage('image_D.png');
  images[1] = loadImage('image_E.png');
  images[2] = loadImage('image_F.png');
  images[3] = loadImage('image_C.png');
  images[4] = loadImage('image_O.png');
  images[5] = loadImage('image_N.png');
  images[6] = loadImage('image_V.png');
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
}

function draw() {
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
    drawDefconSign();       // <-- DEFCON sign at top
    drawPigeonCipherNote(); // <-- sticky note on wall
  } else if (screen === "challenge one") {
    background(255);
    drawPasswordScreen();
  } else if (screen === "success") {
    drawSuccessScreen();
  } else if (screen === "newspaper") {
    drawNewspaperScreen();
  } else if (screen === "finalpuzzle") {
    drawPigeonCipher();
  } else if (screen === "circuits") {
    drawCircuitsPuzzle();
  }
}


/***************USER INPUT******************/
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
      if (deskNewspaper.hovered) {
        screen = "newspaper";
      } else {
        screen = "challenge one";
      }
    } else if (screen === "newspaper") {
      screen = "lobby";
    } else if (screen === "circuits") {
      handleCircuitClicks();
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
    if (screen !== "challenge one") return;

    if (keyCode === BACKSPACE) {
      typedText = typedText.substring(0, typedText.length - 1);
    } else if (keyCode === ENTER || keyCode === RETURN) {
      if (typedText === correctPassword) {
        message = "ACCESS GRANTED";
        screen = "success";
      } else if (typedText === "circuits") {
        typedText = "";
        message = "";
        circuitMessage = "";
        screen = "circuits";
      } else if (typedText === "tictactoe") {
        currentIndex = 0;
        lastSwitch = millis();
        screen = "finalpuzzle";
      } else {
        message = "ACCESS DENIED";
        typedText = "";
      }
    } else if (key.length === 1) {
      typedText += key;
    }
  }
}


/************PIGEON CIPHER****************/
function drawPigeonCipher() {
  background(0);

  let img = images[currentIndex];
  if (img) {
    image(img, width / 2 - img.width / 2, height / 2 - img.height / 2);
  }

  if (millis() - lastSwitch > INTERVAL) {
    currentIndex++;
    lastSwitch = millis();

    if (currentIndex >= images.length) {
      currentIndex = 0;
      screen = "lobby";
    }
  }
}


/***************PUZZLES******************/

/***************Clues******************/
let deskNewspaper = {
  x: 70,
  y: 430,
  w: 115,
  h: 78,
  hovered: false
};


/***************DEFCON SIGN******************/
function drawDefconSign() {
  push();
  colorMode(RGB, 255);
  rectMode(CORNER);

  // Sign frame/bracket
  let signX = width / 2;
  let signY = 30;

  // Frame background (dark metal)
  fill(28, 28, 32);
  stroke(60, 60, 70);
  strokeWeight(2);
  rectMode(CENTER);
  rect(signX, signY + 10, 360, 80, 4);

  // DEFCON label at top of sign
  noStroke();
  fill(220, 220, 220);
  textFont("Arial");
  textStyle(BOLD);
  textSize(11);
  textAlign(CENTER, CENTER);
  text("DEFCON", signX, signY - 10);

  // The 5 level boxes
  let levels = [5, 4, 3, 2, 1];
  let boxColors = [
    [50, 80, 200],   // 5 - blue
    [30, 180, 40],   // 4 - green (highlighted)
    [220, 200, 0],   // 3 - yellow
    [200, 40, 90],   // 2 - pink/red
    [230, 230, 230], // 1 - white
  ];

  let boxW = 52;
  let boxH = 42;
  let startX = signX - 120;
  let boxY = signY + 14;

  for (let i = 0; i < 5; i++) {
    let bx = startX + i * 62;

    // Outer glow for highlighted (level 5, index 0) - blue glow
    if (i === 0) {
      noFill();
      stroke(80, 140, 255, 140);
      strokeWeight(8);
      rect(bx, boxY, boxW, boxH, 3);
      stroke(80, 140, 255, 60);
      strokeWeight(14);
      rect(bx, boxY, boxW, boxH, 3);
    }

    // Box background
    fill(boxColors[i][0], boxColors[i][1], boxColors[i][2]);
    stroke(0);
    strokeWeight(i === 0 ? 2.5 : 1.5);
    rect(bx, boxY, boxW, boxH, 3);

    // Dim overlay for non-highlighted boxes
    if (i !== 0) {
      fill(0, 0, 0, 100);
      noStroke();
      rect(bx, boxY, boxW, boxH, 3);
    }

    // Number
    noStroke();
    if (i === 0) {
      fill(255, 255, 255); // bright white for highlighted
    } else {
      fill(200, 200, 200, 160);
    }
    textFont("Arial");
    textStyle(BOLD);
    textSize(i === 0 ? 24 : 20);
    textAlign(CENTER, CENTER);
    text(levels[i], bx + boxW / 2, boxY + boxH / 2);
  }

  // Bracket legs (two vertical supports under sign)
  stroke(50, 50, 55);
  strokeWeight(3);
  line(signX - 100, signY + 50, signX - 100, signY + 90);
  line(signX + 100, signY + 50, signX + 100, signY + 90);
  line(signX - 100, signY + 90, signX + 100, signY + 90);

  pop();
}


/***************PIGEON CIPHER STICKY NOTE******************/
// The tic-tac-toe cipher grid key
// Cells: [NMA, ZTL, VYI, EKU, OWX, DPH, FQR, JSB, CG]
// Bottom-right cell only has O (no X) meaning only circle symbol

function drawPigeonCipherNote() {
  push();
  colorMode(RGB, 255);
  rectMode(CORNER);

  let nx = 520;
  let ny = 60;
  let nw = 155;
  let nh = 195;

  // Slight drop shadow
  noStroke();
  fill(0, 0, 0, 30);
  rect(nx + 4, ny + 4, nw, nh, 2);

  // Sticky note body - yellow
  fill(255, 245, 120);
  stroke(200, 185, 60);
  strokeWeight(0.8);
  rect(nx, ny, nw, nh, 2);

  // Folded corner (top-right)
  fill(220, 205, 80);
  noStroke();
  triangle(nx + nw - 14, ny, nx + nw, ny, nx + nw, ny + 14);
  fill(180, 165, 50);
  triangle(nx + nw - 14, ny, nx + nw, ny + 14, nx + nw - 14, ny + 14);

  // Title "CIPHER KEY"
  fill(60, 40, 0);
  noStroke();
  textFont("Arial");
  textStyle(BOLD);
  textSize(8);
  textAlign(CENTER, TOP);
  text("CIPHER KEY", nx + nw / 2, ny + 6);

  // Draw the tic-tac-toe grid
  let gridX = nx + 12;
  let gridY = ny + 22;
  let cellW = 42;
  let cellH = 54;

  // Grid lines
  stroke(80, 60, 0);
  strokeWeight(1.2);

  // Vertical lines
  line(gridX + cellW,     gridY, gridX + cellW,     gridY + 3 * cellH);
  line(gridX + 2 * cellW, gridY, gridX + 2 * cellW, gridY + 3 * cellH);

  // Horizontal lines
  line(gridX, gridY + cellH,     gridX + 3 * cellW, gridY + cellH);
  line(gridX, gridY + 2 * cellH, gridX + 3 * cellW, gridY + 2 * cellH);

  // Cell data: [letters, hasCircle, hasCross]
  // Row 0
  let cells = [
    { letters: "N, M, A,", circle: true,  cross: true  },
    { letters: "Z, T, L,", circle: true,  cross: true  },
    { letters: "V, Y, I,", circle: true,  cross: true  },
    { letters: "E, K, U,", circle: true,  cross: true  },
    { letters: "O, W, X,", circle: true,  cross: true  },
    { letters: "D, P, H,", circle: true,  cross: true  },
    { letters: "F, Q, R,", circle: true,  cross: true  },
    { letters: "J, S, B",  circle: true,  cross: true  },
    { letters: "C, G",     circle: true,  cross: false }, // bottom-right: O only
  ];

  textFont("Arial");

  for (let i = 0; i < 9; i++) {
    let row = floor(i / 3);
    let col = i % 3;
    // Center of this cell
    let cx = gridX + col * cellW + cellW / 2;
    let cy = gridY + row * cellH;
    let cell = cells[i];

    // O and X drawn side by side, centered in cell horizontally
    // O left of center, X right of center (6px apart)
    let symY = cy + 8; // vertical position of symbols
    let symR = 4;      // circle radius

    if (cell.circle && cell.cross) {
      // Both: O at cx-7, X at cx+7
      stroke(70, 70, 70);
      strokeWeight(1.2);
      noFill();
      ellipse(cx - 7, symY, symR * 2, symR * 2);

      stroke(70, 70, 70);
      strokeWeight(1.2);
      let xc = cx + 7;
      line(xc - 3.5, symY - 3.5, xc + 3.5, symY + 3.5);
      line(xc + 3.5, symY - 3.5, xc - 3.5, symY + 3.5);
    } else if (cell.circle) {
      // Only O: centered
      stroke(70, 70, 70);
      strokeWeight(1.2);
      noFill();
      ellipse(cx, symY, symR * 2, symR * 2);
    }

    // Letters centered below symbols
    noStroke();
    fill(40, 30, 0);
    textStyle(NORMAL);
    textSize(6.5);
    textAlign(CENTER, TOP);
    text(cell.letters, cx, cy + 18);
  }

  pop();
}


/***************HELPERS******************/
function drawDesk() {
  push();

  let s = 1.66;

  stroke(60);
  strokeWeight(1.5);
  noFill();
  rectMode(CORNER);

  line(0 * s, 300 * s, 30 * s, 250 * s);
  line(400 * s, 300 * s, 370 * s, 250 * s);
  line(0 * s, 330 * s, 400 * s, 330 * s);
  line(30 * s, 250 * s, 370 * s, 250 * s);

  line(0 * s, 310 * s, 400 * s, 310 * s);
  line(300 * s, 330 * s, 300 * s, 400 * s);

  rect(335 * s, 350 * s, 50 * s, 10 * s);

  pop();
}

function updateNewspaperHover() {
  deskNewspaper.hovered =
    mouseX >= deskNewspaper.x &&
    mouseX <= deskNewspaper.x + deskNewspaper.w &&
    mouseY >= deskNewspaper.y &&
    mouseY <= deskNewspaper.y + deskNewspaper.h;
}

function drawDeskNewspaper() {
  push();
  colorMode(RGB, 255);
  rectMode(CORNER);

  const nx = deskNewspaper.x;
  const ny = deskNewspaper.y;
  const nw = deskNewspaper.w;
  const nh = deskNewspaper.h;

  noStroke();
  fill(0, 0, 0, 40);
  rect(nx + 3, ny + 3, nw, nh);

  fill(246, 242, 232);
  stroke(40);
  strokeWeight(0.8);
  rect(nx, ny, nw, nh);

  noStroke();
  fill(20);
  textFont("Times New Roman");
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(9);
  text("Herald Tribune", nx + nw / 2, ny + 3);

  stroke(40);
  strokeWeight(0.4);
  line(nx + 4, ny + 17, nx + nw - 4, ny + 17);
  line(nx + 4, ny + 19, nx + nw - 4, ny + 19);

  noStroke();
  fill(20);
  textStyle(BOLD);
  textSize(7);
  text("TITLE", nx + nw / 2, ny + 22);

  stroke(40);
  strokeWeight(0.3);
  line(nx + 4, ny + 32, nx + nw - 4, ny + 32);

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

  stroke(60);
  strokeWeight(0.3);
  line(nx + 4 + colW,         ny + 35, nx + 4 + colW,         ny + nh - 4);
  line(nx + 4 + 2 * colW + 3, ny + 35, nx + 4 + 2 * colW + 3, ny + nh - 4);

  if (deskNewspaper.hovered) {
    noFill();
    stroke(255, 220, 0);
    strokeWeight(1.5);
    rect(nx - 2, ny - 2, nw + 4, nh + 4);
  }

  pop();
}

function drawNewspaperScreen() {
  push();
  colorMode(RGB, 255);

  background(40);

  if (newspaperBuffer === null) {
    newspaperBuffer = createGraphics(500, 600);
    newspaperBuffer.textFont("Times New Roman");
    buildNewspaper(newspaperBuffer);
  }

  imageMode(CORNER);
  image(newspaperBuffer, (width - 500) / 2, (height - 600) / 2);

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

  g.fill(246, 242, 232);
  g.stroke(50);
  g.strokeWeight(1.2);
  g.rect(10, 10, 480, 580);

  addPaperTexture(g);

  // masthead
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

  // main headline
  g.fill(15);
  g.textAlign(CENTER, TOP);
  g.textStyle(BOLD);
  g.textSize(24);
  g.text("TITLE", 250, 98);

  g.textStyle(ITALIC);
  g.textSize(9);
  g.text("Subtitle.", 250, 132);

  g.stroke(60);
  g.strokeWeight(0.6);
  g.line(20, 152, 470, 152);

  // layout
  const topY = 162;
  const midY = 378;
  const bottomY = 572;

  const leftX = 20;     const leftW = 95;
  const leftMidX = 122; const leftMidW = 88;
  const centerX = 217;  const centerW = 145;
  const rightX = 369;   const rightW = 101;

  const headerY = topY + 2;
  const bodyY   = topY + 28;

  g.stroke(60);
  g.strokeWeight(0.8);
  g.line(118, topY, 118, midY - 3);
  g.line(213, topY, 213, midY - 3);
  g.line(365, topY, 365, midY - 3);

  // left column
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

  // left middle column
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

  // center section
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

  // right column
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

  // horizontal divider
  g.stroke(60);
  g.strokeWeight(0.9);
  g.line(20, midY, 470, midY);

  // lower section
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

/**************CIRCUITS PUZZLE FUNCTIONS*******************/
function drawCircuitsPuzzle() {
  background(18);

  fill(0, 255, 0);
  textFont(myFont);
  textAlign(LEFT, TOP);

  textSize(26);
  text("> CIRCUIT BOARD", 30, 25);

  textSize(16);
  text("Match the stable configuration.", 30, 65);
  text("Back", 30, 600);

  drawCircuitBackButton();
  drawCircuitResetButton();
  drawCircuitGrid();

  textSize(16);
  text(circuitMessage, 30, 555);
}

function drawCircuitBackButton() {
  noFill();
  stroke(0, 255, 0);
  rect(20, 585, 80, 35);
}

function drawCircuitResetButton() {
  noFill();
  stroke(0, 255, 0);
  rect(580, 25, 90, 35);

  noStroke();
  fill(0, 255, 0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("RESET", 625, 43);
  textAlign(LEFT, TOP);
}

function drawCircuitGrid() {
  let startX = 170;
  let startY = 145;
  let cellSize = 110;
  let nodeSize = 46;

  stroke(0, 180, 0);
  strokeWeight(3);

  // horizontal wires
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      let x1 = startX + c * cellSize + nodeSize / 2;
      let y1 = startY + r * cellSize + nodeSize / 2;
      let x2 = startX + (c + 1) * cellSize + nodeSize / 2;
      let y2 = y1;
      line(x1, y1, x2, y2);
    }
  }

  // vertical wires
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 2; r++) {
      let x1 = startX + c * cellSize + nodeSize / 2;
      let y1 = startY + r * cellSize + nodeSize / 2;
      let x2 = x1;
      let y2 = startY + (r + 1) * cellSize + nodeSize / 2;
      line(x1, y1, x2, y2);
    }
  }

  // nodes
  textAlign(CENTER, CENTER);
  textSize(14);

  for (let i = 0; i < 9; i++) {
    let r = floor(i / 3);
    let c = i % 3;

    let x = startX + c * cellSize;
    let y = startY + r * cellSize;

    if (circuitStates[i]) {
      fill(0, 255, 0);
      stroke(180, 255, 180);
    } else {
      fill(25);
      stroke(0, 255, 0);
    }

    strokeWeight(2);
    rect(x, y, nodeSize, nodeSize, 8);

    noStroke();
    if (circuitStates[i]) {
      fill(0);
      text("ON", x + nodeSize / 2, y + nodeSize / 2);
    } else {
      fill(0, 255, 0);
      text("OFF", x + nodeSize / 2, y + nodeSize / 2);
    }
  }

  textAlign(LEFT, TOP);
}

function handleCircuitClicks() {
  // BACK button
  if (mouseX >= 20 && mouseX <= 100 &&
      mouseY >= 585 && mouseY <= 620) {
    screen = "challenge one";
    circuitMessage = "";
    return;
  }

  // RESET button
  if (mouseX >= 580 && mouseX <= 670 &&
      mouseY >= 25 && mouseY <= 60) {
    resetCircuitPuzzle();
    return;
  }

  let startX = 170;
  let startY = 145;
  let cellSize = 110;
  let nodeSize = 46;

  for (let i = 0; i < 9; i++) {
    let r = floor(i / 3);
    let c = i % 3;

    let x = startX + c * cellSize;
    let y = startY + r * cellSize;

    if (mouseX >= x && mouseX <= x + nodeSize &&
        mouseY >= y && mouseY <= y + nodeSize) {
      toggleCircuit(i);
      checkCircuitSolution();
      return;
    }
  }
}

function toggleCircuit(index) {
  circuitStates[index] = !circuitStates[index];
}

function checkCircuitSolution() {
  for (let i = 0; i < 9; i++) {
    if (circuitStates[i] !== circuitSolution[i]) {
      circuitMessage = "";
      return;
    }
  }

  circuitSolved = true;
  circuitMessage = "STABLE OUTPUT: tictactoe";
}

function resetCircuitPuzzle() {
  circuitStates = [
    false, false, false,
    false, false, false,
    false, false, false
  ];
  circuitMessage = "";
  circuitSolved = false;
}
