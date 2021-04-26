const typesEnum = Object.freeze({
  'play': 0,  // Play against saved model
  'train': 1, // Train model from ground up
  'pit': 2   // Unimplemented
})

//Dimensions of the Canvas (currently 4:3 AR) 
//                       Width, Height
const screenDimensions = [ 560, 420 ];

// Which type of game you want (must be from typesEnum if you want it to work)
const gameType = typesEnum.train

// If the play enum is selected this is the name of the network that is loaded to play against
const loadwhich = 'gen100'

// These are the games that will be created for training, 2 networks per game
const gameInfo = [
// [name   ,    color]
  ['blue'  , '#6577B3'],
  ['red'   , '#d61a3c'],
  ['white' , '#f5f0f0'],
  ['yellow', '#ffe338'],
  ['green' , '#48A14D']]

// Neural Network Structure of hidden layers (only needed for training)
const netStructure = [6, 2]

// These are what the input layer for a network contains
// They can include: 'yPos', 'xBall', 'yBall', 'xVel', 'yVel', 'mag'
const netInputs = ['yPos', 'xBall', 'yBall', 'xVel', 'yVel', 'mag']

// The number of datasets (with random data) that are used for training a brand new network
const randomTraining = 3;


