var spawnSync = require('child_process').spawn;
var process1 = spawnSync('find', [ '.' ], {
    cwd: process.cwd() + '/doubles/ls-dir',
    stdio: 'pipe',
});

let process2 = spawnSync('sort', ['-r'], {
    stdio: [process1.stdout, 'pipe', 'pipe'],
});

var result = '';
process2.stdout.on('data', data => result += data);
process2.on('close', () => console.log(result));

// console.log(process2.stdout.toString());
