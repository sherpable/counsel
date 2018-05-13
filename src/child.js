const spawn = require('child_process').spawnSync;
const child = spawn('src/counsel.js', ['io-test']);

let result = child.stdout.toString();

console.log(result);