


function setup() {
  createCanvas(1440, 900)
}


//lobby screen with computer 
  
  
function drawDesk() {
  //surface
  
  line(0, 300, 30, 250) 
  line(400, 300, 370, 250)
  line(0, 330, 400, 330)
  line(30, 250, 370, 250)
  
  //detail
  
  //cabinet
  line (0, 310, 400, 310)
  line(300, 330, 300, 400)
  
  rect(335, 350, 50, 10)
  
  print(windowHeight, windowWidth)
  

}
 
function draw() {
  background(220)
  
  drawDesk()
}
