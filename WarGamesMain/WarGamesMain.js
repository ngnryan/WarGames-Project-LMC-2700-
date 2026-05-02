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
var scaleMult;
var barCount;
var clicked;
var dots;
var bootStartFrame = 0;
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
let usernamePromptDismissed = false;
let newspaperBuffer = null;
let cipherNoteBuffer = null;

// ===== Game timer (15 min countdown linked to ACCESS:DENIED reveal) =====
const TIMER_DURATION_MS = 45 * 60 * 1000; // 15 minutes
const TIMER_TARGET = "ACCESS:DENIED";     // 13 chars; one revealed per ~1.15 min
let timerStartMs = null;                  // set when player enters lobby (state 1)
let failureMode = false;                  // true once timer hits 0
let failureStartMs = null;                // when failureMode flipped
let failureTypedIndex = 0;                // typewriter progress for "> Failure"

// ===== Win state (typing DEFCONV) =====
let winMode = false;
let winStartMs = null;

// Newspaper section regions (in displayed/screen coordinates relative to the
// rendered newspaper image). Used to detect clicks and to render a zoomed view.
// `sx, sy, sw, sh` are normalized [0..1] within the newspaper image.
let newspaperSections = [
  { id: "masthead",  title: "Herald Tribune — Masthead",
    sx: 0.04, sy: 0.02, sw: 0.92, sh: 0.25 },
  { id: "section1",  title: "Section 1",
    sx: 0.04, sy: 0.27, sw: 0.205, sh: 0.36 },
  { id: "officials", title: "Officials Review Notes",
    sx: 0.245, sy: 0.27, sw: 0.205, sh: 0.36 },
  { id: "puzzle", title: "Daily Puzzle",
    sx: 0.45, sy: 0.27, sw: 0.225, sh: 0.36 },
  { id: "riddle",    title: "Riddle of the Day",
    sx: 0.668, sy: 0.27, sw: 0.292, sh: 0.36 },
  { id: "public",    title: "Public Notice",
    sx: 0.04, sy: 0.65, sw: 0.46, sh: 0.33 },
  { id: "editorial", title: "Editorial",
    sx: 0.51, sy: 0.65, sw: 0.45, sh: 0.33 }
];
let hoveredNewspaperSection = null;
let zoomedSection = null; // when set, render the zoomed section view instead

// Long-form content used by the zoom view. Keyed by section id.
let newspaperContent = {
  masthead: {
    big: "Herald Tribune",
    lines: [
      "NEW YORK    •    SUNDAY, MAY 22, 1927    •    LATE CITY EDITION",
      "Vol. LXXVII                                       PRICE TWO CENTS",
      "",
      "EXTRA EXTRA!",
      "Speculation on Human Nature",
      "",
      "ROHTUA: NEKLAF AUHSOJ"
    ]
  },
  section1: {
    body:
      "Today generally fair. Cooler by evening. Winds shifting north.\n\n" +
      "Morning bulletins indicate continued attention from city offices " +
      "after clerks reported coded markings found among papers and desk materials.\n\n" +
      "Witnesses described a series of notes arranged in a deliberate order, " +
      "suggesting the message was meant to be solved rather than merely read."
  },
  officials: {
    body:
      "Messengers and clerks say several papers appeared to refer to a " +
      "defense term, though one final character remained uncertain.\n\n" +
      "The arrangement of the message led some readers to suspect a childlike " +
      "or symbol-based cipher."
  },
  puzzle: {
    body:
      "Today's challenge from the Herald Tribune.\n\n" +
      "A 3×3 board of nine squares — flags, numbers, and empty spaces. " +
      "Identify the pattern and submit your solution.\n\n" +
      "Answers will be printed in tomorrow's edition."
  },
  riddle: {
    body:
      "I hide in plain sight,\n" +
      "but forward I mislead.\n" +
      "My truth only shows when\n" +
      "you change how you read.\n\n" +
      "The end is the start,\n" +
      "the start is the end —\n" +
      "shift your direction,\n" +
      "and the message will bend."
  },
  public: {
    body:
      "Records indicate a symbol-based cipher was used in several of the documents. " +
      "Investigators believe the marks translate directly into letters when read in order.\n\n" +
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ\n\n" +
      "ZYXWVUTSRQPONMLKJIHGFEDCBA"
  },
  editorial: {
    body:
      "Mankind's greatest asset has always been their opposable thumbs and their audacity " +
      "to scrawl over anything and everything. As cavemen, they would record stories and " +
      "information on cave walls. This physical ability to record was to important to " +
      "them, that even as they evolved and grew more intelligent, they simply found ways " +
      "to bring the cave walls with them."
  }
};

/**************PIGEON CIPHER*******************/
// Each board is a 9-char string (row-major). 'O' = circle, 'X' = cross, '.' = empty.
// Order spells "DEFCONV" — same as the original PNG sequence.
let pigeonBoards = [
  { cells: "OXO" + "XO." + "OXX", strike: false },  // D
  { cells: "XOX" + ".XO" + "OXO", strike: false },  // E
  { cells: "OXO" + "XOO" + ".XO", strike: false },  // F
  { cells: "OXO" + "XOX" + "XO.", strike: false },  // C
  { cells: "OXO" + "X.O" + "XOX", strike: false },  // O
  { cells: ".XO" + "OXO" + "XOX", strike: false },  // N
  { cells: "OO." + "OXO" + "XXX", strike: true  }   // V — last row struck through
];
let currentIndex = 0;
let lastSwitch = 0;
const INTERVAL = 2500;

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

/**************LOBBY APP TILES******************/
// Desktop-style shortcut icons running down the left side.
// Each one opens a fullscreen "app" when clicked.
let appTiles = [
  {
    id: "terminal",
    label: "Terminal",
    x: 30, y: 60, w: 80, h: 90,
    hovered: false,
    icon: "terminal"
  },
  {
    id: "newspaper",
    label: "News",
    x: 30, y: 170, w: 80, h: 90,
    hovered: false,
    icon: "newspaper"
  },
  {
    id: "cipher",
    label: "Notes",
    x: 30, y: 280, w: 80, h: 90,
    hovered: false,
    icon: "cipher"
  }
];

// Geometry of the live mini-terminal window shown on the lobby.
// Canvas is 700x650; this fills the area to the right of the 130px sidebar.
let miniTermRect = { x: 145, y: 60, w: 525, h: 540 };
let miniTermHovered = false;

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
  myFont = loadFont("VT323-Regular.ttf");
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
  fitCanvasToWindow();
  window.addEventListener('resize', fitCanvasToWindow);
}

function fitCanvasToWindow() {
  // Page chrome — black void around the "screen"
  Object.assign(document.documentElement.style, {
    margin: '0', padding: '0', height: '100%', background: '#000'
  });
  Object.assign(document.body.style, {
    margin: '0', padding: '0', background: '#000',
    height: '100vh', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  });

  const cnv = document.querySelector('canvas');
  if (!cnv) return;

  // Scale 700x650 to fit the viewport, preserving aspect ratio
  const s = Math.min(window.innerWidth / 700, window.innerHeight / 650);

  cnv.style.display = 'block';
  cnv.style.width  = (700 * s) + 'px';
  cnv.style.height = (650 * s) + 'px';
  cnv.style.imageRendering = 'auto'; // smooth scaling — better for fine text
}

