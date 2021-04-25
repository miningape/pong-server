let nam = 0;

class neural {
  constructor( name, JSON ) {
    this.net = new brain.NeuralNetwork({
      hiddenLayers:[2],
    });
    this.name = name;

    // If uninitialize we make it with random values
    if ( JSON == undefined ) {
      this.net.train([
        { 
          input: {
            yPos:  random(), 
            //xBall: random(), 
            yBall: random(), 
            //xVel:  random(),
            //yVel:  random(),
            //mag:   random()
          }, 
          output: {direction:random()} 
        },
        { 
          input: {
            yPos:  random(), 
            //xBall: random(), 
            yBall: random(), 
            //xVel:  random(),
            //yVel:  random(),
            //mag:   random()
          }, 
          output: {direction:random()} 
        },
        { 
          input: {
            yPos:  random(), 
            //xBall: random(), 
            yBall: random(), 
            //xVel:  random(),
            //yVel:  random(),
            //mag:   random()
          }, 
          output: {direction:random()} 
        }
      ]);
    } else {
      this.net.fromJSON( JSON );
    }
    //console.log(this.net.toJSON())
  }
}