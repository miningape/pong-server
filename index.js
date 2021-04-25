const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static('assets'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/data', (req, res) => {
	res.sendFile(__dirname + '/data.json');
});

app.get('/save/:name/:data', (req, res) => {
	// Lord have mercy synchronus code in node
	console.log('reading json');
	let input = JSON.parse(fs.readFileSync(__dirname + '/data.json'));
	input[req.params.name] = JSON.parse(req.params.data);

	console.log('writing json');
	let output = JSON.stringify(input, null, 2);
	fs.writeFileSync(__dirname + '/data.json', output);
	console.log('done');
});

app.listen(3000, () => {
	console.log('Listening on localhost:3000');
});