function draw() {
  if (state === 0) {
    titleScreen();
    if (clicked && scaleMult >= 10) drawCRTOverlay();
  } else if (state === 1) {
    successlobby();
    // Skip the scanline overlay on the newspaper screen so the article is legible
    if (screen !== "newspaper") drawCRTOverlay();
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
//  TITLE SCREEN — desk + monitor drawn from scratch, zooms in on click
// ============================================================
function titleScreen() {
  push();

  // Smooth zoom progression: 0 = full desk view, 1 = fully zoomed inside CRT
  // We grow scaleMult from 1 → 10 as before, but interpret it as a 0..1 zoom.
  if (clicked && scaleMult < 10) {
    scaleMult += 0.12;
  }
  let zoom = constrain((scaleMult - 1) / 9, 0, 1); // 0..1

  // Geometry of the monitor's screen on the desk (in canvas coords, when zoom=0)
  // Picked so it sits on top of the desk in the center of the canvas.
  let scrCx = width / 2;
  let scrCy = height / 2;        // monitor screen vertically centered, sits on desk via stand
  let scrW0 = 180;
  let scrH0 = 180;

  // We zoom by scaling the whole scene around (scrCx, scrCy) and growing.
  // Zoom factor 1 at zoom=0, factor ~ 4 at zoom=1.
  let zScale = lerp(1, 3.6, zoom);

  // ---- BACKGROUND ROOM ----
  drawRoomBackground(zoom);

  // ---- DESK + MONITOR (transformed by zoom) ----
  push();
  translate(scrCx, scrCy);
  scale(zScale);
  translate(-scrCx, -scrCy);

  drawDeskAndMonitor(scrCx, scrCy, scrW0, scrH0);

  // ---- INNER SCREEN CONTENT (drawn at "real" coords inside the screen rect) ----
  // Even at zoom=0 we render boot text scaled down via clipping; once zoomed in,
  // it fills the whole canvas naturally because the scaling above blows it up.
  drawMonitorScreenContent(scrCx, scrCy, scrW0, scrH0, zoom);

  pop();

  pop();
}

function drawRoomBackground(zoom) {
  push();
  // The room recedes/fades as we zoom in
  let roomAlpha = lerp(255, 0, zoom);

  // Wall — dark navy gradient
  noStroke();
  let g = drawingContext.createLinearGradient(0, 0, 0, height * 0.7);
  g.addColorStop(0, "rgba(8, 12, 22, " + (roomAlpha / 255) + ")");
  g.addColorStop(1, "rgba(20, 26, 40, " + (roomAlpha / 255) + ")");
  drawingContext.fillStyle = g;
  drawingContext.fillRect(0, 0, width, height * 0.7);

  // Floor — warmer brown tone
  let g2 = drawingContext.createLinearGradient(0, height * 0.7, 0, height);
  g2.addColorStop(0, "rgba(38, 28, 22, " + (roomAlpha / 255) + ")");
  g2.addColorStop(1, "rgba(18, 12, 10, " + (roomAlpha / 255) + ")");
  drawingContext.fillStyle = g2;
  drawingContext.fillRect(0, height * 0.7, width, height * 0.3);

  // Wall/floor seam
  stroke(0, 0, 0, roomAlpha * 0.6);
  strokeWeight(2);
  line(0, height * 0.7, width, height * 0.7);

  // Window frame on the wall — soft moonlight square (left side)
  if (roomAlpha > 10) {
    noStroke();
    fill(60, 78, 110, roomAlpha * 0.35);
    rect(60, 80, 120, 140, 2);
    // window cross
    stroke(15, 22, 36, roomAlpha * 0.9);
    strokeWeight(3);
    line(120, 80, 120, 220);
    line(60, 150, 180, 150);
    // moonlight glow into room
    noStroke();
    let mg = drawingContext.createRadialGradient(120, 150, 5, 120, 150, 220);
    mg.addColorStop(0, "rgba(120, 150, 200, " + (roomAlpha / 255 * 0.18) + ")");
    mg.addColorStop(1, "rgba(120, 150, 200, 0)");
    drawingContext.fillStyle = mg;
    drawingContext.fillRect(0, 0, width, height);
  }

  // Wall poster / pinboard hint on the right
  if (roomAlpha > 10) {
    noStroke();
    fill(50, 38, 28, roomAlpha * 0.7);
    rect(width - 180, 90, 130, 110, 2);
    fill(78, 60, 44, roomAlpha * 0.7);
    rect(width - 175, 95, 120, 100, 2);
    // pinned papers
    fill(220, 210, 180, roomAlpha * 0.5);
    rect(width - 165, 105, 50, 35, 1);
    fill(200, 190, 160, roomAlpha * 0.45);
    rect(width - 105, 120, 45, 60, 1);
    fill(210, 200, 170, roomAlpha * 0.5);
    rect(width - 160, 150, 40, 30, 1);
  }
  pop();
}

function drawDeskAndMonitor(scrCx, scrCy, scrW0, scrH0) {
  push();

  // ---- DESK GEOMETRY (consistent reference points) ----
  let deskBackY  = height * 0.66;   // back edge of the desk top
  let deskFrontY = height * 0.7;    // front edge / where front face begins
  // Items "sit on the desk" by aligning their bottom edge to deskFrontY.
  let restY = deskFrontY;

  // ---- DESK ----
  noStroke();
  // desk top (perspective: wider in front, slightly narrower in back)
  fill(72, 50, 32);
  beginShape();
  vertex(40,           deskFrontY);
  vertex(width - 40,   deskFrontY);
  vertex(width - 60,   deskBackY);
  vertex(60,           deskBackY);
  endShape(CLOSE);

  // desk top highlight strip (back edge)
  fill(98, 70, 46);
  beginShape();
  vertex(60,         deskBackY);
  vertex(width - 60, deskBackY);
  vertex(width - 65, deskBackY + 3);
  vertex(65,         deskBackY + 3);
  endShape(CLOSE);

  // desk front face
  fill(48, 32, 22);
  rect(40, deskFrontY, width - 80, 30);

  // desk shadow underneath
  fill(0, 0, 0, 120);
  rect(40, deskFrontY + 30, width - 80, 8);

  // wood grain on desk top
  stroke(58, 40, 26, 120);
  strokeWeight(1);
  for (let i = 0; i < 8; i++) {
    let yy = deskBackY + (deskFrontY - deskBackY) * (i / 8);
    line(70 + i * 10, yy, width - 70 - i * 5, yy);
  }
  noStroke();

  // ---- MONITOR (drawn first so the mug/notebook can shadow onto it if needed) ----
  // The bezel's bottom edge sits ON the desk surface (= restY).
  // Bezel total height = scrH0 + 38, so bezel top = restY - (scrH0 + 38).
  // We want the screen rect centered at (scrCx, scrCy), so:
  //   scrCy - scrH0/2 - 14 (bezel top)  ==  restY - (scrH0 + 38)
  // We trust the caller passed a scrCy that satisfies this; otherwise we offset
  // everything off scrCy. (Caller already does this.)
  let bezelTop = scrCy - scrH0 / 2 - 14;
  let bezelBot = scrCy + scrH0 / 2 + 24;       // bottom of bezel
  let bezelLeft  = scrCx - scrW0 / 2 - 18;
  let bezelRight = scrCx + scrW0 / 2 + 18;
  let bezelW = bezelRight - bezelLeft;
  let bezelH = bezelBot - bezelTop;

  // Stand: from desk surface UP to the underside of the monitor bezel.
  let standTop = bezelBot;          // attaches to bottom of bezel
  let standBot = restY;             // sits on desk
  // Stand neck
  fill(40, 40, 46);
  rect(scrCx - 8, standTop, 16, max(0, standBot - standTop - 4));
  // Stand base — flat disc on the desk
  fill(28, 28, 32);
  rect(scrCx - 40, standBot - 6, 80, 6, 2);
  // contact shadow under stand
  fill(0, 0, 0, 80);
  ellipse(scrCx, standBot, 90, 6);

  // Bezel — outer body
  fill(220, 218, 205);
  rect(bezelLeft, bezelTop, bezelW, bezelH, 6);
  // body shading (bottom band)
  fill(190, 188, 175, 100);
  rect(bezelLeft, bezelBot - 16, bezelW, 16, 6);
  // brand label
  noStroke();
  fill(70, 70, 70);
  textFont(myFont);
  textSize(9);
  textAlign(RIGHT, CENTER);
  text("WOPR-CRT", bezelRight - 6, bezelBot - 8);
  // power LED
  fill(0, 230, 110);
  ellipse(bezelLeft + 12, bezelBot - 8, 4, 4);
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "rgba(0, 230, 110, 0.8)";
  ellipse(bezelLeft + 12, bezelBot - 8, 4, 4);
  drawingContext.shadowBlur = 0;

  // Inner bezel ridge
  noFill();
  stroke(150, 148, 138);
  strokeWeight(1);
  rect(scrCx - scrW0 / 2 - 8, scrCy - scrH0 / 2 - 6, scrW0 + 16, scrH0 + 12, 4);
  noStroke();

  // Screen itself
  fill(2, 8, 4);
  rect(scrCx - scrW0 / 2, scrCy - scrH0 / 2, scrW0, scrH0, 3);

  // Glass highlight
  let hg = drawingContext.createLinearGradient(
    scrCx - scrW0 / 2, scrCy - scrH0 / 2,
    scrCx + scrW0 / 2, scrCy + scrH0 / 2
  );
  hg.addColorStop(0, "rgba(255,255,255,0.06)");
  hg.addColorStop(0.5, "rgba(255,255,255,0)");
  drawingContext.fillStyle = hg;
  drawingContext.fillRect(
    scrCx - scrW0 / 2, scrCy - scrH0 / 2, scrW0, scrH0
  );

  // ---- COFFEE MUG (sits ON desk surface, left of monitor) ----
  // Bottom of mug = restY. Mug body is 30 tall.
  let mugBaseY = restY;
  let mugX = bezelLeft - 60;
  let mugBodyH = 32;
  let mugBodyW = 28;

  // contact shadow
  fill(0, 0, 0, 110);
  ellipse(mugX, mugBaseY, mugBodyW + 6, 6);
  // body
  fill(180, 60, 50);
  rect(mugX - mugBodyW / 2, mugBaseY - mugBodyH, mugBodyW, mugBodyH, 3);
  // base ring
  fill(150, 45, 38);
  rect(mugX - mugBodyW / 2, mugBaseY - 4, mugBodyW, 4, 2);
  // handle
  noFill();
  stroke(150, 45, 38);
  strokeWeight(3);
  arc(mugX + mugBodyW / 2 + 4, mugBaseY - mugBodyH / 2 - 2, 14, 18, -HALF_PI, HALF_PI);
  noStroke();
  // rim (top opening)
  fill(40, 12, 8);
  ellipse(mugX, mugBaseY - mugBodyH, mugBodyW, 7);
  // coffee surface
  fill(60, 30, 18);
  ellipse(mugX, mugBaseY - mugBodyH + 0.5, mugBodyW - 6, 5);

  // ---- NOTEBOOK / PAPERS (sits ON desk, right of monitor) ----
  let pX = bezelRight + 60;
  let pBaseY = restY;            // bottom edge sits on desk
  let pW = 64;
  let pH = 44;
  // contact shadow
  fill(0, 0, 0, 100);
  rect(pX - pW / 2 + 2, pBaseY - 2, pW, 4);
  // pages stack — back page peeks out
  fill(232, 220, 190);
  rect(pX - pW / 2 + 2, pBaseY - pH + 3, pW, pH - 6);
  // top page
  fill(245, 235, 205);
  rect(pX - pW / 2, pBaseY - pH, pW, pH - 4);
  // ruled lines
  stroke(150, 130, 95, 160);
  strokeWeight(0.8);
  for (let i = 0; i < 5; i++) {
    line(pX - pW / 2 + 4, pBaseY - pH + 8 + i * 6,
         pX + pW / 2 - 4, pBaseY - pH + 8 + i * 6);
  }
  noStroke();

  pop();
}


// Draws the boot/prompt text inside the monitor's screen rectangle.
// Uses the canvas drawingContext clip so text never escapes the screen.
function drawMonitorScreenContent(scrCx, scrCy, scrW0, scrH0, zoom) {
  push();

  // Clip to the screen rect so text stays inside the monitor
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(
    scrCx - scrW0 / 2, scrCy - scrH0 / 2, scrW0, scrH0
  );
  drawingContext.clip();

  // CRT-green phosphor wash
  noStroke();
  fill(0, 40, 20, 80);
  rect(scrCx - scrW0 / 2, scrCy - scrH0 / 2, scrW0, scrH0);

  // Helper: position as percentage of the screen rect.
  // Because the parent transform scales the entire scene (including text
  // sizes drawn here), using percentages keeps the layout looking the same
  // at every zoom step.
  let sx = scrCx - scrW0 / 2;
  let sy = scrCy - scrH0 / 2;

  textFont(myFont);
  textAlign(LEFT, TOP);

  if (clicked) {
    if (loading) {
      // Boot text — phosphor green
      glowColor(80, 255, 120, 8);
      fill(110, 255, 145);

      // Top-left header block — 5% padding from the screen edges
      let padX = scrW0 * 0.06;
      let padY = scrH0 * 0.06;

      textSize(scrH0 * 0.07);
      text("NORAD // W.O.P.R.", sx + padX, sy + padY);

      // Centered LOADING + dots
      textAlign(CENTER, CENTER);
      textSize(scrH0 * 0.13);
      text("LOADING", scrCx, scrCy - scrH0 * 0.04);

      if (frameCount % 60 == 0) {
        if (dots != 3) dots++; else dots = 1;
      }
      text(".".repeat(dots), scrCx, scrCy + scrH0 * 0.10);

      // Progress bar near the bottom
      let barW = scrW0 * 0.85;
      let barH = scrH0 * 0.04;
      let barX = scrCx - barW / 2;
      let barY = sy + scrH0 - scrH0 * 0.12;
      noFill();
      stroke(0, 200, 70);
      strokeWeight(1);
      rect(barX, barY, barW, barH);
      noStroke();
      let bootElapsed = frameCount - bootStartFrame;
      let prog = constrain(bootElapsed / 480, 0, 1);
      fill(110, 255, 145);
      rect(barX + 1, barY + 1, (barW - 2) * prog, barH - 2);
      noGlow();

      if (bootElapsed >= 480) loading = false;
      textAlign(LEFT, TOP);
    } else {
      // Prompt phase: greeting + YES/NO option hints + input prompt
      glowColor(80, 255, 120, 10);
      fill(110, 255, 145);

      let padX = scrW0 * 0.06;
      let padY = scrH0 * 0.18;

      textSize(scrH0 * 0.08);
      if (frameCount % 10 == 0) {
        if (index <= texts[1].length) {
          displayText = texts[1].substring(0, index++);
          if (index < texts[1].length) displayText = displayText + "_";
        } else {
          writing = true;
        }
      }
      text(displayText || "", sx + padX, sy + padY);

      if (writing) {
        // Show option hints (dim) once typing is enabled
        fill(60, 200, 100);
        textSize(scrH0 * 0.07);
        text("> YES", sx + padX, sy + padY + scrH0 * 0.15);
        text("> NO",  sx + padX, sy + padY + scrH0 * 0.24);

        // Active input line below the hints, brighter
        fill(130, 255, 160);
        textSize(scrH0 * 0.08);
        let cursor = (frameCount % 60 < 30) ? "_" : " ";
        text("> " + textInput + cursor,
             sx + padX, sy + padY + scrH0 * 0.36);
      }
      noGlow();
    }
  } else {
    // Idle state — header + centered click hint
    fill(40, 180, 90);
    let padX = scrW0 * 0.06;
    let padY = scrH0 * 0.06;
    textSize(scrH0 * 0.07);
    glowColor(80, 255, 120, 5);
    text("WOPR READY.", sx + padX, sy + padY);
    text("AWAITING CONNECTION...", sx + padX, sy + padY + scrH0 * 0.08);

    textAlign(CENTER, CENTER);
    textSize(scrH0 * 0.08);
    let blink = (frameCount % 60 < 30);
    fill(blink ? 130 : 70, blink ? 255 : 200, blink ? 145 : 110);
    text("[ CLICK SCREEN TO CONNECT ]", scrCx, sy + scrH0 * 0.85);
    noGlow();
    textAlign(LEFT, TOP);
  }

  // Subtle scanlines on the screen even before zoom — feels alive
  noStroke();
  for (let yy = scrCy - scrH0 / 2; yy < scrCy + scrH0 / 2; yy += 3) {
    fill(0, 0, 0, 40);
    rect(scrCx - scrW0 / 2, yy, scrW0, 1);
  }

  drawingContext.restore();
  pop();
}

function drawTitleClickPrompt(cx, cy) {
  push();
  textFont(myFont);
  textAlign(CENTER, CENTER);
  let blink = (frameCount % 70 < 35);
  fill(blink ? 200 : 120, blink ? 220 : 140, blink ? 255 : 180);
  textSize(16);
  text("CLICK THE MONITOR TO BEGIN", cx, cy);
  pop();
}


// ============================================================
//  LOBBY / ROUTING
// ============================================================
function successlobby() {
  // Win takes priority — if the player typed DEFCONV, lock to the victory screen
  if (winMode) {
    drawVictoryScreen();
    return;
  }
  // If the 15-min timer hit 0, lock to the failure screen no matter what
  if (failureMode) {
    drawFailureScreen();
    return;
  }
  // Auto-flip failureMode if elapsed has passed (covers screens that don't
  // call getTimerDisplayString every frame — e.g. zoom-on-newspaper)
  if (timerStartMs !== null && (millis() - timerStartMs) >= TIMER_DURATION_MS) {
    failureMode = true;
    failureStartMs = millis();
    failureTypedIndex = 0;
    drawFailureScreen();
    return;
  }

  background(C_BG[0], C_BG[1], C_BG[2]);

  if (screen === "lobby") {
    drawLobbyBackground();
    updateAppTileHovers();
    drawSidebarShortcuts();
    drawMiniTerminalWindow();
    drawLobbyStatusBar();
  } else if (screen === "challenge one") {
    drawPasswordScreen();
  } else if (screen === "success") {
    drawSuccessScreen();
  } else if (screen === "newspaper") {
    drawNewspaperScreen();
  } else if (screen === "cipher") {
    drawCipherScreen();
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

// DEFCON readout — V IV III II I, drawn into the right side of the header.
// `activeLevel` is 1..5; that one glows, others are dim.
function drawDefconReadout(activeLevel) {
  let levels = [
    { label: "V",   value: 5 },
    { label: "IV",  value: 4 },
    { label: "III", value: 3 },
    { label: "II",  value: 2 },
    { label: "I",   value: 1 }
  ];

  push();
  textFont(myFont);
  textAlign(CENTER, CENTER);

  // "DEFCON" label first, then the 5 boxes
  let baseY = 50;
  let boxW = 30;
  let boxH = 26;
  let gap = 4;
  let totalW = 5 * boxW + 4 * gap;

  // right-edge-anchored layout
  let endX = width - 40;
  let startX = endX - totalW;

  // "DEFCON" sits to the left of the row
  noStroke();
  crtGlow(0.4);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textSize(14);
  textAlign(RIGHT, CENTER);
  text("DEFCON", startX - 8, baseY);
  noGlow();

  rectMode(CORNER);
  for (let i = 0; i < levels.length; i++) {
    let lv = levels[i];
    let bx = startX + i * (boxW + gap);
    let by = baseY - boxH / 2;
    let active = (lv.value === activeLevel);

    // box
    if (active) {
      let pulse = 0.6 + 0.4 * sin(frameCount * 0.12);
      drawingContext.shadowBlur = 18 * pulse;
      drawingContext.shadowColor = "rgba(80, 255, 130, 0.9)";
      noFill();
      stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
      strokeWeight(1.6);
    } else {
      noGlow();
      noFill();
      stroke(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
      strokeWeight(1);
    }
    rect(bx, by, boxW, boxH, 2);
    noGlow();

    // label
    noStroke();
    if (active) {
      crtGlow(0.7);
      fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    } else {
      fill(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
    }
    textAlign(CENTER, CENTER);
    textSize(active ? 15 : 13);
    text(lv.label, bx + boxW / 2, by + boxH / 2);
    noGlow();
  }
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

function getFooterLabelRect(label) {
  textFont(myFont);
  textSize(15);

  return {
    x: 40,
    y: height - 50,
    w: textWidth(label) + 18,
    h: 24
  };
}

function getFooterExitRect() {
  return getFooterLabelRect("[ EXIT ] CLICK TO RETURN TO LOBBY");
}

function getFooterBackRect() {
  return getFooterLabelRect("[ BACK ] RETURN TO TERMINAL");
}

function footerExitClicked() {
  let r = getFooterExitRect();
  return mouseX >= r.x && mouseX <= r.x + r.w &&
         mouseY >= r.y && mouseY <= r.y + r.h;
}

function footerBackClicked() {
  let r = getFooterBackRect();
  return mouseX >= r.x && mouseX <= r.x + r.w &&
         mouseY >= r.y && mouseY <= r.y + r.h;
}

function leaveFinalPuzzle() {
  screen = "challenge one";
  typedText = "";
  currentIndex = 0;
  lastSwitch = millis();
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

  // ---- Top-right: ACCESS:DENIED reveal (linked to game timer) ----
  // Turn red as a warning once ≤30% of the timer remains. Also strobe.
  let warning = false;
  if (timerStartMs !== null) {
    let frac = (millis() - timerStartMs) / TIMER_DURATION_MS;
    if (frac >= 0.7) warning = true;
  }
  if (warning) {
    // Strobe — alternate every ~10 frames between bright red and dim red
    let strobe = (frameCount % 20 < 10);
    if (strobe) {
      drawingContext.shadowBlur = 18;
      drawingContext.shadowColor = "rgba(255, 80, 80, 1.0)";
      fill(255, 130, 130);
    } else {
      drawingContext.shadowBlur = 6;
      drawingContext.shadowColor = "rgba(255, 80, 80, 0.4)";
      fill(140, 30, 30);
    }
  }
  textAlign(RIGHT, CENTER);
  textSize(15);
  text(getTimerDisplayString(), width - 10, 12);
  noGlow();
  pop();
}

// Returns the partially-revealed/scrambled ACCESS:DENIED string based on the
// elapsed game-timer fraction. As more time passes, more letters lock to their
// correct value; unlocked positions cycle through random characters.
function getTimerDisplayString() {
  if (timerStartMs === null) return TIMER_TARGET;

  let elapsed = millis() - timerStartMs;
  let frac = constrain(elapsed / TIMER_DURATION_MS, 0, 1);
  let totalChars = TIMER_TARGET.length;
  // Number of locked-in letters scales with elapsed fraction
  let lockedCount = Math.floor(frac * totalChars);
  // Once we hit 0:00, set failure mode (caller checks this each frame too)
  if (elapsed >= TIMER_DURATION_MS && !failureMode) {
    failureMode = true;
    failureStartMs = millis();
    failureTypedIndex = 0;
  }

  let scrambleSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*!?:";
  let out = "";
  // Use a fast cycling clock so unlocked chars visibly scramble
  // (changes ~every 3 frames)
  let cycle = Math.floor(frameCount / 3);
  for (let i = 0; i < totalChars; i++) {
    let trueCh = TIMER_TARGET.charAt(i);
    if (i < lockedCount) {
      // locked — show the real letter
      out += trueCh;
    } else {
      // unlocked — random char (skip ':' as a randomization for cleanliness)
      // Deterministic per (i, cycle) so they look like they're "computing"
      let seed = (i * 37 + cycle * 13) % scrambleSet.length;
      // mix in a non-linear hop so adjacent positions scramble differently
      seed = (seed + Math.floor(Math.sin(cycle * 0.7 + i) * 1000)) % scrambleSet.length;
      if (seed < 0) seed += scrambleSet.length;
      out += scrambleSet.charAt(seed);
    }
  }
  return out;
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

  // dynamic hint — depends on which app is hovered
  textAlign(RIGHT, CENTER);
  let hoveredApp = appTiles.find(function (a) { return a.hovered; });
  let hint;
  if (hoveredApp) {
    hint = "[ CLICK ] OPEN " + hoveredApp.label.toUpperCase();
  } else {
    hint = "SELECT APPLICATION";
  }
  text(hint, width - 10, height - 12);
  noGlow();
  pop();
}



// ============================================================
//  SIDEBAR SHORTCUTS  +  LIVE MINI TERMINAL (lobby content)
// ============================================================
function updateAppTileHovers() {
  for (let i = 0; i < appTiles.length; i++) {
    let a = appTiles[i];
    a.hovered =
      mouseX >= a.x && mouseX <= a.x + a.w &&
      mouseY >= a.y && mouseY <= a.y + a.h;
  }
  // mini-terminal hover (everything except the title bar — title bar isn't a hot zone)
  let r = miniTermRect;
  miniTermHovered =
    mouseX >= r.x && mouseX <= r.x + r.w &&
    mouseY >= r.y && mouseY <= r.y + r.h;
}

function drawSidebarShortcuts() {
  push();
  // Sidebar panel (a faint vertical strip down the left)
  noStroke();
  fill(6, 16, 10);
  rect(0, 25, 130, height - 49);
  stroke(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
  strokeWeight(1);
  line(130, 25, 130, height - 24);

  // little label up top
  noStroke();
  crtGlow(0.3);
  fill(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  textFont(myFont);
  textSize(12);
  textAlign(CENTER, TOP);
  text("APPS", 70, 35);
  noGlow();
  pop();

  // Each shortcut
  for (let i = 0; i < appTiles.length; i++) {
    drawSidebarShortcut(appTiles[i]);
  }
}

function drawSidebarShortcut(a) {
  push();
  rectMode(CORNER);

  // hover background
  if (a.hovered) {
    noStroke();
    fill(0, 50, 22);
    rect(a.x - 4, a.y - 4, a.w + 8, a.h + 8, 4);
    crtGlow(0.7);
    noFill();
    stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    strokeWeight(1.4);
    rect(a.x - 4, a.y - 4, a.w + 8, a.h + 8, 4);
    noGlow();
  }

  // icon centered horizontally inside the shortcut, near the top
  let iconCx = a.x + a.w / 2;
  let iconCy = a.y + 30;
  drawAppIcon(a.icon, iconCx, iconCy, a.hovered);

  // label under icon
  noStroke();
  crtGlow(a.hovered ? 0.5 : 0.25);
  fill(a.hovered ? C_GREEN_HI[0] : C_GREEN[0],
       a.hovered ? C_GREEN_HI[1] : C_GREEN[1],
       a.hovered ? C_GREEN_HI[2] : C_GREEN[2]);
  textFont(myFont);
  textAlign(CENTER, TOP);
  textSize(15);
  text(a.label, a.x + a.w / 2, a.y + 64);
  noGlow();
  pop();
}

function drawAppIcon(kind, cx, cy, hover) {
  push();
  rectMode(CENTER);
  noFill();
  let col = hover ? C_GREEN_HI : C_GREEN;
  stroke(col[0], col[1], col[2]);
  strokeWeight(1.6);
  crtGlow(hover ? 0.7 : 0.35);

  if (kind === "terminal") {
    // monitor body
    rect(cx, cy, 44, 32, 2);
    // screen inset
    rect(cx, cy - 1, 36, 24, 1.5);
    // prompt text inside
    noStroke();
    fill(col[0], col[1], col[2]);
    textFont(myFont);
    textSize(11);
    textAlign(LEFT, CENTER);
    text(">_", cx - 14, cy - 1);
    // stand
    stroke(col[0], col[1], col[2]);
    strokeWeight(1.4);
    line(cx - 6, cy + 18, cx + 6, cy + 18);
    line(cx,     cy + 16, cx,     cy + 18);
  } else if (kind === "newspaper") {
    // folded paper
    rect(cx, cy, 38, 36, 1.5);
    // header band
    stroke(col[0], col[1], col[2]);
    line(cx - 15, cy - 11, cx + 15, cy - 11);
    line(cx - 15, cy - 9,  cx + 15, cy - 9);
    // title pseudo-text
    noStroke();
    fill(col[0], col[1], col[2]);
    textFont(myFont);
    textSize(7);
    textAlign(CENTER, CENTER);
    text("HERALD", cx, cy - 15);
    // body lines
    stroke(col[0], col[1], col[2]);
    strokeWeight(0.9);
    for (let i = 0; i < 4; i++) {
      let ly = cy - 5 + i * 4;
      let lw = (i % 2 === 0) ? 14 : 11;
      line(cx - 15, ly, cx - 15 + lw, ly);
      line(cx + 1,  ly, cx + 1 + lw - 2, ly);
    }
    // column divider
    line(cx - 1, cy - 5, cx - 1, cy + 11);
  } else if (kind === "cipher") {
    // small notepad — lines ruled inside
    rect(cx, cy, 36, 36, 1.5);
    // top binding strip
    stroke(col[0], col[1], col[2]);
    strokeWeight(0.9);
    line(cx - 18, cy - 11, cx + 18, cy - 11);
    // ruled lines
    for (let i = 0; i < 4; i++) {
      let ly = cy - 6 + i * 5;
      line(cx - 14, ly, cx + 14, ly);
    }
    // dog-ear corner
    noStroke();
    fill(col[0], col[1], col[2], 80);
    triangle(cx + 12, cy - 18, cx + 18, cy - 18, cx + 18, cy - 12);
  }
  noGlow();
  pop();
}


function drawMiniTerminalWindow() {
  let r = miniTermRect;

  push();
  rectMode(CORNER);

  // Window drop shadow
  noStroke();
  fill(0, 0, 0, 110);
  rect(r.x + 5, r.y + 5, r.w, r.h, 3);

  // Window body — black like a real terminal (purely decorative, no hover state)
  fill(0);
  stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  strokeWeight(1);
  crtGlow(0.25);
  rect(r.x, r.y, r.w, r.h, 3);
  noGlow();

  // Title bar — Windows-style blue strip
  noStroke();
  fill(0, 90, 170);
  rect(r.x, r.y, r.w, 26, 3);
  // square off bottom of title bar
  rect(r.x, r.y + 18, r.w, 8);

  // Title bar icon
  noStroke();
  fill(20, 50, 90);
  rect(r.x + 6, r.y + 5, 16, 16, 1);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textSize(11);
  textAlign(LEFT, CENTER);
  text("C:\\>", r.x + 9, r.y + 13);

  // Title bar label
  fill(255);
  textFont(myFont);
  textSize(13);
  textAlign(LEFT, CENTER);
  text("Developer Command Prompt for VS2015", r.x + 28, r.y + 13);

  // Window controls (—  ☐  ✕)
  textAlign(CENTER, CENTER);
  textSize(14);
  fill(220);
  text("—", r.x + r.w - 56, r.y + 13);
  noFill();
  stroke(220);
  strokeWeight(1);
  rect(r.x + r.w - 41, r.y + 8, 10, 9);
  // X
  noFill();
  // close button background hover-look
  noStroke();
  fill(200, 50, 50);
  rect(r.x + r.w - 24, r.y, 24, 26, 0, 3, 0, 0);
  fill(255);
  textFont(myFont);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("X", r.x + r.w - 12, r.y + 13);

  // === TERMINAL CONTENT (mimics the screenshot) =================
  let cx = r.x + 14;
  let cy = r.y + 38;
  let lineH = 18;

  noStroke();
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textSize(15);
  textAlign(LEFT, TOP);
  crtGlow(0.4);

  let lines = [
    "c:\\users\\falken\\Desktop>clip /?",
    "",
    "CLIP",
    "",
    "Description:",
    "    In 45 minutes, this automated system will initate Protocol: Cleanse.",
    "    Prove your intelligence. Prove your kind deserves to live.",
    "",
    "Parameter List:",
    "    /?              Do not rely only on software.",
    "",
    "Imperative:",
    "    DIR | CLIP      Leave nothing unturned.",
    "",
    "    CLIP < README.TXT  XIRXFRGH",
    "",
    "c:\\users\\falken\\Desktop>ver | clip",
    "",
    "c:\\users\\falken\\Desktop>",
    "c:\\users\\falken\\Desktop>Microsoft Windows [Version 10.0.10586]"
  ];

  for (let i = 0; i < lines.length; i++) {
    let ly = cy + i * lineH;
    if (ly + lineH > r.y + r.h - 6) break; // clip overflow
    text(lines[i], cx, ly);
  }

  noGlow();

  // (The mini terminal is decorative-only — clicking it does nothing.
  //  Use the Terminal shortcut in the left sidebar to open the W.O.P.R.
  //  password screen.)

  pop();
}


// ============================================================
//  CIPHER KEY SCREEN  (was sticky note on desk)
// ============================================================
function drawCipherScreen() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("NOTES // PERSONAL ARCHIVE",
                     "FILE: NOTE-04.SCAN");

  if (cipherNoteBuffer === null) {
    cipherNoteBuffer = createGraphics(310, 390);
    cipherNoteBuffer.pixelDensity(2);
    buildCipherNote(cipherNoteBuffer);
  }

  imageMode(CORNER);
  let nw = 310;
  let nh = 390;
  let nx = (width - nw) / 2;
  let ny = 100;
  image(cipherNoteBuffer, nx, ny, nw, nh);

  // green CRT wash over paper (so it feels rendered "on" the terminal)
  push();
  noStroke();
  fill(0, 110, 38, 50);
  rect(nx, ny, nw, nh);
  pop();

  // helper text below
  push();
  crtGlow(0.3);
  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textFont(myFont);
  textSize(14);
  textAlign(CENTER, TOP);
  text("> SCANNED NOTE FROM PERSONAL FILES.",
       width / 2, ny + nh + 14);
  noGlow();
  pop();

  drawTerminalFooter("[ CLICK ] RETURN TO LOBBY",
                     "NOTE • CLASSIFIED");
}

// Builds the cipher key onto an offscreen buffer.
// Same content as the old sticky note, scaled up for a full-screen display.
function buildCipherNote(g) {
  let nw = g.width;
  let nh = g.height;

  // paper body
  g.background(255, 240, 110);
  g.stroke(180, 165, 50);
  g.strokeWeight(1.5);
  g.noFill();
  g.rect(1, 1, nw - 2, nh - 2);

  // folded corner
  g.noStroke();
  g.fill(210, 195, 70);
  g.triangle(nw - 28, 0, nw, 0, nw, 28);
  g.fill(170, 155, 45);
  g.triangle(nw - 28, 0, nw, 28, nw - 28, 28);

  // Title
  g.fill(40, 28, 0);
  g.noStroke();
  g.textFont("Arial");
  g.textStyle(BOLD);
  g.textSize(18);
  g.textAlign(CENTER, TOP);
  g.text("NOTE", nw / 2, 14);

  // Grid
  let gridX = 24;
  let gridY = 50;
  let cellW = 86;
  let cellH = 108;

  g.stroke(70, 50, 0);
  g.strokeWeight(2);
  g.line(gridX + cellW,     gridY, gridX + cellW,     gridY + 3 * cellH);
  g.line(gridX + 2 * cellW, gridY, gridX + 2 * cellW, gridY + 3 * cellH);
  g.line(gridX, gridY + cellH,     gridX + 3 * cellW, gridY + cellH);
  g.line(gridX, gridY + 2 * cellH, gridX + 3 * cellW, gridY + 2 * cellH);

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

  g.textFont("Arial");
  g.textStyle(NORMAL);
  g.textSize(15);
  for (let i = 0; i < 9; i++) {
    let row = Math.floor(i / 3);
    let col = i % 3;
    let cx = gridX + col * cellW + cellW / 2;
    let cy = gridY + row * cellH;
    let cell = cells[i];
    let symY = cy + 24;
    let symR = 5;

    // Parse the letter list (e.g. "N, M, A,") into individual letters in order.
    // Then we lay them out left-to-right at a fixed left edge, and place
    // symbols directly above letter 2 and letter 3 using textWidth measurements.
    let letters = cell.letters
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });

    let letterY = cy + 42;
    let letterX = cx - 28; // left edge of the letter row inside the cell
    let gap = 8;           // visual gap between letters

    // Compute X centre of each letter as we lay them out.
    let centres = [];
    let cursor = letterX;
    for (let k = 0; k < letters.length; k++) {
      let glyph = letters[k] + ",";
      let w = g.textWidth(glyph);
      centres.push(cursor + w / 2);
      cursor += w + gap;
    }

    // Symbols above letters 2 and 3 (if those letters exist)
    if (cell.circle && centres.length >= 2) {
      g.stroke(70, 70, 70);
      g.strokeWeight(1.4);
      g.noFill();
      g.ellipse(centres[1], symY, symR * 2, symR * 2);
    }
    if (cell.cross && centres.length >= 3) {
      g.stroke(70, 70, 70);
      g.strokeWeight(1.4);
      g.noFill();
      let xc = centres[2];
      g.line(xc - 4, symY - 4, xc + 4, symY + 4);
      g.line(xc + 4, symY - 4, xc - 4, symY + 4);
    }

    // Draw letters
    g.noStroke();
    g.fill(40, 30, 0);
    g.textAlign(LEFT, TOP);
    cursor = letterX;
    for (let k = 0; k < letters.length; k++) {
      let glyph = letters[k] + ",";
      g.text(glyph, cursor, letterY);
      cursor += g.textWidth(glyph) + gap;
    }
  }

  // "tape" strip at top
  g.fill(255, 255, 255, 140);
  g.noStroke();
  g.rect(nw / 2 - 55, -8, 110, 18);
}


// ============================================================
//  NEWSPAPER SCREEN
// ============================================================
function drawNewspaperScreen() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();

  // If a section is zoomed, render that view and bail out
  if (zoomedSection !== null) {
    drawNewspaperZoom();
    return;
  }

  drawTerminalHeader("EVIDENCE // ARCHIVE SCAN", "FILE: HERALD-05221927.SCAN");

  if (newspaperBuffer === null) {
    newspaperBuffer = createGraphics(500, 600);
    newspaperBuffer.pixelDensity(2);  // sharper text when scaled
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

  // Detect hovered section + draw hover halo
  hoveredNewspaperSection = null;
  for (let i = 0; i < newspaperSections.length; i++) {
    let s = newspaperSections[i];
    let rx = nx + s.sx * targetW;
    let ry = ny + s.sy * targetH;
    let rw = s.sw * targetW;
    let rh = s.sh * targetH;
    let hover = mouseX >= rx && mouseX <= rx + rw &&
                mouseY >= ry && mouseY <= ry + rh;
    if (hover) hoveredNewspaperSection = s;

    push();
    noFill();
    if (hover) {
      crtGlow(0.9);
      stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
      strokeWeight(2);
      rect(rx, ry, rw, rh, 2);
      noGlow();
      // corner brackets
      stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
      strokeWeight(2);
      let b = 8;
      line(rx, ry, rx + b, ry);
      line(rx, ry, rx, ry + b);
      line(rx + rw, ry, rx + rw - b, ry);
      line(rx + rw, ry, rx + rw, ry + b);
      line(rx, ry + rh, rx + b, ry + rh);
      line(rx, ry + rh, rx, ry + rh - b);
      line(rx + rw, ry + rh, rx + rw - b, ry + rh);
      line(rx + rw, ry + rh, rx + rw, ry + rh - b);
    }
    pop();
  }

  let footerHint = hoveredNewspaperSection
    ? "[ CLICK ] ZOOM " + hoveredNewspaperSection.title.toUpperCase()
    : "[ CLICK ] RETURN TO LOBBY";
  drawTerminalFooter(footerHint, "SOURCE: NYC ARCHIVE");
}

// Fullscreen view of a single newspaper section, rendered fresh
// (no buffer scaling, so text is crisp)
function drawNewspaperZoom() {
  let s = zoomedSection;
  let content = newspaperContent[s.id];

  drawTerminalHeader("ARCHIVE SCAN // " + s.title.toUpperCase(),
                     "FILE: HERALD-05221927.SCAN");

  push();
  // Paper-style content panel
  rectMode(CORNER);
  let px = 60;
  let py = 100;
  let pw = width - 120;
  let ph = height - 170;

  // backing
  noStroke();
  fill(246, 242, 232);
  rect(px, py, pw, ph, 2);
  // subtle paper border
  stroke(60);
  strokeWeight(1);
  noFill();
  rect(px, py, pw, ph, 2);

  // very faint green wash so it still feels "on the terminal"
  noStroke();
  fill(0, 110, 38, 28);
  rect(px, py, pw, ph, 2);

  // Section title (newspaper-style header)
  noStroke();
  fill(20);
  textFont("Times New Roman");
  textStyle(BOLD);
  textSize(28);
  textAlign(LEFT, TOP);
  text(s.title, px + 24, py + 22);

  // double rule under title
  stroke(40);
  strokeWeight(1);
  line(px + 24, py + 60, px + pw - 24, py + 60);
  line(px + 24, py + 64, px + pw - 24, py + 64);

  // Body content
  noStroke();
  fill(20);
  textFont("Times New Roman");
  textStyle(NORMAL);

  if (content && content.lines) {
    // Masthead: render each line larger
    textSize(18);
    let bodyY = py + 80;
    for (let i = 0; i < content.lines.length; i++) {
      let line = content.lines[i];
      if (line === "EXTRA EXTRA!") {
        textStyle(BOLD);
        textSize(36);
        text(line, px + 24, bodyY);
        bodyY += 44;
        textStyle(NORMAL);
        textSize(18);
      } else if (line === "speculation on human nature") {
        textStyle(ITALIC);
        text(line, px + 24, bodyY);
        bodyY += 26;
        textStyle(NORMAL);
      } else if (line.indexOf("NEKLAF") >= 0) {
        textStyle(BOLD);
        textSize(22);
        text(line, px + 24, bodyY);
        bodyY += 30;
        textStyle(NORMAL);
        textSize(18);
      } else {
        text(line, px + 24, bodyY);
        bodyY += 24;
      }
    }
  } else if (s.id === "puzzle") {
    // Render the actual minesweeper board large, with intro/outro prose around it
    textSize(15);
    text("Today's challenge from the Herald Tribune.",
         px + 24, py + 78);

    // Big board centered horizontally
    let boardSize = 280;
    let boardX = px + pw / 2 - boardSize / 2;
    let boardY = py + 110;
    drawZoomedPuzzleBoard(boardX, boardY, boardSize);

    textSize(14);
    fill(50);
    text("Identify the pattern. Answers in tomorrow's edition.",
         px + 24, boardY + boardSize + 30);
  } else if (content && content.body) {
    textSize(18);
    text(content.body, px + 24, py + 80, pw - 48, ph - 110);
  }
  pop();

  drawTerminalFooter("[ CLICK ] BACK TO PAPER", "SECTION: " + s.id.toUpperCase());
}


// ============================================================
//  PASSWORD (CHALLENGE ONE)
// ============================================================
function drawPasswordScreen() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("W.O.P.R. // SECURE ACCESS", "");
  drawDefconReadout(5);

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
  let promptPrefix = usernamePromptDismissed ? "> " : "> ENTER USERNAME: ";
  text(promptPrefix + typedText + cursor, 55, 220);

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
  drawTerminalHeader("W.O.P.R. // ACCESS GRANTED", "");
  drawDefconReadout(5);

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
//  VICTORY SCREEN — appears when the player types DEFCONV
// ============================================================
function drawVictoryScreen() {
  // Soft blue background
  background(2, 8, 18);

  // Calm pulsing blue vignette
  push();
  noStroke();
  let pulse = 0.5 + 0.3 * sin(frameCount * 0.08);
  let g = drawingContext.createRadialGradient(
    width / 2, height / 2, 60,
    width / 2, height / 2, height
  );
  g.addColorStop(0, "rgba(80, 160, 230, " + (0.30 * pulse) + ")");
  g.addColorStop(1, "rgba(0, 10, 30, 0)");
  drawingContext.fillStyle = g;
  drawingContext.fillRect(0, 0, width, height);
  pop();

  drawTerminalFrame();

  // Header — light blue
  push();
  noStroke();
  fill(0, 25, 50);
  rect(25, 25, width - 50, 50);
  drawingContext.shadowBlur = 14;
  drawingContext.shadowColor = "rgba(150, 220, 255, 0.85)";
  fill(180, 230, 255);
  textFont(myFont);
  textSize(22);
  textAlign(LEFT, CENTER);
  text("SYSTEM // DISABLED", 40, 50);
  textAlign(RIGHT, CENTER);
  textSize(15);
  text("STATUS: SAFE", width - 40, 50);
  drawingContext.shadowBlur = 0;
  stroke(80, 160, 220);
  strokeWeight(1);
  line(25, 75, width - 25, 75);
  pop();

  // Big steady SYSTEM DISABLED title (light cyan, gentle pulse)
  push();
  textAlign(CENTER, CENTER);
  textFont(myFont);
  let glow = 0.7 + 0.3 * sin(frameCount * 0.06);
  drawingContext.shadowBlur = 22 * glow;
  drawingContext.shadowColor = "rgba(150, 220, 255, 0.9)";
  fill(190, 235, 255);
  textSize(58);
  text("SYSTEM DISABLED", width / 2, 160);
  drawingContext.shadowBlur = 0;
  pop();

  // Typewriter success message panel
  push();
  textFont(myFont);
  textAlign(LEFT, TOP);
  let panelX = 80;
  let panelY = 240;
  let panelW = width - 160;
  let panelH = 280;

  // Panel backing
  noStroke();
  fill(4, 18, 36);
  rect(panelX, panelY, panelW, panelH, 4);
  noFill();
  stroke(80, 170, 230);
  strokeWeight(1);
  rect(panelX, panelY, panelW, panelH, 4);

  let messages = [
    "> THREAT NEUTRALIZED.",
    "> WARHEADS RECALLED.",
    "> ALL SYSTEMS NOMINAL.",
    "",
    "> Success"
  ];
  let fullText = messages.join("\n");
  let typeSpeed = 4;
  let elapsedFrames = (winStartMs !== null)
    ? Math.floor((millis() - winStartMs) / (1000 / 60))
    : 0;
  let target = Math.min(fullText.length, Math.floor(elapsedFrames / typeSpeed));
  let visible = fullText.substring(0, target);

  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = "rgba(150, 220, 255, 0.7)";
  noStroke();
  fill(180, 230, 255);
  textSize(20);
  text(visible, panelX + 24, panelY + 24);

  if (target >= fullText.length) {
    let cursor = (frameCount % 60 < 30) ? "_" : " ";
    textSize(20);
    text(cursor, panelX + 24, panelY + 24 + (messages.length) * 26);
  }
  drawingContext.shadowBlur = 0;
  pop();

  // Footer
  drawTerminalFooter("// SYSTEM SHUTDOWN COMPLETE",
                     "REFRESH PAGE TO PLAY AGAIN");
}


// ============================================================
//  FAILURE SCREEN — appears when the 15-min timer hits 0
// ============================================================
function drawFailureScreen() {
  // Solid black + heavy red wash
  background(8, 0, 0);

  // Pulsing red vignette
  push();
  noStroke();
  let pulse = 0.7 + 0.3 * sin(frameCount * 0.15);
  let g = drawingContext.createRadialGradient(
    width / 2, height / 2, 60,
    width / 2, height / 2, height
  );
  g.addColorStop(0, "rgba(120, 0, 0, " + (0.35 * pulse) + ")");
  g.addColorStop(1, "rgba(20, 0, 0, 0)");
  drawingContext.fillStyle = g;
  drawingContext.fillRect(0, 0, width, height);
  pop();

  drawTerminalFrame();

  // Header — angry red
  push();
  noStroke();
  fill(40, 0, 0);
  rect(25, 25, width - 50, 50);
  drawingContext.shadowBlur = 14;
  drawingContext.shadowColor = "rgba(255, 60, 60, 0.85)";
  fill(255, 90, 90);
  textFont(myFont);
  textSize(22);
  textAlign(LEFT, CENTER);
  text("SYSTEM // ACCESS:DENIED", 40, 50);
  textAlign(RIGHT, CENTER);
  textSize(15);
  text("TIMER: 00:00", width - 40, 50);
  drawingContext.shadowBlur = 0;
  stroke(180, 30, 30);
  strokeWeight(1);
  line(25, 75, width - 25, 75);
  pop();

  // Big flickering ACCESS:DENIED
  push();
  textAlign(CENTER, CENTER);
  textFont(myFont);
  let flicker = (frameCount % 47 < 3) ? 130 : 255;
  drawingContext.shadowBlur = 22;
  drawingContext.shadowColor = "rgba(255, 50, 50, 0.95)";
  fill(255, flicker * 0.4, flicker * 0.4);
  textSize(58);
  text("ACCESS:DENIED", width / 2, 160);
  drawingContext.shadowBlur = 0;
  pop();

  // Typewriter "> Failure" message — same style as title typing
  push();
  textFont(myFont);
  textAlign(LEFT, TOP);
  let panelX = 80;
  let panelY = 240;
  let panelW = width - 160;
  let panelH = 280;

  // Panel backing
  noStroke();
  fill(20, 0, 0);
  rect(panelX, panelY, panelW, panelH, 4);
  noFill();
  stroke(180, 40, 40);
  strokeWeight(1);
  rect(panelX, panelY, panelW, panelH, 4);

  // Type out the failure message at ~6 frames per character
  let messages = [
    "> CONNECTION TERMINATED.",
    "> SESSION EXPIRED.",
    "> SECURITY OVERRIDE ENGAGED.",
    "",
    "> Failure"
  ];
  let fullText = messages.join("\n");
  let typeSpeed = 4; // frames per char
  let elapsedFrames = (failureStartMs !== null)
    ? Math.floor((millis() - failureStartMs) / (1000 / 60))
    : 0;
  let target = Math.min(fullText.length, Math.floor(elapsedFrames / typeSpeed));
  let visible = fullText.substring(0, target);

  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = "rgba(255, 100, 100, 0.7)";
  noStroke();
  fill(255, 130, 130);
  textSize(20);
  text(visible, panelX + 24, panelY + 24);

  // Blinking cursor at the end of the typed text
  if (target < fullText.length) {
    let cursor = (frameCount % 30 < 15) ? "_" : "";
    // We can't easily know the (x,y) of the end of multiline text without
    // measuring; use a simple fixed cursor at the bottom-left of where the
    // last visible line is, which works because the message ends with "> Failure".
    // p5's text() with \n handles line breaks for us.
  } else {
    // After full message, append a trailing blinking cursor on its own line
    let cursor = (frameCount % 60 < 30) ? "_" : " ";
    textSize(20);
    text(cursor, panelX + 24, panelY + 24 + (messages.length) * 26);
  }
  drawingContext.shadowBlur = 0;
  pop();

  // Footer
  drawTerminalFooter("// GLOBAL THERMONUCLEAR WAR INITIATED",
                     "REFRESH PAGE TO RESTART");
}


// ============================================================
//  PIGEON CIPHER REVEAL
// ============================================================
function drawPigeonCipher() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("CIPHER OUTPUT // DECODED STREAM",
                     "FRAME " + (currentIndex + 1) + " / " + pigeonBoards.length);

  // Draw the current board, large and centered, with no outer borders.
  let board = pigeonBoards[currentIndex];
  if (board) {
    drawPigeonBoard(width / 2, height / 2 - 10, 360, board);
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
  let progress = constrain((currentIndex + elapsed) / pigeonBoards.length, 0, 1);
  rect(barX + 1, barY + 1, (barW - 2) * progress, 8);
  noGlow();

  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textFont(myFont);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("DECODING TRANSMISSION...", width / 2, barY - 14);
  pop();

  drawTerminalFooter("[ BACK ] RETURN TO TERMINAL",
                     "STREAM CONTINUES UNTIL RETURN");

  if (millis() - lastSwitch > INTERVAL) {
    currentIndex++;
    lastSwitch = millis();
    if (currentIndex >= pigeonBoards.length) {
      currentIndex = 0;
    }
  }
}

// Draw a 3x3 tic-tac-toe board centered at (cx, cy) with total size `size`.
// `board` is { cells: 9-char string, strike: bool }.
//   cells: 'O' = circle, 'X' = cross, '.' = empty.
//   strike: when true, draws a horizontal line through the bottom row.
// Style: black cell backgrounds, phosphor-green internal grid lines and symbols.
// No outer border lines — only internal dividers.
function drawPigeonBoard(cx, cy, size, board) {
  let cells = board.cells;
  let strike = !!board.strike;
  let cell = size / 3;
  let topLeftX = cx - size / 2;
  let topLeftY = cy - size / 2;

  push();
  rectMode(CORNER);

  // Cell backgrounds — black squares (so empty cells read as solid black)
  noStroke();
  fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      rect(topLeftX + c * cell, topLeftY + r * cell, cell, cell);
    }
  }

  // Internal grid lines (only the 4 dividing lines — no outer border)
  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor = "rgba(80, 255, 120, 0.7)";
  stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  strokeWeight(2.4);
  // 2 vertical dividers
  line(topLeftX + cell,     topLeftY, topLeftX + cell,     topLeftY + size);
  line(topLeftX + 2 * cell, topLeftY, topLeftX + 2 * cell, topLeftY + size);
  // 2 horizontal dividers
  line(topLeftX, topLeftY + cell,     topLeftX + size, topLeftY + cell);
  line(topLeftX, topLeftY + 2 * cell, topLeftX + size, topLeftY + 2 * cell);
  drawingContext.shadowBlur = 0;

  // Symbols
  let symR = cell * 0.28;          // circle radius
  let symHalf = cell * 0.30;       // X half-extent
  for (let i = 0; i < 9; i++) {
    let r = Math.floor(i / 3);
    let c = i % 3;
    let sx = topLeftX + c * cell + cell / 2;
    let sy = topLeftY + r * cell + cell / 2;
    let ch = cells.charAt(i);

    if (ch === "O") {
      drawingContext.shadowBlur = 14;
      drawingContext.shadowColor = "rgba(120, 255, 150, 0.9)";
      noFill();
      stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
      strokeWeight(3);
      ellipse(sx, sy, symR * 2, symR * 2);
      drawingContext.shadowBlur = 0;
    } else if (ch === "X") {
      drawingContext.shadowBlur = 14;
      drawingContext.shadowColor = "rgba(120, 255, 150, 0.9)";
      stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
      strokeWeight(3);
      line(sx - symHalf, sy - symHalf, sx + symHalf, sy + symHalf);
      line(sx + symHalf, sy - symHalf, sx - symHalf, sy + symHalf);
      drawingContext.shadowBlur = 0;
    }
    // '.' renders as nothing — empty black cell
  }

  // Strikethrough on the bottom row (used for letter V)
  if (strike) {
    drawingContext.shadowBlur = 16;
    drawingContext.shadowColor = "rgba(120, 255, 150, 0.95)";
    stroke(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    strokeWeight(3.5);
    let strikeY = topLeftY + 2 * cell + cell / 2; // middle of bottom row
    line(topLeftX + 6, strikeY, topLeftX + size - 6, strikeY);
    drawingContext.shadowBlur = 0;
  }

  pop();
}


// ============================================================
//  CIRCUITS PUZZLE — green CRT theme, grid of toggleable nodes,
//  answer hidden under a lightbulb that brightens with progress.
// ============================================================
function drawCircuitsPuzzle() {
  background(C_BG[0], C_BG[1], C_BG[2]);
  drawTerminalFrame();
  drawTerminalHeader("DIAGNOSTIC // CIRCUIT STABILIZER", "");
  drawDefconReadout(5);

  // Sub-header
  push();
  crtGlow(0.4);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textAlign(LEFT, TOP);
  textSize(15);
  text("> MATCH THE STABLE CONFIGURATION.", 50, 100);

  let activeCount = circuitStates.filter(function (x) { return x; }).length;
  fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  textSize(13);
  text("NODES ACTIVE: " + activeCount + " / 9", 50, 124);

  fill(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  textAlign(RIGHT, TOP);
  text("CLICK A NODE TO TOGGLE", width - 50, 124);
  noGlow();
  pop();

  // Main puzzle elements
  drawCircuitGrid();
  drawAnswerLamp();

  drawTerminalFooter("[ BACK ] RETURN TO TERMINAL",
                     "SUBROUTINE 0x3C • CHECKSUM ACTIVE");
}


// ---- The 3x3 toggle grid with phosphor-green wires ----
//      Layout uses constants below; click handler must mirror them.
function drawCircuitGrid() {
  let startX = 80;
  let startY = 175;
  let cellSize = 100;
  let nodeSize = 46;

  push();
  rectMode(CORNER);

  // WIRES — drawn between every adjacent pair of nodes.
  // A wire glows bright when BOTH endpoints are ON; otherwise it sits dim.
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
    let hover = mouseX >= x && mouseX <= x + nodeSize &&
                mouseY >= y && mouseY <= y + nodeSize;

    if (circuitStates[i]) {
      // Active node — pulsing green fill
      let pulse = 190 + 50 * sin(frameCount * 0.15 + i);
      crtGlow(1);
      fill(60, pulse, 110);
      stroke(180, 255, 200);
      strokeWeight(2);
    } else if (hover) {
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
    rect(x, y, nodeSize, nodeSize, 8);
    noGlow();

    noStroke();
    if (circuitStates[i]) {
      fill(C_BG[0], C_BG[1], C_BG[2]);
      textSize(15);
      text("ON", x + nodeSize / 2, y + nodeSize / 2);
    } else {
      fill(hover ? C_GREEN_HI[0] : C_GREEN[0],
           hover ? C_GREEN_HI[1] : C_GREEN[1],
           hover ? C_GREEN_HI[2] : C_GREEN[2]);
      textSize(13);
      text("OFF", x + nodeSize / 2, y + nodeSize / 2);
    }
  }

  textAlign(LEFT, TOP);
  pop();
}

// ---- The lightbulb + hidden answer panel ----
//      Brightness scales with how many switches the player has correctly
//      turned ON (out of the 5 that should be ON). The TICTACTOE answer
//      stays hidden until the puzzle is fully solved (all 9 match).
function drawAnswerLamp() {
  // Count switches that are ON AND should be ON
  let correctActive = 0;
  for (let i = 0; i < 9; i++) {
    if (circuitStates[i] && circuitSolution[i]) correctActive++;
  }
  let totalCorrect = circuitSolution.filter(function (x) { return x; }).length;
  let brightness = totalCorrect > 0 ? (correctActive / totalCorrect) : 0;

  // Panel rectangle (right side of the screen)
  let panelX = 410;
  let panelY = 165;
  let panelW = 250;
  let panelH = 295;

  push();
  rectMode(CORNER);

  // Panel backing
  noStroke();
  fill(2, 12, 6);
  rect(panelX, panelY, panelW, panelH, 3);

  // Panel border
  crtGlow(0.3);
  noFill();
  stroke(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  strokeWeight(1);
  rect(panelX, panelY, panelW, panelH, 3);
  noGlow();

  // Header
  noStroke();
  crtGlow(0.4);
  fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  textFont(myFont);
  textAlign(CENTER, TOP);
  textSize(14);
  text("MODULE OUTPUT", panelX + panelW / 2, panelY + 10);
  noGlow();

  // Header underline
  stroke(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
  strokeWeight(1);
  line(panelX + 20, panelY + 32, panelX + panelW - 20, panelY + 32);

  // ---- BULB GEOMETRY ----
  let bulbCx = panelX + panelW / 2;
  let bulbCy = panelY + 92;
  let bulbR = 22;

  // Hanging cord from top of panel down to the bulb cap
  noFill();
  stroke(60, 80, 60);
  strokeWeight(1.4);
  line(bulbCx, panelY + 40, bulbCx, bulbCy - bulbR - 2);

  // Outer halo behind bulb (radial gradient) — scales with brightness
  if (brightness > 0) {
    let glowR = 50 + 90 * brightness;
    let glowAlpha = 0.10 + 0.50 * brightness;
    let grad = drawingContext.createRadialGradient(
      bulbCx, bulbCy, 5,
      bulbCx, bulbCy, glowR
    );
    grad.addColorStop(0, "rgba(120, 255, 150, " + glowAlpha + ")");
    grad.addColorStop(1, "rgba(120, 255, 150, 0)");
    drawingContext.fillStyle = grad;
    drawingContext.fillRect(panelX + 1, panelY + 32,
                            panelW - 2, panelH - 33);
  }

  // Bulb cap (metallic part at top)
  noStroke();
  fill(60, 60, 60);
  rect(bulbCx - 8, bulbCy - bulbR - 4, 16, 6, 1);
  fill(80, 80, 80);
  rect(bulbCx - 5, bulbCy - bulbR - 6, 10, 2);

  // Bulb glass — color lerps from dim outline to bright phosphor with brightness
  let bR = lerp(20, 200, brightness);
  let bG = lerp(40, 255, brightness);
  let bB = lerp(20, 180, brightness);

  if (brightness > 0.05) {
    drawingContext.shadowBlur = 18 * brightness;
    drawingContext.shadowColor = "rgba(150, 255, 170, " + brightness + ")";
  }
  fill(bR, bG, bB);
  stroke(C_GREEN_MID[0], C_GREEN_MID[1], C_GREEN_MID[2]);
  strokeWeight(1.2);
  ellipse(bulbCx, bulbCy, bulbR * 1.7, bulbR * 1.95);
  drawingContext.shadowBlur = 0;

  // Filament — small zig-zag inside the bulb
  noFill();
  if (brightness > 0.1) {
    stroke(255, 240, 180);
    strokeWeight(1.4);
    drawingContext.shadowBlur = 10 * brightness;
    drawingContext.shadowColor = "rgba(255, 240, 180, " + brightness + ")";
  } else {
    stroke(40, 70, 40);
    strokeWeight(1);
  }
  let fy = bulbCy - 1;
  let fx = bulbCx - 7;
  beginShape();
  vertex(fx,      fy + 4);
  vertex(fx + 3,  fy - 3);
  vertex(fx + 7,  fy + 3);
  vertex(fx + 11, fy - 3);
  vertex(fx + 14, fy + 4);
  endShape();
  drawingContext.shadowBlur = 0;

  // ---- LIGHT POOL on the panel "wall" below the bulb ----
  if (brightness > 0) {
    let poolCy = panelY + 215;
    let poolR = 60 + 90 * brightness;
    let poolAlpha = 0.05 + 0.30 * brightness;
    let pg = drawingContext.createRadialGradient(
      bulbCx, poolCy, 5,
      bulbCx, poolCy, poolR
    );
    pg.addColorStop(0, "rgba(120, 255, 150, " + poolAlpha + ")");
    pg.addColorStop(1, "rgba(120, 255, 150, 0)");
    drawingContext.fillStyle = pg;
    drawingContext.fillRect(panelX + 4, panelY + 140,
                            panelW - 8, panelH - 144);
  }

  // ---- ANSWER TEXT — hidden until puzzle is fully solved ----
  textFont(myFont);
  textAlign(CENTER, CENTER);
  let answerCy = panelY + 215;

  if (circuitSolved) {
    let pulse = 0.7 + 0.3 * sin(frameCount * 0.15);
    drawingContext.shadowBlur = 18 * pulse;
    drawingContext.shadowColor = "rgba(120, 255, 150, 0.95)";
    noStroke();
    fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
    textSize(26);
    text("TICTACTOE", bulbCx, answerCy);
    drawingContext.shadowBlur = 0;

    fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
    textSize(11);
    text("// OUTPUT STABLE", bulbCx, answerCy + 26);
  } else {
    // Placeholder — same character footprint, dim and unreadable
    noStroke();
    fill(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
    textSize(26);
    text("? ? ? ? ? ? ? ? ?", bulbCx, answerCy);
  }

  // ---- Stability meter at the bottom of the panel ----
  let meterY = panelY + panelH - 26;
  let meterX = panelX + 20;
  let meterW = panelW - 40;

  noFill();
  stroke(C_GREEN_FAINT[0], C_GREEN_FAINT[1], C_GREEN_FAINT[2]);
  strokeWeight(1);
  rect(meterX, meterY, meterW, 6);

  noStroke();
  if (circuitSolved) {
    fill(C_GREEN_HI[0], C_GREEN_HI[1], C_GREEN_HI[2]);
  } else {
    fill(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  }
  rect(meterX + 1, meterY + 1, (meterW - 2) * brightness, 4);

  fill(C_GREEN_DIM[0], C_GREEN_DIM[1], C_GREEN_DIM[2]);
  textFont(myFont);
  textAlign(LEFT, BOTTOM);
  textSize(10);
  text("STABILITY", meterX, meterY - 2);
  textAlign(RIGHT, BOTTOM);
  text(Math.round(brightness * 100) + "%", meterX + meterW, meterY - 2);

  pop();
}


// Zoomed minesweeper board drawn directly on the main canvas (not a buffer).
function drawZoomedPuzzleBoard(x, y, size) {
  let cellSize = size / 3;
  let cells = [
    "flag",  "empty", "flag",
    "flag",  "5",     "flag",
    "flag",  "3",     "empty"
  ];

  push();
  // Backing
  noStroke();
  fill(252, 248, 232);
  rect(x, y, size, size, 2);

  // Grid lines
  stroke(40);
  strokeWeight(1.2);
  for (let i = 0; i <= 3; i++) {
    line(x + i * cellSize, y,            x + i * cellSize, y + size);
    line(x,                y + i * cellSize, x + size,     y + i * cellSize);
  }

  for (let i = 0; i < 9; i++) {
    let r = Math.floor(i / 3);
    let c = i % 3;
    let cx = x + c * cellSize + cellSize / 2;
    let cy = y + r * cellSize + cellSize / 2;
    let kind = cells[i];

    if (kind === "flag") {
      drawZoomedFlag(cx, cy, cellSize * 0.7);
    } else if (kind === "empty") {
      // intentionally blank
    } else {
      noStroke();
      fill(20);
      textFont("Arial");
      textStyle(BOLD);
      textSize(34);
      textAlign(CENTER, CENTER);
      text(kind, cx, cy);
    }
  }
  textStyle(NORMAL);
  pop();
}

function drawZoomedFlag(cx, cy, s) {
  push();
  noStroke();

  // pole
  let poleH = s * 0.55;
  fill(0);
  rect(cx - 1.5, cy - poleH / 2, 3, poleH);
  // base
  rect(cx - s * 0.22, cy + poleH / 2 - 4, s * 0.44, 4);
  rect(cx - s * 0.18, cy + poleH / 2,     s * 0.36, 2);

  // red flag
  fill(220, 30, 30);
  let pTop = cy - poleH / 2;
  beginShape();
  vertex(cx - 1.5, pTop);
  vertex(cx - s * 0.32, pTop + s * 0.18);
  vertex(cx - 1.5, pTop + s * 0.36);
  endShape(CLOSE);
  pop();
}




// ============================================================
//  USER INPUT
// ============================================================
function keyTyped() {
  if (winMode || failureMode) return;
  if (state === 0) {
    if (writing) {
      if (key.length === 1) {
        textInput += key.toUpperCase();
      }
    }
  }
}

function mouseClicked() {
  if (winMode || failureMode) return;
  if (state === 0) {
    // Click anywhere on the monitor screen (or its bezel) to begin
    let scrCx = width / 2;
    let scrCy = height / 2;
    let scrW0 = 180;
    let scrH0 = 180;
    if (mouseX >= scrCx - scrW0 / 2 - 18 &&
        mouseX <= scrCx + scrW0 / 2 + 18 &&
        mouseY >= scrCy - scrH0 / 2 - 14 &&
        mouseY <= scrCy + scrH0 / 2 + 24) {
      clicked = true;
      bootStartFrame = frameCount;
    }
    return;
  }

  if (state === 1) {
    if (screen === "challenge one") {
      if (footerExitClicked()) {
        screen = "lobby";
        message = "";
      }
    } else if (screen === "finalpuzzle") {
      if (footerBackClicked()) {
        leaveFinalPuzzle();
      }
    } else if (screen === "lobby") {
      // Route to whichever app tile was clicked
      let opened = appTiles.find(function (a) { return a.hovered; });
      if (opened) {
        if (opened.id === "terminal") {
          screen = "challenge one";
        } else if (opened.id === "newspaper") {
          screen = "newspaper";
          zoomedSection = null;
        } else if (opened.id === "cipher") {
          screen = "cipher";
        }
      }
    } else if (screen === "newspaper") {
      if (zoomedSection !== null) {
        // Inside zoom view — any click returns to the paper
        zoomedSection = null;
      } else if (hoveredNewspaperSection !== null) {
        // Click on a section → zoom in
        zoomedSection = hoveredNewspaperSection;
      } else {
        // Click outside any section → back to lobby
        screen = "lobby";
      }
    } else if (screen === "cipher") {
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
  if (winMode || failureMode) return;
  if (state === 0) {
    if (keyCode === BACKSPACE) {
      textInput = textInput.substring(0, textInput.length - 1);
    }
    if (keyCode === ENTER) {
      if (textInput === "YES") {
        state = 1;
        timerStartMs = millis();   // begin 15-min countdown
      } else if (textInput === "NO") {
        // Reset back to the un-zoomed desk view
        clicked = false;
        scaleMult = 1;
        loading = true;
        writing = false;
        index = 0;
        displayText = "";
        textInput = "";
        dots = 1;
      }
    }
  } else if (state === 1) {
    if (screen !== "challenge one") return;

    if (keyCode === BACKSPACE) {
      typedText = typedText.substring(0, typedText.length - 1);
    } else if (keyCode === ENTER || keyCode === RETURN) {
      if (!usernamePromptDismissed) {
        if (typedText === "JOSHUA FALKEN") {
          usernamePromptDismissed = true;
          message = "look next to the ReadMe.TXT";
        } else {
          message = "ACCESS DENIED";
        }
        typedText = "";
      } else if (typedText === correctPassword.toUpperCase()) {
        message = "ACCESS GRANTED";
        screen = "success";
      } else if (typedText === "CIRCUITS") {
        typedText = "";
        message = "";
        circuitMessage = "";
        screen = "circuits";
      } else if (typedText === "TICTACTOE") {
        currentIndex = 0;
        lastSwitch = millis();
        typedText = "";
        screen = "finalpuzzle";
      } else if (typedText === "DEFCONV") {
        winMode = true;
        winStartMs = millis();
        typedText = "";
      } else {
        message = "ACCESS DENIED";
        typedText = "";
      }
    } else if (key.length === 1) {
      typedText += key.toUpperCase();
    }
  }
}


// ============================================================
//  CIRCUITS — click routing & state
// ============================================================
function handleCircuitClicks() {
  let backRect = getFooterLabelRect("[ BACK ] RETURN TO TERMINAL");
  if (mouseX >= backRect.x && mouseX <= backRect.x + backRect.w &&
      mouseY >= backRect.y && mouseY <= backRect.y + backRect.h) {
    screen = "challenge one";
    circuitMessage = "";
    return;
  }


  let startX = 80;
  let startY = 175;
  let cellSize = 100;
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
  circuitMessage = "STABLE OUTPUT: TICTACTOE";
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
  g.text("EXTRA EXTRA!", 250, 98);

  g.textStyle(ITALIC);
  g.textSize(9);
  g.text("Speculation on Human Nature", 250, 128);

  // Byline (backwards — Challenge 1 clue)
  g.textStyle(BOLD);
  g.textSize(13);
  g.fill(20);
  g.text("ROHTUA: NEKLAF AUHSOJ", 250, 138);

  g.stroke(60);
  g.strokeWeight(0.6);
  g.line(20, 152, 470, 152);

  const topY = 162;
  const midY = 378;
  const bottomY = 572;

  const leftX = 20;     const leftW = 95;
  const leftMidX = 122; const leftMidW = 88;
  const centerX = 217;  const centerW = 110;
  const rightX = 334;   const rightW = 136;

  const headerY = topY + 2;
  const bodyY   = topY + 28;

  g.stroke(60);
  g.strokeWeight(0.8);
  g.line(118, topY, 118, midY - 3);
  g.line(213, topY, 213, midY - 3);
  g.line(330, topY, 330, midY - 3);

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
  g.text("Daily Puzzle", centerX + centerW / 2, headerY);

  // Minesweeper-style board (3×3) in the center column
  drawNewspaperPuzzleBoard(g, centerX, bodyY, centerW);

  g.textAlign(LEFT, TOP);
  g.fill(30);
  g.textStyle(NORMAL);
  g.textSize(6.5);
  g.text(
    "Today's challenge. Solve at home — answers in tomorrow's edition.",
    centerX + 5, bodyY + 148, centerW - 10, 30
  );

  g.fill(20);
  g.textAlign(LEFT, TOP);
  g.textStyle(BOLD);
  g.textSize(10);
  g.text("Riddle of the Day", rightX, headerY, rightW, 24);

  g.textStyle(NORMAL);
  g.textSize(9);
  g.text(
    "I hide in plain sight,\nbut forward I mislead.\nMy truth only shows when\nyou change how you read.\n\nThe end is the start,\nthe start is the end —\nshift your direction,\nand the message will bend.",
    rightX, bodyY + 14, rightW, midY - bodyY - 8
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
    "Records indicate a symbol-based cipher was used in several of the documents. Investigators believe the marks translate directly into letters when read in order.\n\nABCDEFGHIJKLMNOPQRSTUVWXYZ \n\nZYXWVUTSRQPONMLKJIHGFEDCBA",
    20, lowerBodyY, lowerDivX - 30, bottomY - lowerBodyY
  );

  g.fill(20);
  g.textStyle(BOLD);
  g.textSize(11);
  g.text("Editorial", lowerDivX + 10, lowerHeaderY);

  g.textStyle(NORMAL);
  g.textSize(6.8);
  g.text(
    "Mankind's greatest asset has always been their opposable thumbs and their audacity to scrawl over anything and everything. As cavemen, they would record stories and information on cave walls. This physical ability to record was to important to them, that even as they evolved and grew more intelligent, they simply found ways to bring the cave walls with them.",
    lowerDivX + 10, lowerBodyY, 470 - (lowerDivX + 10), bottomY - lowerBodyY
  );
}

// Draw a 3×3 minesweeper-style board into the newspaper graphics buffer.
// Lays out cells: flag / "Empty Square" / flag,
//                 flag / 5             / flag,
//                 flag / 3             / "Empty Square"
function drawNewspaperPuzzleBoard(g, cx, by, cw) {
  let cellW = (cw - 14) / 3;        // 3 columns within the column inset
  let cellH = 36;
  let gridX = cx + 7;
  let gridY = by + 4;

  let cells = [
    "flag",  "empty", "flag",
    "flag",  "5",     "flag",
    "flag",  "3",     "empty"
  ];

  // light backing
  g.noStroke();
  g.fill(252, 248, 232);
  g.rect(gridX, gridY, cellW * 3, cellH * 3, 1);

  // grid lines
  g.stroke(40);
  g.strokeWeight(0.6);
  for (let i = 0; i <= 3; i++) {
    g.line(gridX + i * cellW, gridY,
           gridX + i * cellW, gridY + cellH * 3);
    g.line(gridX,             gridY + i * cellH,
           gridX + cellW * 3, gridY + i * cellH);
  }

  // draw each cell
  for (let i = 0; i < 9; i++) {
    let r = Math.floor(i / 3);
    let c = i % 3;
    let x = gridX + c * cellW;
    let y = gridY + r * cellH;
    let kind = cells[i];

    if (kind === "flag") {
      drawMinesweeperFlag(g, x + cellW / 2, y + cellH / 2);
    } else if (kind === "empty") {
      // intentionally blank
    } else {
      // a number ("3" or "5")
      g.noStroke();
      g.fill(20);
      g.textFont("Arial");
      g.textStyle(BOLD);
      g.textSize(11);
      g.textAlign(CENTER, CENTER);
      g.text(kind, x + cellW / 2, y + cellH / 2);
    }
  }
  g.textStyle(NORMAL);
}

// A small minesweeper flag: red flag on a black pole (no tile background).
function drawMinesweeperFlag(g, cx, cy) {
  // pole
  g.noStroke();
  g.fill(0);
  g.rect(cx - 1, cy - 6, 2, 11);
  // base
  g.rect(cx - 5, cy + 4, 10, 2);
  g.rect(cx - 4, cy + 6, 8, 1);

  // red flag
  g.fill(220, 30, 30);
  g.beginShape();
  g.vertex(cx - 1, cy - 7);
  g.vertex(cx - 8, cy - 3);
  g.vertex(cx - 1, cy + 1);
  g.endShape(CLOSE);
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
