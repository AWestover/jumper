// Coded by Alek Westover
//Avoid the obstacles

//Constants and imported stuff
var screen_dims = [1000, 600];
var screen_color = [100, 200, 300];
var player_image_locs = ["images/creepyColorfulFace.png"];
var player_images = [];
var barrier_image_locs = ["images/barrier.png"];
var barrier_images = [];
var cloud_image_locs = ["images/cloud.png"];
var cloud_images = [];
var user_name = '';
var continueButton, name_input, introHtml;

//More variables
var gravity = 0.98;
var dt = 0.5;

function setup() {
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
	player = new Player();
	player.initialize();
	level = new Level();
	level.initialize();
}


function draw(){
	if (level.envi == "play") {
		background(screen_color[0], screen_color[1], screen_color[2]);
		player.display();
		if (keyIsPressed) {
			player.on_key_press();
		}
		player.update(dt);
		level.display();
		level.run(player.pos, player.dims, player.invincibility, dt);
	}
	else if (level.envi == "loose") {
		background(255, 0, 0);
		textSize(70);
		text("YOU LOOSE \nTOUGH LUCK MATE", screen_dims[0]*0.2, screen_dims[1]*0.2)
	}
}


function startPlay() {
	user_name = name_input.value();
	var introHtml = document.getElementById("intro");
	introHtml.innerHTML = "";
	level.envi = "play";
	name_input.remove();
	continueButton.remove();
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
	  	name_input.position(20, 190);
		continueButton = createButton('Continue');
	  	continueButton.position(name_input.x + name_input.width, 190);
	  	continueButton.mousePressed(startPlay);
	  	this.barriers = [new Barrier()];
	  	this.barriers[0].initialize(this.level_length);
	  	this.num_clouds = int(this.level_length/0.3);
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
		this.num_clouds = int(this.level_length/0.3);
		this.level += 1;
		this.level_length += 1;
		for (var i = 0; i < this.obstacles; i++) {
			this.barriers.push(new Barrier());
			this.barriers[i].initialize(this.level_length);
		}
		for (var i = 0; i < int(this.level_length/0.3); i++) {
	  		this.clouds.push(new Cloud());
	  		this.clouds[i].initialize(this.level_length);
	  	}
	}
	this.display = function() {
		if (this.envi == "play") {
			textSize(30);
			text(user_name, screen_dims[0]*0.01, screen_dims[1]*0.13);
			text("Level " + this.level, screen_dims[0]*0.01, screen_dims[1]*0.06);
			if(this.level == 1) {
				text("OK We are going to start out easy.", screen_dims[0]*0.5, screen_dims[1]*0.15)
			}
			else if(this.level == 2) {
				text("OK the game is basicly over now.", screen_dims[0]*0.5, screen_dims[1]*0.15)
			}
			else if(this.level == 3) {
				text("Winston asked \n(from a far distance away)\n\
his mirror 'Mirror mirror on the wall how can I become really cool?'\n\
3 hours later Winston was found dead,\ncrushed and hanging from the ceiling.\n\
What did Winston see in the mirror?", screen_dims[0]*0.1, screen_dims[1]*0.15)
			}
			else if(this.level == 4) {
				text("It was a concave mirror,\n\
so Winston say a smaller inverted version of himself,\n\
and proceeded to replicate the real image.", screen_dims[0]*0.1, screen_dims[1]*0.15)
			}
			else if(this.level == 5) {
				text("Once Winston asked the Convex lens \n\
how it always sayed so foccused.", screen_dims[0]*0.1, screen_dims[1]*0.15)
			}
			else if(this.level == 6) {
				text("The lens answered, \n\
I won't focus when the object distance is really small.", screen_dims[0]*0.1, screen_dims[1]*0.15)
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
			if (collide(this.barriers[i].perceived_pos, user_pos, this.barriers[i].dims, user_dims)) {
				if (user_invincibility == false) {
					this.envi = "loose";
				}
			}
			// The extra seemingly random addition in the conitional below buys a little extra delay time before the win
			if (this.barriers[i].perceived_pos[0] + this.barriers[i].dims[0] + screen_dims[0]*0.3> user_pos[0]) {  
				more_coming = true;
			}
		}
		if (more_coming == false) {
			this.update();
		}
	}
};


function Player() {
	this.initialize = function() {
		this.dims = [int(screen_dims[0]*0.1), int(screen_dims[1]*0.3)];
		this.std_pos = [int(screen_dims[0]*0.3), screen_dims[1]-this.dims[1]]; 
		this.jump_speed = 25;
		this.y_pos = this.std_pos[1];
		this.y_vel = 0;
		this.y_acc = 0;	
		this.ani_state = 0;
		this.pos = [this.std_pos[0], this.y_pos];	
		this.invincibility = false;
	}
	this.on_key_press = function() {
		if (keyCode == UP_ARROW) {
			if (this.y_pos >= this.std_pos[1])
			this.y_vel = -this.jump_speed;
		}
		if (key == "i") {
			this.invincibility = true;
		}

	}
	this.update = function(dt) {
		if (this.y_pos >= this.std_pos[1] && this.y_vel > 0) {
			this.y_acc = 0;
			this.y_vel = 0;
		}
		else {
			this.y_acc = gravity;
		}
		this.y_pos += this.y_vel*dt;
		this.y_vel += this.y_acc*dt;
		this.pos = [this.std_pos[0], this.y_pos];
	}
	this.display = function() {
		var cur_image = player_images[this.ani_state];
		image(cur_image, this.std_pos[0], this.y_pos, this.dims[0], this.dims[1]);
	}
};


function collide(pa, pb, da, db) {
	var right_x = pa[0] < pb[0] + db[0];
    var left_x = pb[0] < pa[0] + da[0];
    var top_y = pb[1] < pa[1] + da[1];
    var bottom_y = pa[1] < pb[1] + db[1];
    if (right_x && left_x && top_y && bottom_y) {
        return true
    }
    else {
        return false
    }
}


function Barrier() {
	this.initialize = function(level_length) {
		var rand_bar_width = int(random(screen_dims[0]*0.05, screen_dims[0]*0.15));
		var rand_bar_height = int(random(screen_dims[1]*0.05, screen_dims[1]*0.15));  
		this.dims = [rand_bar_width, rand_bar_height]
		this.x = random(screen_dims[0], screen_dims[0]*level_length);
		this.image_state = 0;
		this.offset = 0;
		this.perceived_pos = [this.x-this.offset, screen_dims[1]-this.dims[1]];
	}
	this.update = function(dt) {
		this.offset += dt*10;
		this.perceived_pos = [this.x-this.offset, screen_dims[1]-this.dims[1]];
	}
	this.display = function() {
		var cur_image = barrier_images[this.image_state];
		image(cur_image, this.perceived_pos[0], this.perceived_pos[1], this.dims[0], this.dims[1]);
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
	}
	this.update = function(dt) {
		this.offset += dt*9;
		this.perceived_pos = [this.x-this.offset, this.perceived_pos[1]];
	}
	this.display = function() {
		var cur_image = cloud_images[this.image_state];
		image(cur_image, this.perceived_pos[0], this.perceived_pos[1], this.dims[0], this.dims[1]);
	}
};
