// Imports
const express = require('express');
const fs = require('fs');
const app = express();

// Send js files as static
app.use(express.static('assets'));

// Index route
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

// Data route
app.get('/data', (req, res) => {
	res.sendFile(__dirname + '/data.json');
});

// Saving data route
app.get('/save/:name/:data', (req, res) => {
	// Lord have mercy synchronus code in node
  // Read data from file
	console.log('reading json');
	let input = JSON.parse(fs.readFileSync(__dirname + '/data.json'));

  // Append info to json
	input[req.params.name] = JSON.parse(req.params.data);

  // Write the appended json to file
	console.log('writing json');
	let output = JSON.stringify(input, null, 2);
	fs.writeFileSync(__dirname + '/data.json', output);
	console.log('done');
});

// Start point
app.listen(3000, () => {
	console.log('Listening on localhost:3000');
});
