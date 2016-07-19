if (typeof(module) !== 'undefined') {
    module.exports = projectile;
    acceleratable = require("./acceleratable.js");
}


function projectile(projName, meta, source) {
    // projectile != weapon since weapon will include beams and bays (launched ships)
    // one single projectile. Usually created en masse by a weapon.

    if (typeof(source) !== 'undefined') {
	movable.call(this, projName, source.system);
    }
    this.url = 'objects/projectiles/';
    this.pointing = 0;
    this.available = false;
    this.meta = meta;
    this.source = source;
    this.target;

}

projectile.prototype = new acceleratable

projectile.prototype.build = function() {
    this.targets = this.system.ships; // Temporary (PD weapons can hit missiles)
    var setAvailable = function() {
	this.available = true
    }

    return spaceObject.prototype.build.call(this)
	.then(collidable.prototype.makeHitbox.bind(this))
	.then(_.bind(setAvailable, this));

}


projectile.prototype.loadResources = function() {
    // would set this.meta.physics, but
    // this.meta.physics is given by weapon on construction.
    // so needed a dummy promise for spaceObject.
    return new Promise(function(fulfill, reject) {
	fulfill();
    });
}

projectile.prototype.render = function() {
    // Maybe move this to updateStats
    acceleratable.prototype.render.call(this);
    var collisions = this.detectCollisions(this.system.collidables);
    
    if ((collisions.length > 1) ||
	((collisions.length == 1) && (collisions[0] != this.source)) ) {

	this.end()
	clearTimeout(this.fireTimeout)
	
	_.each(collisions, function(collision) {
	    if (collision != this.source) {
		this.collide(collision);
	    }
	}, this);

    }

}

projectile.prototype.collide = function(other) {
    var collision = {};
    collision.shieldDamage = this.meta.properties.shieldDamage;
    collision.armorDamage = this.meta.properties.armorDamage;
    collision.impact = this.meta.properties.impact;
    collision.angle = this.pointing;
    other.receiveCollision(collision);
    
}


projectile.prototype.fire = function(direction, position, velocity, target) {
    // temporary. Gun points will be implemented later
    // maybe pass the ship to the projectile... or not
    // inaccuracy is handled by weapon
    this.target = target;
    this.fireTimeout = setTimeout(_.bind(this.end, this), this.meta.physics.duration * 1000/30);
    this.available = false;
    this.pointing = direction;
    this.position = _.map(position, function(x) {return x});

    // nova speeds for weapons is in pixels / frame * 100. 3/10 pixels / ms
    var factor = 3/10;

    // update the projectile's sprite's properties with the new ones
    // Placed before this.velocity... to reset this.lastTime
    this.lastTime = this.time;
//    this.render(); 
    this.velocity = [Math.cos(direction) * this.meta.physics.speed * factor + velocity[0],
		     Math.sin(direction) * this.meta.physics.speed * factor + velocity[1]];
    

    this.show();


    
//    this.
}

projectile.prototype.end = function() {
    this.velocity = [0,0];
    this.hide();
    this.available = true;

}

