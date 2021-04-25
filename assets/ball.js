randArray = [-2,-1,1,2]

class ball{
  // Default values spawn of screen causing automatic reset on next frame
  constructor(x=WIDTH/2, y=HEIGHT/2, xSpeed=random(randArray), ySpeed=random([...randArray, 0, 0, 0, 0, 0, 0])) {
    //this.x = x;
    //this.y = y;
    this.pos = new p5.Vector(x, y);

    //this.xSpeed = xSpeed;
    //this.ySpeed = ySpeed;
    this.vel = new p5.Vector(xSpeed, ySpeed).normalize();
    
    this.SPEED_INCREMENT = 0.5;
    this.INITIAL_SPEED = 3.5;
    this.speed = this.INITIAL_SPEED;
    this.radius = 10;
    this.minDistance = this.radius * this.radius;
  }

  // Complicated maths
  /**
   * There is a problem with how we handle collisions
   * its not too different from quantum tunneling
   * 
   * Because games are just fancy flip books
   * frames actually matter for calculations
   * 
   * for example:
   * +---------+--------+--------+--------+
   * |  Type   | Frame1 | Frame2 | Frame3 |
   * +---------+--------+--------+--------+
   * | Perfect | O []   | O[]    | O []   |
   * | Inside  | O []   | 𝜙]     | O []   |
   * | Bad     | O []   | [] O   | []   O |
   * +---------+--------+--------+--------+
   * 
   * You can see in "perfect" and "inside" the ball actually
   * makes contact with the paddle so the collision is registered
   * 
   * but in bad the ball is travelling fast enough that in
   * between frames it "jumps" over the paddle 
   * 
   * There are a few solutions
   * 1) Extend the pannel further
   * 2) Set a cap on the max speed
   * 3) Complicated maths/raytracing
   * 
   * Each has their own problems, i chose to do 1 because it
   * seemed like it was simplest to implement, would have little/
   * no impact on performace and wouldn't limit ball speed
   * but,
   * There might be an edge case where the ball gets behind the
   * panel visual and "scores" visually but the collision makes
   * the ball bounce back.
   * I dont think this is an issue because unless we give
   * the panels a really really fast speed, and increase the 
   * distance to the wall or decrease the radius of the ball,
   * it shouldnt be a common issue, and i dont think its
   * possible under current circumstances (play testing might
   * help or the ai might exploit it and we find out)
   * 
   * big problem is there is still a case where tunneling occurs
   * 
   * other problem is weird bounce angles
   * https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc2013/slides/824737Catto_Erin_PhysicsForGame.pdf
   * 
   * notes:
   * Basically any line (y=cx+d), calculate where it intersects another line (y=ax+b)
   * 
   * x_intersection: cx+d = ax+b -> (d-b)/(a-c)=x
   * y_intersection: (y-d)/c = (y-b)/a -> (y-d)c = da-cb/(a-c)
   * 
   * Because we are using vectors:
   * v1(x1,y1) and v2(x2,y2) as representations for a line
   * y=ax+b becomes y=(y2-y1)/(x2-x1)x + b
   * 
   * b is a bit more complicated but basically we have a value for y and x we know work so we substitute in
   * y=ax+b -> y1 = a(x1)+b since we "know" a we can use it
   * y1-a(x1)=b
   * 
   * puttin it all together:
   * Line 1: y=ax+b: y=(y2-y1)/(x2-x1)x+(y1-((y2-y1)/(x2-x1))*x1)
   * Line 2: y=cx+d: y=(y4-y3)/(x4-x3)x+(y3-((y4-y3)/(x4-x3))*x3)
   * 
   * a= (y2-y1)/(x2-x1)
   * b= y1-(a*x1)
   * c= (y4-y3)/(x4-x3)
   * d= y3-(c*x3)
   */

  update( game ) {
    //this.x += this.xSpeed;
    //this.y += this.ySpeed;
    this.pos.add( this.vel.copy().mult(this.speed) );

    //let nextPos = this.pos.copy().add( this.vel );
    // Because paddles are created left then right
    // i represents which paddl
    let rtnFlag = false;
    game.paddles.forEach( (paddle, i) => {
      let closestPoint = paddle.closestPoint( this.pos.x, this.pos.y, i );
      
      let distance = (closestPoint.x - this.pos.x)**2 + (closestPoint.y - this.pos.y)**2;

      if ( game.paddleFlagMap.get(paddle) && distance > this.minDistance + 1 ) {
        game.paddleFlagMap.set(paddle, false);
      }

      if ( !game.paddleFlagMap.get(paddle) && distance <= this.minDistance ) { 
        // Probably best place to put new direction of bounce
        // closestPoint.y as a fraction of paddle height or something to calculate bounce angle

        //game.paddles[i] to call certain [i] paddle

        // (closestPoint.y - game.paddles[i].y) / (height / sections) 1.23214

        //da borger code
        // Top of Paddle
        let rely =  closestPoint.y - game.paddles[i].y;
        if ((rely < (game.paddles[i].height*0.4) )) {
          let maxy = game.paddles[i].height*0.4;
          // speed
          this.vel.x = Math.sign(this.vel.x)
          this.vel.y = -2 + random() //((maxy-rely) / maxy);
          //console.log('top')
        }

        // Middle
        if ( rely >= game.paddles[i].height*0.4 && rely <= game.paddles[i].height*0.6 ) {
          this.speed += this.SPEED_INCREMENT;
          //console.log('mid');
          this.vel.y = 0;

        }

        //* Bottom
        if ( ( rely > game.paddles[i].height*0.6)) {
          let miny = game.paddles[i].height*0.6;
          //console.log('bottom')
          this.vel.x = Math.sign(this.vel.x)
          this.vel.y = 2 + random()//rely / miny;
        }

        this.vel.x *= -1;
        this.speed += this.SPEED_INCREMENT;
        this.vel.normalize();

        // On contact set flag
        game.paddleFlagMap.set(paddle, true);
        game.cur_PLY++;
        game.scores[i].hits++;
        rtnFlag = true;

      }
    });

    if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > HEIGHT) {
      this.vel.y *= -1;
    }

    if (rtnFlag) return;

    if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > WIDTH) { 
      if (game.cur_PLY > 0) {
        if ( this.pos.x - this.radius < 0 ) game.scores[1].score++;
        else game.scores[0].score++;
      }
      
      game.cur_ROUNDS++;
      game.cur_PLY = 0;
      this.reset();
    }
  } 
  reset() {
    //this.x = WIDTH/2;
    //this.y = HEIGHT/2;
    //this.xSpeed = random(randArray);
    // Looks weird, basically adds 0 to the array so we can get horisontal movement
    //this.ySpeed = random([...randArray, 0]);

    this.speed = this.INITIAL_SPEED;
    this.pos.set(WIDTH/2, HEIGHT/2);
    this.vel.set(random(randArray), random([...randArray, 0, 0, 0, 0, 0, 0])).normalize();
  }

  draw() {
    //x, y, diameter
    //fill('#f5f0f0');
    stroke(0);
    circle(this.pos.x, this.pos.y, this.radius*2);
  }
} 