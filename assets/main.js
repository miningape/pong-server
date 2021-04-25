let WIDTH  = screenDimensions[0];
let HEIGHT = screenDimensions[1];

//let theBall;
//let playerPaddle;

//let paddleFlagMap = new Map();

let paddles = [];
let games = [];
let scoreElem = document.querySelector('#score');
let button = document.querySelector('#saveBtn');
let named = document.querySelector('#saveName')
let currentBest;
let currentBestFitness;
let loadedJSON = {};
let generations = 1;

// Save JSON to file
button.addEventListener('click', () => {
  $.ajax({
        url: '../save/'+named.value+'/'+JSON.stringify(currentBest.net.toJSON()),
        type: 'get',
        data: null,
        success: function(){
        }
    });
});

// Load JSON from saved file
$.getJSON('../data', (data) => {
  loadedJSON = data;
  //console.log(loadedJSON)
})

class game{
  constructor(color, name, player=false){
    this.color = color;
    this.name = name;

    this.ball = new ball();
    this.paddles = [new paddle( 10, player ), new paddle( WIDTH-20 )];
    this.brains = [new neural(this.name+' left'), new neural(this.name+' right', player ? loadedJSON[loadwhich] : null)];
    this.scores = [{score:0, hits:0}, {score:0, hits:0}]

    this.paddleFlagMap = new Map();
    this.paddleFlagMap.set( this.paddles[0], false );
    this.paddleFlagMap.set( this.paddles[1], false );

    this.MAX_PLY = player ? Infinity : 20;
    this.MAX_ROUNDS = player ? Infinity : 6;
    this.cur_PLY = 0;
    this.cur_ROUNDS = 0;

    this.DONE_FLAG = false;
  }

  update() {
    if ( !(this.cur_ROUNDS == this.MAX_ROUNDS) ) {
      this.paddles.forEach( (paddle, i) => paddle.update( this, i ))
      this.ball.update( this );
    } else {
      this.DONE_FLAG = true;
    }

    if ( this.cur_PLY == this.MAX_PLY) {
      this.cur_ROUNDS++;
      this.cur_PLY = 0;
      this.ball.reset();
    }
  }

  draw() {
    if ( !(this.cur_ROUNDS == this.MAX_ROUNDS) ) {
      fill( this.color );
      this.paddles.forEach(paddle => paddle.draw());
      this.ball.draw();
    }
  }

  updateBrains( brains ) {
    this.brains = brains;
  }

  resetGame() {
    this.cur_PLY = 0;
    this.cur_ROUNDS = 0;
    this.scores = [{score:0, hits:0}, {score:0, hits:0}];
    this.ball.reset();
    this.paddles.forEach(paddle => paddle.reset());
    this.DONE_FLAG = false;
  }
}

function crossover( neural1, neural2 ) {
  let JSON1 = neural1.net.toJSON();
  let JSON2 = neural2.net.toJSON();
  let rtnJSON = JSON1;
  let sizes = JSON1.sizes;

  //console.log( JSON1, JSON2, rtnJSON );

  // Swap single weight
  // Swap single bias
  // Swap all on one layer
  // Swap some

  let r_value = random();
  // Swap all neurons in a layer

  // Swap all biases in a layer
let layer = Math.floor( random() * 2 ) + 1;
      //let neuron = Math.floor( random() * sizes[layer] )
      // Iterate through each neuron in random layer
      let neuron_keys = Object.keys(JSON1.layers[layer]).map(str => /[0-9]/.test(str) ? parseInt(str) : str);

  // Swap all weights on one layer
  switch ( random(0,3) ) {
    case 0:
      neuron_keys.forEach( n_key => {
        let weight_keys = Object.keys(JSON1.layers[layer][n_key].weights).map(str => /[0-9]/.test(str) ? parseInt(str) : str);

        //console.log('weights:', n_key, JSON1.layers[layer][n_key])
        // Iterate through each weight on that neuron
        weight_keys.forEach(w_key => {
          // 50/50 of wapping weight
          if ( random() > 0.5 ) {
            rtnJSON.layers[layer][n_key].weights[w_key] = JSON2.layers[layer][n_key].weights[w_key];
          }
        });
      });
      break;

    // Swap all neurons
    case 1:
      neuron_keys.forEach( n_key => {
        if (random() > 0.5) {
          rtnJSON.layers[layer][n_key] = JSON2.layers[layer][n_key];
        }
      } );
      break;
    
    // Swap all biases
    case 2:
      neuron_keys.forEach( n_key => {
        if (random() > 0.5) {
          rtnJSON.layers[layer][n_key].bias = JSON2.layers[layer][n_key].bias;
        }
      } );
      break;
    
    // swap random amount of weights
    // swap random amount of bias
    // swap random amount of neuron
    // swap one weight
    // swap one bias
    // swap one neuron
  }

  return rtnJSON;
}

