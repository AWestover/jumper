// Coded by Alek Westover
//Avoid the obstacles
// Take a poll about the graphics UI and overlaping stuff

//Constants and imported stuff
var screen_dims = [];
var screen_color = [100, 200, 300];

var player_image_locs = [];
for (var i = 1; i < 5; i++) {
  player_image_locs.push("images/mailman"+i+".png");
}
var player_images = [];
var barrier_image_locs = ["images/barrier.png"];
var barrier_images = [];
var cloud_image_locs = ["images/cloud.png"];
var cloud_images = [];
var rain_image_locs = ["images/rain.png"];
var rain_images = [];

var user_name = '';
var startButton, name_input, introHtml, pauseButton, resumeButton, restartButton;

//Possibly dynamic variables
var gravity =9.8*1.4; //;) 
var dt = 0.2;
var pause = false;
var last_non_jump_click = 0;
var first_lag_time = 70; //Milliseconds 
var deep_walk_multiplier = 1.03;
var scroll_speed = 30;
var player_speed_multiplier = 0.15;


function setup() {
  screen_dims = [window.innerWidth*0.8, window.innerHeight*0.8];
  createCanvas(screen_dims[0], screen_dims[1]);
  for (var i = 0; i < player_image_locs.length; i++){
    player_images.push(loadImage(player_image_locs[i]));
  }
  for (var i = 0; i < barrier_image_locs.length; i++){
    barrier_images.push(loadImage(barrier_image_locs[i]));
  }
  for (var i = 0; i < cloud_image_locs.length; i++){
    cloud_images.push(loadImage(cloud_image_locs[i]));
  }
  for (var i = 0; i < rain_image_locs.length; i++){
    rain_images.push(loadImage(rain_image_locs[i]));
  }
  player = new Player();
  player.initialize();
  level = new Level();
  level.initialize();

  resumeButton = createButton('Resume');
  resumeButton.position(screen_dims[0]*0.76, screen_dims[1]*0.05);
  resumeButton.mousePressed(resumeClickReaction);
  resumeButton.size(screen_dims[0]*0.2, screen_dims[1]*0.13);
  var resumeButtonSize = screen_dims[0]*0.04;
  resumeButton.style('font-size: '+resumeButtonSize+'px');
  resumeButton.style('visibility: hidden');

  pauseButton = createButton('Pause');
  pauseButton.position(screen_dims[0]*0.76, screen_dims[1]*0.05);
  pauseButton.mousePressed(pauseClickReaction);
  pauseButton.size(screen_dims[0]*0.2, screen_dims[1]*0.11);
  var pauseButtonSize = screen_dims[0]*0.04;
  pauseButton.style('font-size: '+pauseButtonSize+'px');
  pauseButton.style('visibility: hidden');
}


function draw(){
  if (level.envi == "play") {
    background(screen_color[0], screen_color[1], screen_color[2]);
    player.display();
    player.react_press();
    player.update(dt);
    level.display();
    level.run([player.std_pos[0], player.y_pos], player.dims, player.invincibility, dt);
  }
  else if (level.envi == "pause") { //Add button control later
    if (keyIsPressed) {
      if (key == "r") {
        pause = false;
        level.envi = "play";
        switchResumePause();
      }
    }
  }
  else if (level.envi == "lose") {
    var top_rinf_y = screen_dims[1]*0.15
    fill(255, 0, 0);
    rect(screen_dims[0]*0.05, top_rinf_y, screen_dims[0]*0.9, screen_dims[1]*0.45);
    textSize(screen_dims[0]*0.07);
    fill(0, 0, 0);
    text("YOU LOSE", screen_dims[0]*0.1, screen_dims[1]*0.15 + top_rinf_y);
    textSize(screen_dims[0]*0.04);
    text("Type 'r' or press the button to restart", screen_dims[0]*0.1, top_rinf_y+screen_dims[1]*0.22);
    if (keyIsPressed) {
      if (key == "r") {
        restartGame();
      }
    }
  }
}


function mousePressed() {
  player.jump();
}


function touchStarted() {
  player.jump();
}


function partial_collide(pa, pb, da, db) {
  var centa = [pa[0]+da[0]/2, pa[1]+da[1]/2];
  //var centb = [pb[0]+db[0]/2, pb[1]+db[1]/2];
  var right_x = centa[0]< pb[0] + db[0];
  var left_x = pb[0] < pa[0] + da[0];
  var top_y = pb[1] < pa[1] + da[1];
  var bottom_y = pa[1] < pb[1] + db[1];
  if (right_x && left_x && top_y && bottom_y) {
    return true;
  }
  else {
    return false;
  }
}


