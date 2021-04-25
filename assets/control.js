const typesEnum = Object.freeze({
  'play': 0,  // Play against saved model
  'train': 1, // Train model from ground up
  'pit': 2   // Unimplemented
})

let gameType = typesEnum.train
let loadwhich = ''

let gameInfo = [
  ['blue', '#6577B3'],
  ['red', '#d61a3c'],
  ['white', '#f5f0f0'],
  ['yellow', '#ffe338'],
  ['green', '#48A14D'],
  ]

