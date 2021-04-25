class paddle {
    constructor( x, player= false) {
        this.x = x;
        this.y = (HEIGHT/2)-40; // 40 is half the width of paddle 
        this.vel = 4;
        this.width = 10;
        this.height = 80;
        this.upkey = 87;
        this.downkey = 83;
        this.player = player;
    }

    // Algorithm for finding closest point inside rect to another point
    // Orientation is either 0(left) or 1(right) for the side the panel is on, this is to know what direction to extend the pannel on ()
    closestPoint( x, y, orientation ) {
      let rtn = {x: x, y: y};

      // Min is top left corner
      // Max is bottom right corner
      let yMax = this.y + this.height;
      let yMin = this.y;
      // Could be change to this for P E R F O R M A N C E, but it 
      // shouldnt make a big difference
      // (1-orientation)*Infinity + width
      let xMax = (1-orientation) ? this.x + this.width : Infinity;
      let xMin = !(1-orientation) ? this.x : -Infinity;

      rtn.x = ( x > xMax ) ? xMax : rtn.x;
      rtn.x = ( x < xMin ) ? xMin : rtn.x;
      rtn.y = ( y > yMax ) ? yMax : rtn.y;
      rtn.y = ( y < yMin ) ? yMin : rtn.y;

      return rtn;
    }

    // Update function, at the moment it just does keypresses
    update( gameObj, i ) {
      // nam jef
      if ( this.y < 0 ) {
        this.y = 0;
      }
      if ( this.y + this.height > HEIGHT ) {
        this.y = HEIGHT - this.height;
      }
      // keyIsDown(this.downkey)
      //let x = Math.random();
      if (this.player) {
        if (keyIsDown(this.upkey)) this.y -= this.vel;
        if (keyIsDown(this.downkey)) this.y += this.vel;
      // Get the network for this paddle
      } else {
        let aBrain = gameObj.brains[i]; 
        let output = aBrain.net.run(
          {
            yPos:this.y/HEIGHT, 
            //xBall:gameObj.ball.pos.x/WIDTH, 
            yBall:gameObj.ball.pos.y/HEIGHT, 
            //xVel:gameObj.ball.vel.x/4,
            //yVel:gameObj.ball.vel.y/4,
            //mag: gameObj.ball.speed/20
          }
        );
        
        if ( output.direction >= 0.5 ) {
          this.y -= this.vel;
        } else {
          this.y += this.vel;
        }
      }

    }

    draw() {
        strokeWeight(0);
        //fill('#f5f0f0');

        // Code to see hitbox
        //stroke(255,0,0)
        //strokeWeight(1);
        //rect(this.x, this.y, this.width, this.height);
        //strokeWeight(0);
        rect(this.x, this.y, this.width, this.height, 10);
    }

    reset() {
      this.y = (HEIGHT/2)-40;
    }
}