// ============================================================
//  W.O.P.R.  —  WAR GAMES TERMINAL
//  Enhanced visual theme: phosphor-green CRT aesthetic
//  (Game logic unchanged from original)
// ============================================================

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

/**************CLUES******************/
let deskNewspaper = {
  x: 70, y: 430, w: 115, h: 78, hovered: false
};

// ============================================================
//  THEME  —  phosphor-green CRT palette
// ============================================================
const C_BG          = [4, 12, 6];
const C_BG_PANEL    = [8, 22, 14];
const C_GREEN_HI    = [130, 255, 160];
const C_GREEN       = [80, 230, 120];
const C_GREEN_MID   = [0, 200, 70];
const C_GREEN_DIM   = [0, 140, 45];
const C_GREEN_FAINT = [0, 80, 28];
const C_AMBER       = [255, 180, 60];
const C_RED         = [255, 70, 70];

function crtGlow(strength) {
  // strength 0..1
  let s = strength === undefined ? 0.6 : strength;
  drawingContext.shadowBlur = 14 * s;
  drawingContext.shadowColor = "rgba(80, 255, 120, " + (0.85 * s) + ")";
}
function glowColor(r, g, b, blur) {
  drawingContext.shadowBlur = blur || 10;
  drawingContext.shadowColor = "rgba(" + r + "," + g + "," + b + "," + 0.8 + ")";
}
function noGlow() { drawingContext.shadowBlur = 0; }


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
  colorMode(RGB, 255, 255, 255, 255);
  scaleMult = 1;
  clicked = false;
  state = 0;
  textFont(myFont);
  loading = true;
  screenCol = "rgb(20, 30, 48)";
  dots = 1;
  index = 0;
  writing = false;
}

function draw() {
  if (state === 0) {
    titleScreen();
    if (clicked && scaleMult >= 10) drawCRTOverlay();
  } else if (state === 1) {
    successlobby();
    drawCRTOverlay();
  }
}


// ============================================================
//  CRT OVERLAY — scanlines + vignette, applied over everything
// ============================================================
function drawCRTOverlay() {
  push();
  resetMatrix();

  // horizontal scanlines
  noStroke();
  for (let y = 0; y < height; y += 3) {
    fill(0, 0, 0, 55);
    rect(0, y, width, 1);
  }

  // occasional "rolling" bright band
  let bandY = (frameCount * 2) % (height + 80) - 40;
  fill(120, 255, 140, 10);
  rect(0, bandY, width, 30);

  // vignette
  let g = drawingContext.createRadialGradient(
    width / 2, height / 2, height * 0.25,
    width / 2, height / 2, height * 0.85
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.65)');
  drawingContext.fillStyle = g;
  drawingContext.fillRect(0, 0, width, height);

  // edge tint — a faint green wash over the whole frame for cohesion
  fill(0, 60, 20, 14);
  rect(0, 0, width, height);

  pop();
}


// ============================================================
//  TITLE SCREEN
// ============================================================
function titleScreen() {
  push();
  imageMode(CENTER);
  rectMode(CENTER);

  background(6, 8, 12);

  // Faint room ambience before zoom
  if (!clicked || scaleMult < 2) {
    noStroke();
    fill(10, 14, 20);
    for (let i = 0; i < 40; i++) {
      let x = (i * 53) % width;
      let y = (i * 97) % height;
      fill(15, 20, 28, 20);
      rect(x, y, 40, 40);
    }
  }

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
        // Fully zoomed — we are "inside" the CRT
        screenCol = "rgb(2, 10, 4)";

        glowColor(80, 255, 120, 12);
        fill(100, 255, 140);
        textAlign(LEFT, TOP);
        textSize(2.4);
        text("NORAD // W.O.P.R.", -30, -30);
        text("TRUNKLINE 04  ESTABLISHING LINK", -30, -26);

        textAlign(CENTER, CENTER);
        textSize(4);
        text("LOADING", 0, -9);

        if (frameCount % 60 == 0) {
          if (dots != 3) dots++; else dots = 1;
        }
        text(".".repeat(dots), 0, -3);

        if (frameCount == 480) loading = false;
      } else {
        glowColor(80, 255, 120, 16);
        fill(110, 255, 145);
        textAlign(LEFT, CENTER);
        textSize(3);

        if (frameCount % 10 == 0) {
          if (index <= texts[1].length) {
            displayText = texts[1].substring(0, index++);
            if (index < texts[1].length) displayText = displayText + "_";
          } else {
            writing = true;
          }
        }
        text(displayText || "", -25, -20);

        if (writing) {
          let cursor = (frameCount % 60 < 30) ? "_" : " ";
          text("> " + textInput + cursor, -25, -13);
        }
      }
    }
  }

  pop();
}


