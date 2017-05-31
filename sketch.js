// Coded by Alek Westover
//Avoid the obstacles
// Take a poll about the graphics UI and overlaping stuff

//Constants and imported stuff
var screen_dims = [];
var screen_color = [100, 200, 300];

var player_image_locs = [];
var player_images = [];
for (var i = 1; i <= 5; i++) {
  player_image_locs.push("images/mailman"+i+".png");
}
var enemy_image_locs = [];
var enemy_images = [];
for (var i = 1; i <= 1; i++) {
  enemy_image_locs.push("images/enemy"+i+".png");
}

enemy_image_locs = ["images/creepyColorfulFace.png"];  //TEMPORAARY MEASURE to avoid errors

var barrier_image_locs = ["images/barrier.png"];
var barrier_images = [];
var cloud_image_locs = ["images/cloud.png"];
var cloud_images = [];
var rain_image_locs = ["images/rain.png"];
var rain_images = [];

var user_name = '';
var startButton, name_input, introHtml, pauseButton, resumeButton, restartButton, rollButton, runButton;

//Possibly dynamic variables
var gravity = 9.8*3; //;) 
var dt = 0.2;
var pause = false;
var flag_time = 0;
var first_lag_time = 70; //Milliseconds 
var deep_walk_multiplier = 1.05;
var scroll_speed = 60;
var player_speed_multiplier = 0.17;
var lose_time = -10000;
var lose_delay_time = 5;
var cap_speed = 120;


