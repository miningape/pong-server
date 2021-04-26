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
let generations = 0;

// Save JSON to file
button.addEventListener('click', () => {
  $.ajax({
    // Server URI is /save/:name/:json
        url: '../save/'+named.value+'/'+JSON.stringify(currentBest.net.toJSON()),
        type: 'get',  // HTTP method really doesnt matter too much in this case
        data: null,
        success: function(){
        }
    });
});


class game{
  constructor(color, name, player=false){
    this.color = color;
    this.name = name;

    console.log(loadedJSON, loadwhich)

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


function setup() {
  noLoop();
  let c = createCanvas(WIDTH, HEIGHT);
  c.parent( 'container' )
  rectMode(CORNER);
  ellipseMode(CENTER);
  frameRate(60)

  // Load JSON from saved file
  $.getJSON('/data', (data) => {
    loadedJSON = data;
    console.log(loadedJSON)
  }).done( () => {
    // Then setup the games
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
    loop();
  })
}

function draw() {
  // Refresh
  background('#171717');

  // Draw Mid Lines
  fill('#f5f0f0');
  for ( let i in Array(20).fill(0).map( (v, i) => i ) ) {
    rect( (WIDTH / 2) - 2, ((i*HEIGHT)/20) + 7, WIDTH/105, HEIGHT/40 );
  }

  // Draw game and update score
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
          fitness: ( game.scores[i].score ) * 2 + game.scores[i].hits/10 + (Math.max(game.scores[1-i].score - game.scores[i].score, 0) *2)
        } );
        } else {
        population.push( {
          network: game.brains[i],
          fitness: 1
        } );
        }
      }
    });

    // Push previous best into the population
    if (currentBest) {
    population.push({
      network: currentBest,
      fitness: currentBestFitness
    })
    }
    
    // Choose best from this round
    let c = 0;
    population.forEach( elem => {
      if ( elem.fitness > c && elem.network != currentBest ) {
        currentBest = elem.network
        c = elem.fitness;
        currentBestFitness = c;
      }
    } )

    console.log(population)
    
    // Crossover and mutate networks
    games.forEach( game => {
      // Select networks and cross them over
      let JSON1 = mutate(crossover( select(population), select(population) ));
      let JSON2 = mutate(crossover( select(population), select(population) ));

      // LOad neural networks into each game
      game.updateBrains( [
        new neural( game.name+' left', JSON1 ),
        new neural( game.name+' right',JSON2 )
      ] );
    } );

    // Restart
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