function partial_lenient_collide(pa, pb, da, db, leniency) {
  var centa = [pa[0]+da[0]/2, pa[1]+da[1]/2];
  db = [db[0]*leniency, db[1]*leniency];
  da = [da[0]*leniency, da[1]*leniency];
  var right_x = centa[0] < pb[0] + db[0];
  var left_x = pb[0] < pa[0] + da[0];
  var top_y = pb[1] < pa[1] + da[1];
  var bottom_y = pa[1] < pb[1] + db[1];
  if (right_x && left_x && top_y && bottom_y) {
    return true;
  }
  else {
    return false;
  }
}


function lenient_collide(pa, pb, da, db, leniency) {
  db = [db[0]*leniency, db[1]*leniency];
  da = [da[0]*leniency, da[1]*leniency];
  var right_x = pa[0] < pb[0] + db[0];
  var left_x = pb[0] < pa[0] + da[0];
  var top_y = pb[1] < pa[1] + da[1];
  var bottom_y = pa[1] < pb[1] + db[1];
  if (right_x && left_x && top_y && bottom_y) {
    return true;
  }
  else {
    return false;
  }
}


function collide(pa, pb, da, db) {
  var right_x = pa[0] < pb[0] + db[0];
  var left_x = pb[0] < pa[0] + da[0];
  var top_y = pb[1] < pa[1] + da[1];
  var bottom_y = pa[1] < pb[1] + db[1];
  if (right_x && left_x && top_y && bottom_y) {
    return true;
  }
  else {
    return false;
  }
}


function resumeClickReaction() {
  if (level.envi == "pause") {
    pause = false;
    level.envi = "play";
    switchResumePause();
  }
  last_non_jump_click = millis();
}


function pauseClickReaction() {
  if (level.envi == "play") {
    pause = true;
  }
  last_non_jump_click = millis();
}


function switchResumePause() {
  if (resumeButton.style('visibility') == "visible") {
    resumeButton.style('visibility: hidden');
    pauseButton.style('visibility: visible');
  }
  else {
    pauseButton.style('visibility: hidden');
    resumeButton.style('visibility: visible');
  }
}


function restartGame() {
  level.level = 0;
  level.obstacles = 0;
  level.level_length = 0;
  level.envi = "play";
  level.update();
  restartButton.remove();
  pauseButton.style('visibility: visible');
  last_non_jump_click = millis();
}


function startPlay() {
  pauseButton.style('visibility: visible');
  user_name = name_input.value();
  //var introHtml = document.getElementById("intro");
  //introHtml.innerHTML = "";
  level.envi = "play";
  name_input.remove();
  startButton.remove();
  last_non_jump_click = millis();
}


function add(x, y) {
  var result = [];
  for(var i = 0; i < x.length; i++) {
    result.push(x[i] + y[i]);
  }
  return (result);
}