function mutate( neural ) {
  let JSON = neural;//neural.net.toJSON();
  let sizes = JSON.sizes;

  let layer = Math.floor( random() * 2 ) + 1;
  let neuron = Math.floor( random() * sizes[layer] );
  neuron = Object.keys(JSON.layers[layer]).map(str => /[0-9]/.test(str) ? parseInt(str) : str)[neuron];
  let weight_keys = Object.keys(JSON.layers[layer][neuron].weights).map(str => /[0-9]/.test(str) ? parseInt(str) : str);
  let weight = random(weight_keys);

  //console.log('New network:', JSON)

  // 10% chance to mutate
  if ( random() < 0.2 ) {
    switch( Math.floor(random(0,10)) ) {
      // Replace with rand
      case 0:
      case 1:
        JSON.layers[layer][neuron].weights[weight] *= random(0.5, 1.5);
        break;
      case 2:
        JSON.layers[layer][neuron].weights[weight] = random(-1.5, 1.5);
        break;
      case 3:
        JSON.layers[layer][neuron].weights[weight] *= -1;
        break;
      case 4:
        JSON.layers[layer][neuron].weights[weight] += random(-1, 1);
        break;
      case 5:
        JSON.layers[layer][neuron].bias = random(-1.5, 1.5);
        break;
      case 6:
      case 7:
        JSON.layers[layer][neuron].bias *= random(0.5, 1.5);
        break;
      case 8:
        JSON.layers[layer][neuron].bias += random(-1, 1);
        break;
      case 9:
        JSON.layers[layer][neuron].bias *= -1;
        break;
      default:
        console.log('Weird unaccountedfor mutation number');
        break;
    } 

    return JSON;
  }
  
  //completely replace it with a new random value
  //change the weight by some percentage. (multiply the weight by some random number between 0 and 2 - practically speaking we would tend to constrain that a bit and multiply it by a random number between 0.5 and 1.5. This has the effect of scaling the weight so that it doesn't change as radically. You could also do this kind of operation by scaling all the weights of a particular neuron.
  //add or subtract a random number between 0 and 1 to/from the weight.
  //Change the sign of a weight.
  //swap weights on a single neuron.

}

function setup() {
  let c = createCanvas(WIDTH, HEIGHT);
  c.parent( 'container' )
  rectMode(CORNER);
  ellipseMode(CENTER);
  frameRate(60)
  //so basically what i changed was we can now call
  // theBall = new ball(100, 200, 2, 0);
  // For random start
  //theBall = new ball();
  //paddles.push( new paddle( 10 ) );
  // I and K to move this othe rpaddle
  //paddles.push( new paddle( WIDTH-20, 73, 75 ) );

  //paddleFlagMap.set( paddles[0], false );
  //paddleFlagMap.set( paddles[1], false );

  switch (gameType) {
    case typesEnum.train:
      gameInfo.forEach( info => {
        games.push( new game( info[1], info[0] ) );
      } )
      break;
    case typesEnum.play:
      games.push( new game( '#f5f0f0', 'Man Vs. Machine', true ) )
      break;
    default:
      alert('unimplemented')
      break;
  }
}

function draw() {
  // Refresh
  background('#171717');

  // Draw Mid Lines
  fill('#f5f0f0');
  for ( let i in Array(20).fill(0).map( (v, i) => i ) ) {
    rect( (WIDTH / 2) - 2, ((i*HEIGHT)/20) + 7, WIDTH/105, HEIGHT/40 );
  }

  let DONE_COUNTER = 0;
  scoreElem.innerHTML = 'Scores: ' + generations + '<br />'
  games.forEach(game => {
    // Print data
    scoreElem.innerHTML += `${game.name}(${game.cur_ROUNDS}/${game.cur_PLY}) -> Left:${game.scores[0].score}/${game.scores[0].hits}, Right:${game.scores[1].score}/${game.scores[1].hits} <br />`;

    game.update();
    game.draw();

    if (game.DONE_FLAG) {
      DONE_COUNTER++;
    }
  })

  // if all the games are done generate new neurals
  if (DONE_COUNTER == games.length) {
    generations++;
    scoreElem.innerHTML += 'Finished: Selecting for next generation'

    // games= [] to reset
    let population = [];
    // Calculate fitness
    games.forEach(game => {
      for ( let i = 0; i < 2; i++ ){
        if (game.scores[i].hits > 0){
        population.push( {
          network: game.brains[i],
          fitness: (game.scores[i].score ) + game.scores[i].hits/10 + (Math.max(game.scores[1-i].score - game.scores[i].score, 0) *2)
        } );
        } else {
        population.push( {
          network: game.brains[i],
          fitness: 1
        } );
        }
      }
    });

    if (currentBest) {
    population.push({
      network: currentBest,
      fitness: currentBestFitness
    })
    }
    
    let c = 0;
    population.forEach( elem => {
      if ( elem.fitness > c && elem.network != currentBest ) {
        currentBest = elem.network
        c = elem.fitness;
        currentBestFitness = c;
      }
    } )

    console.log(population)

    // Number of networks: games.length * 2
    // Code stolen from https://github.com/CodingTrain/Rainbow-Topics/issues/119
    /*
    // Reduce to maximum fitness
    let total_fitness = population.reduce( (acc, cur) => acc + cur.fitness, 0 );

    // Map values to weighted fitness
    let weighted = population.map( cur => { 
      return {
        network: cur.network,
        fitness: cur.fitness / total_fitness
      }
     } );*/
    
    // Crossover networks
    games.forEach( game => {
      // Select networks and cross them over
      let JSON1 = mutate(crossover( select(population), select(population) ));
      let JSON2 = mutate(crossover( select(population), select(population) ));

      game.updateBrains( [
        new neural( game.name+' left', JSON1 ),
        new neural( game.name+' right',JSON2 )
      ] );
    } );

    games.forEach(game => game.resetGame());
  }
  

  // Draw objects
  //paddles.forEach(paddle => paddle.draw())
  //theBall.draw();
  
  // Update objects
  //paddles.forEach(paddle => paddle.update())
  // jeff
  //theBall.update( games );
}

const select = ( array ) => {
  let weighted = []
  array.forEach( elem => {
    let i = 0;
    while ( i < elem.fitness ) {
      weighted.push(elem.network);
      i++;
    }
  } )
  return random(weighted);
}

/* Weird algorithm i found online
const select = ( array ) => {
  let r_value = random();
  for ( let i = 0; i < array.length; i++ ) {
    let value = array[i].network;
    let weight = array[i].fitness;

    if (r_value < weight){
      console.log(value);
       return value;
    }
    else r_value -= weight;
  }
  return null;
}*/

