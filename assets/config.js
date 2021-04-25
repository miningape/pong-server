const typesEnum = Object.freeze({
  'play': 0,  // Play against saved model
  'train': 1, // Train model from ground up
  'pit': 2   // Unimplemented
})

const gameType = typesEnum.train
const loadwhich = ''

const gameInfo = [
  ['blue', '#6577B3'],
  ['red', '#d61a3c'],
  ['white', '#f5f0f0'],
  ['yellow', '#ffe338'],
  ['green', '#48A14D'],
  ]

//                       Width, Height
const screenDimensions = [ 560, 420 ];

// Neural Network Structure of hidden layers
const netStructure = [2]