function Level() {
  this.initialize = function() {
    this.envi = 'start';
    this.obstacles = 1;
    this.level = 1;
    this.level_length = 1;  //This is the multiple of screen_dims we want
    this.dims = screen_dims;
    name_input = createInput();
    name_input.position(screen_dims[0]*0.05, screen_dims[1]*0.7);
    name_input.size(screen_dims[0]*0.7, screen_dims[1]*0.1);
    var name_input_size = screen_dims[0]*0.05;
    name_input.style('font-size: '+ name_input_size +'px');
    startButton = createButton('Start');
    startButton.position(screen_dims[0]*0.8, screen_dims[1]*0.7);
    startButton.mousePressed(startPlay);
    startButton.size(screen_dims[0]*0.2, screen_dims[1]*0.17);
    var startButtonSize = screen_dims[0]*0.05;
    startButton.style('font-size: '+startButtonSize+'px');
    textSize(screen_dims[0]*0.07);
    text("JUMPA", screen_dims[0]*0.04, screen_dims[1]*0.2);
    textSize(screen_dims[0]*0.04);
    text("Code by Alek Westover\n\
The goal is to win.\nYou do that by avoiding the barriers.\n\
What is your name?", screen_dims[0]*0.04, screen_dims[1]*0.3);
    this.barriers = [new Barrier()];
    this.barriers[0].initialize(this.level_length, [0.05, 0.25], [0.05, 0.25]);
    this.num_clouds = 2*int(this.level_length/0.3);
    this.clouds = [];
    for (var i = 0; i < this.num_clouds; i++) {
      this.clouds.push(new Cloud());
      this.clouds[i].initialize(this.level_length);
    }

  }
  this.update = function() {
    this.barriers = [];
    this.clouds = [];
    this.obstacles += 1;
    this.num_clouds = 2*int(this.level_length/0.3);
    this.level += 1;
    this.level_length += 0.5;
    for (var i = 0; i < this.obstacles; i++) {
      this.barriers.push(new Barrier());
      this.barriers[i].initialize(this.level_length, [0.05, 0.25], [0.05, 0.25]);
    }
    for (var i = 0; i < this.num_clouds; i++) {
      this.clouds.push(new Cloud());
      this.clouds[i].initialize(this.level_length);
    }
  }
  this.display = function() {
    if (this.envi == "play") {
      textSize(screen_dims[0]*0.03);
      text(user_name, screen_dims[0]*0.01, screen_dims[1]*0.13);
      text("Level " + this.level, screen_dims[0]*0.01, screen_dims[1]*0.06);
      var tip_y_top =  screen_dims[1]*0.2;
      if(this.level == 1) {
        text("OK We are going to start out easy.", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 2) {
        text("OK the game is basically over now.", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 10) {
        text("Winston asked \n(from a far distance away)\n\
his mirror 'Mirror mirror on the wall how can I become really cool?'\n\
3 hours later Winston was found dead,\ncrushed and hanging from the ceiling.\n\
What did Winston see in the mirror?", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 11) {
        text("It was a concave mirror,\n\
so Winston saw a smaller inverted version of himself,\n\
and proceeded to replicate the real image.", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 51) {
        text("Once Winston asked the Convex lens \n\
how it always sayed so focussed.", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 52) {
        text("The lens answered, \n\
I'm not focussed when the object distance is really small.", screen_dims[0]*0.1, tip_y_top);
      }
      for (var i = 0; i < this.obstacles; i++) {
        this.barriers[i].display();
      }
      for (var i = 0; i < this.num_clouds; i++) {
        this.clouds[i].display();
      }
    }
  }
  this.run = function(user_pos, user_dims, user_invincibility, dt) {
    for (var i = 0; i < this.num_clouds; i++) {
      this.clouds[i].update(dt);
    }
    var more_coming = false;
    for (var i = 0; i < this.obstacles; i++) {
      this.barriers[i].update(dt);
      if (partial_collide(user_pos, this.barriers[i].perceived_pos, user_dims, this.barriers[i].dims)) {
      //use 0.9 if you revert to lenient
        if (user_invincibility == false) {
          if (user_pos[1]+user_dims[1] >= this.barriers[i].perceived_pos[1]*deep_walk_multiplier) {
            this.envi = "lose";
          }
        }
      }
//The extra seemingly random addition in the conitional below buys a little extra delay time before winning
      if (this.barriers[i].perceived_pos[0] + this.barriers[i].dims[0] + screen_dims[0]*0.3> user_pos[0]) {  
        more_coming = true;
      }
    }
    if (this.envi == "lose") {
      pauseButton.style('visibility: hidden');
      restartButton = createButton('Restart');
      restartButton.position(screen_dims[0]*0.1, screen_dims[1]*0.27 + screen_dims[1]*0.15);
      restartButton.mousePressed(restartGame);
      restartButton.size(screen_dims[0]*0.2, screen_dims[1]*0.15);
      var restartButtonSize = screen_dims[0]*0.05;
      restartButton.style('font-size: '+restartButtonSize+'px');
    }
    if (more_coming == false) {
      this.update();
    }
    if (pause == true && this.envi == "play") {
      this.envi = "pause";
      switchResumePause();
    }
  }
};


function Player() {
  this.initialize = function() {
    this.dims = [screen_dims[0]*0.1, screen_dims[1]*0.3];
    this.std_pos = [screen_dims[0]*0.1, screen_dims[1]-this.dims[1]]; 
    this.jump_speed = screen_dims[1]*player_speed_multiplier;
    this.y_pos = this.std_pos[1]
    this.y_vel = 0;
    this.y_acc = 0; 
    this.ani_state = 0;
    this.invincibility = false;
  }
  this.react_press = function() {
    if(keyIsPressed) {
      if (keyCode == UP_ARROW) {
        this.jump();
      }
      if (key == "p") {
        pause = true;
      }
      if (key == "i") {
        this.invincibility = true;
      }
      if (key == "n") {
        this.invincibility = false;
      }
    }
  }
  this.onSurface = function() {
    var on_anything = false;
    for (var i = 0; i < level.barriers.length; i++) {
      var bar = level.barriers[i];
      if (partial_collide([this.std_pos[0], this.y_pos], bar.perceived_pos, this.dims, bar.dims) && this.y_pos+this.dims[1] < bar.perceived_pos[1]*deep_walk_multiplier) {
        on_anything = true;
      }
    }
    if (this.y_pos >= this.std_pos[1]) {
      on_anything = true;
    }
    return on_anything;
  }
  this.jump = function() {
    if (this.onSurface() && level.envi == "play" && (millis() - last_non_jump_click) > first_lag_time) {
      this.y_vel = -this.jump_speed;
    }
  }
  this.update = function(dt) {
    this.y_pos += this.y_vel*dt;
    this.y_vel += this.y_acc*dt;
    this.ani_state = (this.ani_state + 0.3) % player_images.length;
    if (this.onSurface()) {
      this.y_acc = 0;
      this.y_vel = 0;
    }
    else {
      this.y_acc = gravity;
    }
    if (this.y_vel != 0) {
      this.ani_state = 0;
    }
  }
  this.display = function() {
    var cur_image = player_images[int(this.ani_state)];
    push();
    translate(this.std_pos[0], this.y_pos);
    scale(-1, 1);
    translate(-this.dims[0], 0)
    image(cur_image, 0, 0, this.dims[0], this.dims[1]);
    pop();
  }
};


function Barrier() {
  this.initialize = function(level_length, height_bounds, width_bounds) {
    var rand_bar_width = int(random(screen_dims[0]*width_bounds[0], screen_dims[0]*width_bounds[1]));
    var rand_bar_height = int(random(screen_dims[1]*height_bounds[0], screen_dims[1]*height_bounds[1]));  
    this.dims = [rand_bar_width, rand_bar_height]
    this.x = random(screen_dims[0], screen_dims[0]*level_length);
    this.image_state = 0;
    this.offset = 0;
    this.perceived_pos = [this.x-this.offset, screen_dims[1]-this.dims[1]];
  }
  this.update = function(dt) {
    this.offset += dt*scroll_speed;
    this.perceived_pos = [this.x-this.offset, screen_dims[1]-this.dims[1]];
  }
  this.display = function() {
    var cur_image = barrier_images[this.image_state];
    image(cur_image, this.perceived_pos[0], this.perceived_pos[1], this.dims[0], this.dims[1]);
  }
};


function RainDrop() {
  this.initialize = function (xi, yposi, yveli) {
    this.x = xi;
    this.ypos = yposi;
    this.yvel = yveli;
    this.yacc = gravity*0.2; //Sorry physics
    this.dims = [random(1, 5), random(1, 5)];
    this.image_state  = 0;
  }
  this.update = function (dt) {
    this.ypos += this.yvel*dt;
    this.yvel += this.yacc*dt;
  }
  this.display = function() {
    var cur_image = rain_images[this.image_state];
    image(cur_image, this.x, this.ypos, this.dims[0], this.dims[1]);  
  }
};


function Cloud() {
  this.initialize = function(level_length) {
    var rand_bar_width = int(random(screen_dims[0]*0.05, screen_dims[0]*0.15));
    var rand_bar_height = int(random(screen_dims[1]*0.05, screen_dims[1]*0.15));  
    this.dims = [rand_bar_width, rand_bar_height]
    this.x = random(0, screen_dims[0]*level_length);
    this.image_state = 0;
    this.offset = 0;
    this.perceived_pos = [this.x-this.offset, int(this.dims[1]*random(0.6,0.7))];
    this.rain_thickness = int(random(2,10));
    console.log(this.rain_thickness);
    this.rains = [];
  }
  this.update = function(dt) {
    this.offset += dt*scroll_speed*0.8;
    this.perceived_pos = [this.x-this.offset, this.perceived_pos[1]];

    var triggered = false;
    if (millis() % 100 < 10) {
      triggered = true;
    }
    if (triggered == true) { //May be wrong, worried about frame rate
      for (var i = 0; i < this.rain_thickness; i++) {
        var luck_rain_draw = int(random(0, this.rain_thickness)/2);
        if (luck_rain_draw == 0) {
          this.rains.push(new RainDrop());
          this.rains[this.rains.length - 1].initialize(this.perceived_pos[0] + i*this.dims[0]/this.rain_thickness, this.perceived_pos[1]+this.dims[1], 0);
        }
      }
      triggered = false;
    }
  }
  this.display = function() {
    var cur_image = cloud_images[this.image_state];
    image(cur_image, this.perceived_pos[0], this.perceived_pos[1], this.dims[0], this.dims[1]);
    for (var i = 0; i < this.rains.length; i++) {
      this.rains[i].update(dt);
      this.rains[i].display();
    }
  }
};
