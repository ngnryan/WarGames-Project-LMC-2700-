function setup() {
  createCanvas(400, 400)
}


//lobby screen with computer 
  
  
function drawDesk() {
    line(60, 60, 60, 350);   
  line(340, 60, 340, 350);  
  line(60, 350, 340, 350);  

  //lid
  fill(100, 80, 60, 80);
  stroke(120, 100, 80, 60);
  rect(55, 45, 290, 18);
}
 
function draw() {
  background(220)
  
  drawDesk()
}
