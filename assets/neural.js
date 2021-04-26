let nam = 0;

class neural {
  constructor( name, JSON ) {
    this.net = new brain.NeuralNetwork({
      hiddenLayers:netStructure,
    });
    this.name = name;

    // If uninitialize we make it with random values
    if ( JSON == undefined ) {
      let trainingData = []
      for (let i = 0; i < randomTraining; i++) {
        let model = { 
                      input: {}, 
                      output: { 
                        direction: random() 
                      }
                    }
        netInputs.forEach(key => {
          model.input[key] = random();
        })
        trainingData.push(model);
      }

      this.net.train( trainingData );
    } else {
      this.net.fromJSON( JSON );
    }
    //console.log(this.net.toJSON())
  }
}

function crossover( neural1, neural2 ) {
  let JSON1 = neural1.net.toJSON();
  let JSON2 = neural2.net.toJSON();
  let rtnJSON = JSON1;
  let sizes = JSON1.sizes;

  let r_value = random();
  
  let layer = Math.floor( random() * 2 ) + 1;
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

  // 20% chance to mutate
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
  }

  if (random() < 0.15) {
    JSON = undefined;
  }
  
  //completely replace it with a new random value
  //change the weight by some percentage. (multiply the weight by some random number between 0 and 2 - practically speaking we would tend to constrain that a bit and multiply it by a random number between 0.5 and 1.5. This has the effect of scaling the weight so that it doesn't change as radically. You could also do this kind of operation by scaling all the weights of a particular neuron.
  //add or subtract a random number between 0 and 1 to/from the weight.
  //Change the sign of a weight.
  //swap weights on a single neuron.
  return JSON;
}