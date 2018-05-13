const spawn = require('child_process').spawnSync;
const child = spawn('src/counsel.js');

let result = child.stdout.toString();

console.log(result);