function setup() {
  screen_dims = [window.innerWidth*0.8, window.innerHeight*0.8];
  createCanvas(screen_dims[0], screen_dims[1]);
  for (var i = 0; i < player_image_locs.length; i++){
    player_images.push(loadImage(player_image_locs[i]));
  }
  for (var i = 0; i < enemy_image_locs.length; i++){
    enemy_images.push(loadImage(enemy_image_locs[i]));
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
}


function draw(){
  if (level.envi == "play") {
    background(screen_color[0], screen_color[1], screen_color[2]);
    player.display();
    player.react_press();
    player.update(dt);
    level.display();
    level.run([player.std_pos[0], player.y_pos], player.cur_dims, player.invincibility, dt);
  }
  else if (level.envi == "pause") {
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


function one_d_collide(a, b, la, lb) {
  var first_check = a < b + lb;
  var second_check = b < a + la;
  if (first_check && second_check) {
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


function deleteInstances(all, bad) {
  for (var i = all.length; i >= 0; i--) {
    if (all[i] == bad) {
      all.splice(i, 1);
    }
  }
  return (all);
}


function resumeClickReaction() {
  if (level.envi == "pause") {
    pause = false;
    level.envi = "play";
    switchResumePause();
    rollButton.style('visibility: visible');
    runButton.style('visibility: visible');
  }
  flag_time = millis();
}


function pauseClickReaction() {
  if (level.envi == "play") {
    pause = true;
    rollButton.style('visibility: hidden');
    runButton.style('visibility: hidden');
  }
  flag_time = millis();
}


function rollClickReaction() {
  if (level.envi == "play") {
    player.set_roll_mode();
  }
  flag_time = millis();
}


function runClickReaction() {
  if (level.envi == "play") {
    player.set_run_mode();
  }
  flag_time = millis();
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
  scroll_speed = 60;
  level.level = 0;
  level.obstacles = 0;
  level.level_length = 0;
  level.envi = "play";
  level.update();
  restartButton.remove();
  pauseButton.style('visibility: visible');
  flag_time = millis();
}


function startPlay() {
  runButton.style('visibility: visible');
  rollButton.style('visibility: visible');
  pauseButton.style('visibility: visible');
  user_name = name_input.value();
  //var introHtml = document.getElementById("intro");
  //introHtml.innerHTML = "";
  level.envi = "play";
  name_input.remove();
  startButton.remove();
  flag_time = millis();
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

    resumeButton = createButton('Resume');
    resumeButton.position(screen_dims[0]*0.76, screen_dims[1]*0.02);
    resumeButton.mousePressed(resumeClickReaction);
    resumeButton.size(screen_dims[0]*0.2, screen_dims[1]*0.11);
    var resumeButtonSize = screen_dims[0]*0.04;
    resumeButton.style('font-size: '+resumeButtonSize+'px');
    resumeButton.style('visibility: hidden');

    pauseButton = createButton('Pause');
    pauseButton.position(screen_dims[0]*0.76, screen_dims[1]*0.02);
    pauseButton.mousePressed(pauseClickReaction);
    pauseButton.size(screen_dims[0]*0.2, screen_dims[1]*0.11);
    var pauseButtonSize = screen_dims[0]*0.04;
    pauseButton.style('font-size: '+pauseButtonSize+'px');
    pauseButton.style('visibility: hidden');

    rollButton = createButton('Roll');
    rollButton.position(screen_dims[0]*0.76, screen_dims[1]*0.15);
    rollButton.mousePressed(rollClickReaction);
    rollButton.size(screen_dims[0]*0.2, screen_dims[1]*0.11);
    var rollButtonSize = screen_dims[0]*0.04;
    rollButton.style('font-size: '+rollButtonSize+'px');
    rollButton.style('visibility: hidden');

    runButton = createButton('Run');
    runButton.position(screen_dims[0]*0.76, screen_dims[1]*0.27);
    runButton.mousePressed(runClickReaction);
    runButton.size(screen_dims[0]*0.2, screen_dims[1]*0.11);
    var runButtonSize = screen_dims[0]*0.04;
    runButton.style('font-size: '+runButtonSize+'px');
    runButton.style('visibility: hidden');

    textSize(screen_dims[0]*0.07);
    text("JUMPER PRO", screen_dims[0]*0.04, screen_dims[1]*0.2);
    textSize(screen_dims[0]*0.04);
    text("Code by Alek Westover\nThe goal is to win.\nWhat is your name?", screen_dims[0]*0.04, screen_dims[1]*0.3);
    this.barriers = [new Barrier()];
    this.barriers[0].initialize(this.level_length, [0.05, 0.25], [0.05, 0.25]);
    this.num_clouds = 2*int(this.level_length/0.3);
    this.clouds = [];
    var cloud_xs = [];
    var cloud_widths = [];
    for (var i = 0; i < this.num_clouds; i++) {
      this.clouds.push(new Cloud());
      this.clouds[i].initialize(this.level_length, cloud_xs, cloud_widths);
      cloud_xs.push(this.clouds[i].x);
      cloud_widths.push(this.clouds[i].dims[0]);
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
    var cloud_xs = [];
    var cloud_widths = [];
    for (var i = 0; i < this.num_clouds; i++) {
      this.clouds.push(new Cloud());
      this.clouds[i].initialize(this.level_length, cloud_xs, cloud_widths);
      cloud_xs.push(this.clouds[i].x);
      cloud_widths.push(this.clouds[i].dims[0]);
    }
    if (this.level%3 == 0 && scroll_speed < cap_speed) {
      scroll_speed += 40;
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
        text("OK the game is basicly over now.", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 10) {
        text("Winston asked \n(from a far distance away)\n\
his mirror 'Mirror mirror on the wall how can I become really cool?'\n\
3 hours later Winston was found dead,\ncrushed and hanging from the ceiling.\n\
What did Winston see in the mirror?", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 11) {
        text("It was a concave mirror,\n\
so Winston say a smaller inverted version of himself,\n\
and proceeded to replicate the real image.", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 51) {
        text("Once Winston asked the Convex lens \n\
how it always sayed so foccused.", screen_dims[0]*0.1, tip_y_top);
      }
      else if(this.level == 52) {
        text("The lens answered, \n\
I won't focus when the object distance is really small.", screen_dims[0]*0.1, tip_y_top);
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
        if (user_invincibility == false) {
          if (user_pos[1]+user_dims[1] >= this.barriers[i].perceived_pos[1]*deep_walk_multiplier) {
            if (millis() - lose_time > 400) {
              lose_time = millis();
    //Buys us a little time to make the losing look more realistic, but blocks jumping so you can't escape your fate
              flag_time = millis();
            }
          }
        }
      }
      if (millis() - lose_time > lose_delay_time && millis() - lose_time < 400) {
        this.envi = "lose";
      }
//The extra seemingly random addition in the conitional below buys a little extra delay time before winning
      if (this.barriers[i].perceived_pos[0] + this.barriers[i].dims[0] + screen_dims[0]*0.3> user_pos[0]) {  
        more_coming = true;
      }
    }
    if (this.envi == "lose") {
      pauseButton.style('visibility: hidden');
      rollButton.style('visibility: hidden');
      runButton.style('visibility: hidden');
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
    if (pause && this.envi == "play") {
      this.envi = "pause";
      switchResumePause();
    }
  }
};


function Player() {
  this.initialize = function() {
    this.run_dims = [screen_dims[0]*0.1, screen_dims[1]*0.3];
    this.roll_dims = [screen_dims[0]*0.07, screen_dims[0]*0.07];
    this.cur_dims = this.run_dims;
    this.std_pos = [screen_dims[0]*0.1, screen_dims[1]-this.cur_dims[1]]; 
    this.jump_speed = screen_dims[1]*player_speed_multiplier;
    this.y_pos = this.std_pos[1]
    this.y_vel = 0;
    this.y_acc = 0; 
    this.ani_state = 0;
    this.invincibility = false;
    this.run_anis = 4;
    this.roll_anis = 1;
    this.move_state = 'run';
  }
  this.set_roll_mode = function() {
    console.log("in");
    if (this.move_state != 'roll') {
      this.move_state = 'roll';
      this.cur_dims = this.roll_dims;
      this.std_pos = [screen_dims[0]*0.1, screen_dims[1]-this.cur_dims[1]];
      this.ani_state = this.roll_anis;
      this.y_pos += this.run_dims[1] -this.roll_dims[1];
      //y_pos_new + this.cur_dims[1] = y_pos_old + this.old_dims[1] Means same feet pos before and after
    }
  }
  this.set_run_mode = function() {
    if (this.move_state != 'run') {
      this.move_state = 'run';
      this.cur_dims = this.run_dims;
      this.std_pos = [screen_dims[0]*0.1, screen_dims[1]-this.cur_dims[1]];
      this.ani_state = 0;
      this.y_pos += this.roll_dims[1] - this.run_dims[1];
    }  
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
      if (key == "o") {
        this.set_roll_mode();
      }
      if (key == "u") {
        this.set_run_mode();
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
      if (partial_collide([this.std_pos[0], this.y_pos], bar.perceived_pos, this.cur_dims, bar.dims) && this.y_pos+this.cur_dims[1] <= bar.perceived_pos[1]*deep_walk_multiplier) {
        on_anything = true;
        if (abs(this.y_pos - (bar.perceived_pos[1] - this.cur_dims[1])) > 1 && this.yvel == 0) {
          this.y_pos = bar.perceived_pos[1] - this.cur_dims[1];
        }
      }
    }
    if (this.y_pos >= this.std_pos[1]) {
      on_anything = true;
      if (abs(this.y_pos - this.std_pos[1]) > 1 && this.yvel == 0) {
        this.y_pos = this.std_pos[1];//Probably wrong
      }
    }
    return on_anything;
  }
  this.jump = function() {
    if (this.onSurface() && level.envi == "play" && (millis() - flag_time) > first_lag_time && this.move_state == 'run') {
      this.y_vel = -this.jump_speed;
    }
  }
  this.update = function(dt) {
    if (this.y_pos < 0) {
      this.y_vel = 0.75*abs(this.y_vel); //Bounce with a little dampening
    }
    this.y_pos += this.y_vel*dt;
    this.y_vel += this.y_acc*dt;
    this.ani_state = (this.ani_state + 0.3) % this.run_anis;
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
    if (this.move_state == 'run') {
      var cur_image = player_images[int(this.ani_state)];
      push();
      translate(this.std_pos[0], this.y_pos);
      scale(-1, 1);
      translate(-this.cur_dims[0], 0)
      image(cur_image, 0, 0, this.cur_dims[0], this.cur_dims[1]);
      pop();
    }
    else if (this.move_state == 'roll') {
      var cur_image = player_images[this.run_anis];
      push();
      translate(this.std_pos[0], this.y_pos);
      scale(-1, 1);
      translate(-this.cur_dims[0], 0)
      image(cur_image, 0, 0, this.cur_dims[0], this.cur_dims[1]);
      pop();  
    }
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
    var random_height_offset = screen_dims[1]*int(random(0,5))*0.1;
    this.perceived_pos = [this.x-this.offset, screen_dims[1]-this.dims[1]-random_height_offset];
  }
  this.update = function(dt) {
    this.offset += dt*scroll_speed;
    this.perceived_pos[0] = this.x-this.offset;
  }
  this.display = function() {
    var cur_image = barrier_images[this.image_state];
    image(cur_image, this.perceived_pos[0], this.perceived_pos[1], this.dims[0], this.dims[1]);
  }
};


function RainDrop() {
  this.initialize = function (xi, xveli, yposi, yveli) {
    this.x = xi;
    this.xvel = xveli;
    this.ypos = yposi;
    this.yvel = yveli;
    this.yacc = gravity*0.2; //Sorry physics
    this.dims = [random(3, 10), random(3, 20)];
    this.image_state  = 0;
  }
  this.update = function (dt) {
    this.ypos += this.yvel*dt;
    this.yvel += this.yacc*dt;
    this.x += this.xvel*dt;
  }
  this.display = function() {
    var cur_image = rain_images[this.image_state];
    image(cur_image, this.x, this.ypos, this.dims[0], this.dims[1]);  
  }
};


function Cloud() {
  this.initialize = function(level_length, other_cloud_xs, other_cloud_widths) {
    var rand_bar_width = int(random(screen_dims[0]*0.05, screen_dims[0]*0.2));
    var rand_bar_height = int(random(screen_dims[1]*0.05, screen_dims[1]*0.2));  
    this.dims = [rand_bar_width, rand_bar_height];

    var no_collisions = false;
    var x_guess;
    while (no_collisions == false) {
      no_collisions = true;
      x_guess = random(0, screen_dims[0]*level_length);
      this.dims[0] = 0.9*this.dims[0];
      this.dims[1] = 0.9*this.dims[1];
      for (var i = 0; i < other_cloud_xs.length; i++) {
        if (one_d_collide(other_cloud_xs[i], x_guess, other_cloud_widths[i], this.dims[0])) {
          no_collisions = false;
        }
      }
    }

    this.x = x_guess;
    this.xspeed = scroll_speed*0.8;
    this.image_state = 0;
    this.offset = 0;
    this.perceived_pos = [this.x-this.offset, int(this.dims[1]*random(0.6,0.7))];
    this.rain_thickness = int(random(2,10));
    this.rains = [];
  }
  this.update = function(dt) {
    this.offset += dt*this.xspeed;
    this.perceived_pos = [this.x-this.offset, this.perceived_pos[1]];

    var triggered = false;
    if (millis() % 100 < 10) {
      triggered = true;
    }
    if (triggered) {
      for (var i = 0; i < this.rain_thickness; i++) {
        var luck_rain_draw = int(random(0, this.rain_thickness)/2);
        if (luck_rain_draw == 0) {
          this.rains.push(new RainDrop());
          this.rains[this.rains.length - 1].initialize(this.perceived_pos[0] + i*this.dims[0]/this.rain_thickness, (-1)*this.xspeed, this.perceived_pos[1]+this.dims[1], 0);
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
      if (this.rains[i].ypos > screen_dims[1]) {
        this.rains[i] = 0;
      }
    }
    this.rains = deleteInstances(this.rains, 0);
  }
};


function Enemy() {
  this.initialize = function(){

  }
  this.update = function(){

  }
};