// ============================================================
//  LOBBY / ROUTING
// ============================================================
function successlobby() {
  background(C_BG[0], C_BG[1], C_BG[2]);

  if (screen === "lobby") {
    drawLobbyBackground();
    drawDesk();
    drawDeskNewspaper();
    updateNewspaperHover();
    drawDefconSign();
    drawPigeonCipherNote();
    drawLobbyStatusBar();
  } else if (screen === "challenge one") {
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


// ============================================================
//  REUSABLE CHROME
// ============================================================
function drawTerminalFrame() {
  push();
  stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  strokeWeight(1);
  crtGlow(0.5);
  noFill();
  rect(15, 15, width - 30, height - 30);
  rect(20, 20, width - 40, height - 40);
  noGlow();
  pop();
}

function drawTerminalHeader(leftText, rightText) {
  push();
  noStroke();
  fill(0, 50, 22);
  rect(25, 25, width - 50, 50);

  glowColor(80, 255, 120, 12);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textSize(22);
  textAlign(LEFT, CENTER);
  text(leftText, 40, 50);
  if (rightText) {
    textAlign(RIGHT, CENTER);
    textSize(16);
    text(rightText, width - 40, 50);
  }
  noGlow();
  stroke(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  strokeWeight(1);
  line(25, 75, width - 25, 75);
  pop();
}

function drawTerminalFooter(hintLeft, hintRight) {
  push();
  stroke(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  strokeWeight(1);
  line(25, height - 55, width - 25, height - 55);

  noStroke();
  fill(0, 40, 18);
  rect(25, height - 54, width - 50, 29);

  crtGlow(0.35);
  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textFont(myFont);
  textSize(15);
  textAlign(LEFT, CENTER);
  text(hintLeft, 40, height - 39);
  if (hintRight) {
    textAlign(RIGHT, CENTER);
    text(hintRight, width - 40, height - 39);
  }
  noGlow();
  pop();
}

function drawTermButton(x, y, w, h, label, opts) {
  opts = opts || {};
  let hover = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;

  push();
  noFill();
  if (hover) {
    stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    strokeWeight(2);
    crtGlow(0.8);
  } else {
    stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
    strokeWeight(1);
    crtGlow(0.3);
  }
  rect(x, y, w, h, 2);
  noGlow();

  noStroke();
  fill(hover ? C_GREEN_HI[0] : C_GREEN[0],
       hover ? C_GREEN_HI[1] : C_GREEN[1],
       hover ? C_GREEN_HI[2] : C_GREEN[2]);
  textFont(myFont);
  textSize(opts.size || 17);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  pop();
}


// ============================================================
//  LOBBY BACKGROUND & CHROME
// ============================================================
function drawLobbyBackground() {
  push();
  // subtle grid
  stroke(0, 70, 24, 70);
  strokeWeight(0.4);
  for (let x = 0; x < width; x += 35) line(x, 0, x, height);
  for (let y = 0; y < height; y += 35) line(0, y, width, y);

  // top header bar
  noStroke();
  fill(0, 50, 22);
  rect(0, 0, width, 24);
  stroke(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  strokeWeight(1);
  line(0, 24, width, 24);

  noStroke();
  crtGlow(0.45);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textSize(15);
  textAlign(LEFT, CENTER);
  text("NORAD // W.O.P.R. TERMINAL  •  CLASSIFIED", 10, 12);

  textAlign(RIGHT, CENTER);
  let h24 = nf(hour(), 2);
  let mm = nf(minute(), 2);
  let ss = nf(second(), 2);
  text("T+" + h24 + ":" + mm + ":" + ss, width - 10, 12);
  noGlow();
  pop();
}

function drawLobbyStatusBar() {
  push();
  noStroke();
  fill(0, 50, 22);
  rect(0, height - 24, width, 24);
  stroke(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  strokeWeight(1);
  line(0, height - 24, width, height - 24);

  // blinking REC dot
  noStroke();
  let blink = (frameCount % 60 < 30);
  if (blink) {
    glowColor(255, 70, 70, 10);
    fill(255, 70, 70);
    ellipse(14, height - 12, 7, 7);
  }
  noGlow();

  crtGlow(0.4);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textSize(14);
  textAlign(LEFT, CENTER);
  text("REC  •  LINK: SECURE  •  ENCRYPT: ON", 26, height - 12);

  textAlign(RIGHT, CENTER);
  let hint = deskNewspaper.hovered
    ? "[ CLICK ] INSPECT NEWSPAPER"
    : "[ CLICK ] ACCESS TERMINAL";
  text(hint, width - 10, height - 12);
  noGlow();
  pop();
}


// ============================================================
//  DESK
// ============================================================
function drawDesk() {
  push();
  let s = 1.66;

  // Soft floor wash so the desk sits in space
  noStroke();
  fill(0, 25, 10, 60);
  rectMode(CORNER);
  rect(0, 515, width, height - 515);

  // The desk wireframe — in phosphor green with glow
  crtGlow(0.5);
  stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  strokeWeight(1.4);
  noFill();

  line(0 * s, 300 * s, 30 * s, 250 * s);
  line(400 * s, 300 * s, 370 * s, 250 * s);
  line(0 * s, 330 * s, 400 * s, 330 * s);
  line(30 * s, 250 * s, 370 * s, 250 * s);
  line(0 * s, 310 * s, 400 * s, 310 * s);
  line(300 * s, 330 * s, 300 * s, 400 * s);

  // drawer
  rect(335 * s, 350 * s, 50 * s, 10 * s);

  // wood-grain hints on the desktop — subtle horizontal ticks
  noGlow();
  stroke(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
  strokeWeight(0.6);
  for (let x = 60; x < 610; x += 24) {
    line(x, 430, x + 14, 430);
    line(x + 6, 470, x + 22, 470);
  }

  // desk edge highlight
  crtGlow(0.3);
  stroke(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  strokeWeight(0.6);
  line(0, 416, width, 416);
  noGlow();

  pop();
}


// ============================================================
//  DEFCON SIGN — kept colorful but wrapped in CRT chrome
// ============================================================
function drawDefconSign() {
  push();
  rectMode(CORNER);

  let signX = width / 2;
  let signY = 50;

  // backplate panel
  noStroke();
  fill(8, 18, 12);
  rectMode(CENTER);
  rect(signX, signY + 10, 380, 90, 4);

  // frame
  crtGlow(0.4);
  stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  strokeWeight(1.2);
  noFill();
  rect(signX, signY + 10, 380, 90, 4);
  noGlow();

  // Small bracket screws
  noStroke();
  fill(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  ellipse(signX - 185, signY - 30, 4, 4);
  ellipse(signX + 185, signY - 30, 4, 4);
  ellipse(signX - 185, signY + 50, 4, 4);
  ellipse(signX + 185, signY + 50, 4, 4);

  // DEFCON label
  glowColor(80, 255, 120, 8);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textStyle(BOLD);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("DEFENSE CONDITION", signX, signY - 14);
  noGlow();

  // The 5 level boxes
  let levels = [5, 4, 3, 2, 1];
  let boxColors = [
    [50, 120, 220],  // 5 - blue (ACTIVE)
    [30, 180, 40],   // 4 - green
    [220, 200, 0],   // 3 - yellow
    [200, 70, 60],   // 2 - red
    [240, 240, 240], // 1 - white
  ];

  let boxW = 54;
  let boxH = 44;
  let startX = signX - 124;
  let boxY = signY + 14;

  for (let i = 0; i < 5; i++) {
    let bx = startX + i * 64;

    // Outer glow for highlighted (level 5)
    if (i === 0) {
      let pulse = 0.6 + 0.4 * sin(frameCount * 0.1);
      drawingContext.shadowBlur = 22 * pulse;
      drawingContext.shadowColor = "rgba(80, 160, 255, 0.85)";
    }

    fill(boxColors[i][0], boxColors[i][1], boxColors[i][2]);
    stroke(0);
    strokeWeight(i === 0 ? 2.5 : 1.5);
    rect(bx, boxY, boxW, boxH, 3);
    noGlow();

    // dim overlay for non-active levels
    if (i !== 0) {
      fill(0, 0, 0, 140);
      noStroke();
      rect(bx, boxY, boxW, boxH, 3);

      // fake CRT lines within each inactive box
      stroke(0, 0, 0, 40);
      strokeWeight(0.5);
      for (let ly = -boxH/2 + 2; ly < boxH/2; ly += 3) {
        line(bx - boxW/2, boxY + ly, bx + boxW/2, boxY + ly);
      }
    }

    // Number
    noStroke();
    if (i === 0) {
      glowColor(255, 255, 255, 10);
      fill(255, 255, 255);
    } else {
      fill(220, 220, 220, 180);
    }
    textFont(myFont);
    textStyle(BOLD);
    textSize(i === 0 ? 32 : 26);
    textAlign(CENTER, CENTER);
    text(levels[i], bx, boxY + 2);
    noGlow();
  }

  textStyle(NORMAL);

  // status line under sign
  glowColor(80, 255, 120, 6);
  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textFont(myFont);
  textSize(13);
  textAlign(CENTER, CENTER);
  text("CURRENT STATUS: DEFCON 5  —  NORMAL READINESS", signX, signY + 72);
  noGlow();

  pop();
}


// ============================================================
//  PIGEON CIPHER STICKY NOTE (physical object, keeps paper colors)
// ============================================================
function drawPigeonCipherNote() {
  push();
  rectMode(CORNER);

  let nx = 520;
  let ny = 155;
  let nw = 155;
  let nh = 195;

  // drop shadow
  noStroke();
  fill(0, 0, 0, 80);
  rect(nx + 5, ny + 5, nw, nh, 2);

  // paper body
  fill(255, 240, 110);
  stroke(180, 165, 50);
  strokeWeight(0.8);
  rect(nx, ny, nw, nh, 2);

  // green CRT wash over paper (since we're "on a monitor")
  noStroke();
  fill(0, 90, 30, 35);
  rect(nx, ny, nw, nh, 2);

  // folded corner
  fill(210, 195, 70);
  noStroke();
  triangle(nx + nw - 14, ny, nx + nw, ny, nx + nw, ny + 14);
  fill(170, 155, 45);
  triangle(nx + nw - 14, ny, nx + nw, ny + 14, nx + nw - 14, ny + 14);

  // Title
  fill(40, 28, 0);
  noStroke();
  textFont("Arial");
  textStyle(BOLD);
  textSize(8);
  textAlign(CENTER, TOP);
  text("CIPHER KEY", nx + nw / 2, ny + 6);

  // Grid
  let gridX = nx + 12;
  let gridY = ny + 22;
  let cellW = 42;
  let cellH = 54;

  stroke(70, 50, 0);
  strokeWeight(1.2);
  line(gridX + cellW,     gridY, gridX + cellW,     gridY + 3 * cellH);
  line(gridX + 2 * cellW, gridY, gridX + 2 * cellW, gridY + 3 * cellH);
  line(gridX, gridY + cellH,     gridX + 3 * cellW, gridY + cellH);
  line(gridX, gridY + 2 * cellH, gridX + 3 * cellW, gridY + 2 * cellH);

  let cells = [
    { letters: "N, M, A,", circle: true,  cross: true  },
    { letters: "Z, T, L,", circle: true,  cross: true  },
    { letters: "V, Y, I,", circle: true,  cross: true  },
    { letters: "E, K, U,", circle: true,  cross: true  },
    { letters: "O, W, X,", circle: true,  cross: true  },
    { letters: "D, P, H,", circle: true,  cross: true  },
    { letters: "F, Q, R,", circle: true,  cross: true  },
    { letters: "J, S, B",  circle: true,  cross: true  },
    { letters: "C, G",     circle: true,  cross: false },
  ];

  textFont("Arial");
  for (let i = 0; i < 9; i++) {
    let row = floor(i / 3);
    let col = i % 3;
    let cx = gridX + col * cellW + cellW / 2;
    let cy = gridY + row * cellH;
    let cell = cells[i];
    let symY = cy + 8;
    let symR = 4;

    if (cell.circle && cell.cross) {
      stroke(70, 70, 70);
      strokeWeight(1.2);
      noFill();
      ellipse(cx - 7, symY, symR * 2, symR * 2);
      let xc = cx + 7;
      line(xc - 3.5, symY - 3.5, xc + 3.5, symY + 3.5);
      line(xc + 3.5, symY - 3.5, xc - 3.5, symY + 3.5);
    } else if (cell.circle) {
      stroke(70, 70, 70);
      strokeWeight(1.2);
      noFill();
      ellipse(cx, symY, symR * 2, symR * 2);
    }

    noStroke();
    fill(40, 30, 0);
    textStyle(NORMAL);
    textSize(6.5);
    textAlign(CENTER, TOP);
    text(cell.letters, cx, cy + 18);
  }

  // "tape" strip at top
  fill(255, 255, 255, 120);
  noStroke();
  rect(nx + 50, ny - 6, 55, 14);

  pop();
}


// ============================================================
//  NEWSPAPER ON DESK (physical object, same paper colors)
// ============================================================
function updateNewspaperHover() {
  deskNewspaper.hovered =
    mouseX >= deskNewspaper.x &&
    mouseX <= deskNewspaper.x + deskNewspaper.w &&
    mouseY >= deskNewspaper.y &&
    mouseY <= deskNewspaper.y + deskNewspaper.h;
}

function drawDeskNewspaper() {
  push();
  rectMode(CORNER);

  const nx = deskNewspaper.x;
  const ny = deskNewspaper.y;
  const nw = deskNewspaper.w;
  const nh = deskNewspaper.h;

  noStroke();
  fill(0, 0, 0, 90);
  rect(nx + 3, ny + 3, nw, nh);

  fill(246, 242, 232);
  stroke(40);
  strokeWeight(0.8);
  rect(nx, ny, nw, nh);

  // green CRT wash
  noStroke();
  fill(0, 90, 30, 40);
  rect(nx, ny, nw, nh);

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

  // hover halo — terminal green
  if (deskNewspaper.hovered) {
    crtGlow(0.8);
    noFill();
    stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    strokeWeight(1.6);
    rect(nx - 3, ny - 3, nw + 6, nh + 6);
    noGlow();

    // corner brackets
    stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    strokeWeight(2);
    let b = 8;
    // TL
    line(nx - 5, ny - 5, nx - 5 + b, ny - 5);
    line(nx - 5, ny - 5, nx - 5,     ny - 5 + b);
    // TR
    line(nx + nw + 5, ny - 5, nx + nw + 5 - b, ny - 5);
    line(nx + nw + 5, ny - 5, nx + nw + 5,     ny - 5 + b);
    // BL
    line(nx - 5, ny + nh + 5, nx - 5 + b, ny + nh + 5);
    line(nx - 5, ny + nh + 5, nx - 5,     ny + nh + 5 - b);
    // BR
    line(nx + nw + 5, ny + nh + 5, nx + nw + 5 - b, ny + nh + 5);
    line(nx + nw + 5, ny + nh + 5, nx + nw + 5,     ny + nh + 5 - b);
  }

  pop();
}


// ============================================================
//  NEWSPAPER SCREEN
// ============================================================
function drawNewspaperScreen() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("EVIDENCE // ARCHIVE SCAN", "FILE: HERALD-05221927.SCAN");

  if (newspaperBuffer === null) {
    newspaperBuffer = createGraphics(500, 600);
    newspaperBuffer.textFont("Times New Roman");
    buildNewspaper(newspaperBuffer);
  }

  imageMode(CORNER);
  let targetH = 490;
  let targetW = 500 * (targetH / 600);
  let nx = (width - targetW) / 2;
  let ny = 92;
  image(newspaperBuffer, nx, ny, targetW, targetH);

  // green CRT wash over paper
  push();
  noStroke();
  fill(0, 120, 40, 45);
  rect(nx, ny, targetW, targetH);
  pop();

  drawTerminalFooter("[ CLICK ] RETURN TO LOBBY", "SOURCE: NYC ARCHIVE");
}


// ============================================================
//  PASSWORD (CHALLENGE ONE)
// ============================================================
function drawPasswordScreen() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("W.O.P.R. // SECURE ACCESS", "[ DEFCON 5 ]");

  push();
  crtGlow(0.5);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textAlign(LEFT, TOP);

  textSize(18);
  text("> CONNECTION ESTABLISHED.", 50, 100);
  text("> SYSTEM: AUTHORIZED PERSONNEL ONLY.", 50, 126);
  text("> ENTER PASSPHRASE OR MODULE CODE.", 50, 152);

  // prompt box
  noFill();
  stroke(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  strokeWeight(1);
  rect(45, 210, width - 90, 48);

  noStroke();
  textSize(26);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  let cursor = (frameCount % 60 < 30) ? "_" : " ";
  text("> " + typedText + cursor, 55, 220);

  // response message
  textSize(20);
  if (message === "ACCESS DENIED") {
    glowColor(255, 70, 70, 10);
    fill(C_RED[0], C_RED[1], C_RED[2]);
    text(message, 50, 280);
    // mock error details
    noGlow();
    fill(200, 50, 50);
    textSize(14);
    text("> ATTEMPT LOGGED.  RETRY LIMIT: UNBOUNDED.", 50, 310);
  } else if (message) {
    fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    text(message, 50, 280);
  }
  noGlow();

  // meta info panel
  stroke(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
  strokeWeight(1);
  line(45, 380, width - 45, 380);

  noStroke();
  fill(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  textSize(14);
  text("SESSION ID ..... 0x" + hex(frameCount + 0x48A12, 6), 50, 395);
  text("LINK STATUS .... SECURE", 50, 415);
  text("ENCRYPTION ..... 128-BIT STREAM", 50, 435);
  text("AUTH MODE ...... PASSPHRASE + MODULE CODE", 50, 455);
  text("WARNING ........ PRE-AUTHORIZED USERS ONLY", 50, 475);

  // decorative scan ticker
  textSize(13);
  fill(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  let tick = floor(frameCount / 3) % 40;
  let bar = ".".repeat(tick) + "|" + ".".repeat(40 - tick);
  text("SCAN " + bar, 50, 505);
  pop();

  drawTerminalFooter("[ EXIT ] CLICK TO RETURN TO LOBBY",
                     "ENTER TO SUBMIT  •  BACKSPACE TO EDIT");
}


// ============================================================
//  SUCCESS
// ============================================================
function drawSuccessScreen() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("W.O.P.R. // ACCESS GRANTED", "[ DEFCON 5 ]");

  push();
  textFont(myFont);
  textAlign(CENTER, CENTER);

  // Flickering big title
  let flicker = (frameCount % 37 < 2) ? 150 : 255;
  crtGlow(1);
  fill(110, flicker, 140);
  textSize(46);
  text("ACCESS GRANTED", width / 2, 130);
  noGlow();

  crtGlow(0.5);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textSize(20);
  text("WELCOME, PROFESSOR FALKEN.", width / 2, 180);
  noGlow();

  crtGlow(0.4);
  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textSize(18);
  text("SHALL WE PLAY A GAME?", width / 2, 210);
  noGlow();

  // Game list — classic WarGames roster
  textAlign(LEFT, TOP);
  textSize(15);
  fill(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  crtGlow(0.25);

  let games = [
    "> FALKEN'S MAZE",
    "> BLACK JACK",
    "> GIN RUMMY",
    "> HEARTS",
    "> BRIDGE",
    "> CHECKERS",
    "> CHESS",
    "> POKER",
    "> FIGHTER COMBAT",
    "> GUERRILLA ENGAGEMENT",
    "> DESERT WARFARE",
    "> AIR-TO-GROUND ACTIONS",
    "> THEATERWIDE TACTICAL WARFARE",
    "> GLOBAL THERMONUCLEAR WAR",
  ];

  let colW = (width - 160) / 2;
  for (let i = 0; i < games.length; i++) {
    let col = i < 7 ? 0 : 1;
    let row = i % 7;
    let gx = 80 + col * colW;
    let gy = 260 + row * 22;
    // highlight the last one
    if (games[i] === "> GLOBAL THERMONUCLEAR WAR") {
      let pulse = 150 + 60 * sin(frameCount * 0.12);
      fill(255, pulse, 60);
    } else {
      fill(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
    }
    text(games[i], gx, gy);
  }
  noGlow();
  pop();

  drawTerminalFooter("> SELECT A GAME", "A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY.");
}


// ============================================================
//  PIGEON CIPHER REVEAL
// ============================================================
function drawPigeonCipher() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("CIPHER OUTPUT // DECODED STREAM",
                     "FRAME " + (currentIndex + 1) + " / " + images.length);

  let img = images[currentIndex];
  if (img) {
    imageMode(CENTER);
    push();
    crtGlow(1);
    image(img, width / 2, height / 2);
    pop();
  }

  // progress bar
  push();
  let barW = 420;
  let barX = (width - barW) / 2;
  let barY = height - 95;
  noFill();
  stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  strokeWeight(1);
  rect(barX, barY, barW, 10);

  noStroke();
  crtGlow(0.6);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  let elapsed = (millis() - lastSwitch) / INTERVAL;
  let progress = constrain((currentIndex + elapsed) / images.length, 0, 1);
  rect(barX + 1, barY + 1, (barW - 2) * progress, 8);
  noGlow();

  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textFont(myFont);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("DECODING TRANSMISSION...", width / 2, barY - 14);
  pop();

  drawTerminalFooter("> STREAM AUTOPLAYING", "RETURN TO LOBBY ON COMPLETION");

  if (millis() - lastSwitch > INTERVAL) {
    currentIndex++;
    lastSwitch = millis();
    if (currentIndex >= images.length) {
      currentIndex = 0;
      screen = "lobby";
    }
  }
}


// ============================================================
//  CIRCUITS PUZZLE
// ============================================================
function drawCircuitsPuzzle() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();

  // Custom compact header that leaves room for reset button
  push();
  noStroke();
  fill(0, 50, 22);
  rect(25, 25, 540, 50);
  crtGlow(0.5);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textSize(22);
  textAlign(LEFT, CENTER);
  text("DIAGNOSTIC // CIRCUIT STABILIZER", 40, 50);
  noGlow();
  stroke(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  strokeWeight(1);
  line(25, 75, width - 25, 75);
  pop();

  // RESET button (top right)
  drawCircuitResetButton();

  push();
  crtGlow(0.4);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textAlign(LEFT, TOP);
  textSize(17);
  text("> MATCH THE STABLE CONFIGURATION.", 50, 100);

  let activeCount = circuitStates.filter(function (x) { return x; }).length;
  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textSize(14);
  text("NODES ACTIVE: " + activeCount + " / 9", 50, 128);

  fill(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  textAlign(RIGHT, TOP);
  text("CLICK A NODE TO TOGGLE", width - 50, 128);
  noGlow();
  pop();

  drawCircuitGrid();

  // Solved message
  push();
  textFont(myFont);
  textAlign(CENTER, CENTER);
  if (circuitSolved) {
    let pulse = 160 + 70 * sin(frameCount * 0.12);
    glowColor(80, 255, 120, 18);
    fill(110, pulse, 140);
    textSize(22);
    text("> STABLE OUTPUT: tictactoe", width / 2, 555);
    noGlow();
  } else {
    fill(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
    textSize(15);
    text("AWAITING STABLE CONFIGURATION...", width / 2, 555);
  }
  pop();

  drawCircuitBackButton();
  drawTerminalFooter("[ BACK ] RETURN TO TERMINAL",
                     "SUBROUTINE 0x3C • CHECKSUM ACTIVE");
}

function drawCircuitBackButton() {
  drawTermButton(40, height - 45, 100, 28, "< BACK", { size: 16 });
}

function drawCircuitResetButton() {
  drawTermButton(580, 30, 90, 35, "[ RESET ]", { size: 16 });
}

function drawCircuitGrid() {
  let startX = 200;
  let startY = 175;
  let cellSize = 105;
  let nodeSize = 50;

  push();

  // WIRES — draw between every pair of adjacent nodes
  // Active wire: both endpoints ON → bright & glow
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let idx = r * 3 + c;
      let x1 = startX + c * cellSize + nodeSize / 2;
      let y1 = startY + r * cellSize + nodeSize / 2;

      if (c < 2) {
        let rightIdx = idx + 1;
        let active = circuitStates[idx] && circuitStates[rightIdx];
        let x2 = startX + (c + 1) * cellSize + nodeSize / 2;
        if (active) {
          crtGlow(0.9);
          stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
          strokeWeight(3);
        } else {
          noGlow();
          stroke(0, 90, 30);
          strokeWeight(2);
        }
        line(x1, y1, x2, y1);
      }

      if (r < 2) {
        let downIdx = idx + 3;
        let active = circuitStates[idx] && circuitStates[downIdx];
        let y2 = startY + (r + 1) * cellSize + nodeSize / 2;
        if (active) {
          crtGlow(0.9);
          stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
          strokeWeight(3);
        } else {
          noGlow();
          stroke(0, 90, 30);
          strokeWeight(2);
        }
        line(x1, y1, x1, y2);
      }
    }
  }
  noGlow();

  // NODES
  textFont(myFont);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < 9; i++) {
    let r = floor(i / 3);
    let c = i % 3;
    let x = startX + c * cellSize;
    let y = startY + r * cellSize;

    // hover detection
    let hover = mouseX >= x && mouseX <= x + nodeSize &&
                mouseY >= y && mouseY <= y + nodeSize;

    if (circuitStates[i]) {
      let pulse = 190 + 50 * sin(frameCount * 0.15 + i);
      crtGlow(1);
      fill(60, pulse, 110);
      stroke(180, 255, 200);
      strokeWeight(2);
    } else {
      if (hover) {
        crtGlow(0.6);
        fill(14, 32, 20);
        stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
        strokeWeight(1.8);
      } else {
        crtGlow(0.25);
        fill(10, 22, 14);
        stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
        strokeWeight(1.5);
      }
    }
    rect(x, y, nodeSize, nodeSize, 8);
    noGlow();

    noStroke();
    if (circuitStates[i]) {
      fill(C_BG[0], C_BG[1], C_BG[2]);
      textSize(16);
      text("ON", x + nodeSize / 2, y + nodeSize / 2);
    } else {
      fill(hover ? C_GREEN_HI[0] : C_GREEN[0],
           hover ? C_GREEN_HI[1] : C_GREEN[1],
           hover ? C_GREEN_HI[2] : C_GREEN[2]);
      textSize(14);
      text("OFF", x + nodeSize / 2, y + nodeSize / 2);
    }
  }

  textAlign(LEFT, TOP);
  pop();
}


// ============================================================
//  USER INPUT
// ============================================================
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
    let exitCondition = mouseX >= 30 && mouseX < 110 &&
                        mouseY >= 600 && mouseY < 635;

    if (screen === "challenge one") {
      if (exitCondition) {
        screen = "lobby";
        message = "";
      }
    } else if (screen === "lobby") {
      if (deskNewspaper.hovered) {
        screen = "newspaper";
      } else {
        screen = "challenge one";
      }
    } else if (screen === "newspaper") {
      screen = "lobby";
    } else if (screen === "success") {
      // allow click to go back to lobby from success too
      // (optional — doesn't break anything if you prefer to stay)
      // screen = "lobby";
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


// ============================================================
//  CIRCUITS — click routing & state
// ============================================================
function handleCircuitClicks() {
  // BACK button
  if (mouseX >= 40 && mouseX <= 140 &&
      mouseY >= height - 45 && mouseY <= height - 17) {
    screen = "challenge one";
    circuitMessage = "";
    return;
  }

  // RESET button
  if (mouseX >= 580 && mouseX <= 670 &&
      mouseY >= 30 && mouseY <= 65) {
    resetCircuitPuzzle();
    return;
  }

  let startX = 200;
  let startY = 175;
  let cellSize = 105;
  let nodeSize = 50;

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

function toggleCircuit(i) {
  circuitStates[i] = !circuitStates[i];
}

function checkCircuitSolution() {
  for (let i = 0; i < 9; i++) {
    if (circuitStates[i] !== circuitSolution[i]) {
      circuitMessage = "";
      circuitSolved = false;
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


// ============================================================
//  NEWSPAPER BUFFER (unchanged content — only the chrome around it changed)
// ============================================================
function buildNewspaper(g) {
  g.background(255);

  g.fill(246, 242, 232);
  g.stroke(50);
  g.strokeWeight(1.2);
  g.rect(10, 10, 480, 580);

  addPaperTexture(g);

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

  g.stroke(60);
  g.strokeWeight(0.9);
  g.line(20, midY, 470, midY);

  const lowerHeaderY = midY + 14;
  const lowerBodyY   = midY + 36;
  const lowerDivX    = 245;

  g.stroke(60);
  g.strokeWeight(0.8);
  g.line(lowerDivX, midY + 8, lowerDivX, bottomY);

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
