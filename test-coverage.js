let spawn = require('child_process').spawnSync;

let coverageProcess = spawn('node_modules/.bin/istanbul', ['cover', 'src/counsel.js']);

let result = null;

if (coverageProcess.stdout) {
    result = coverageProcess.stdout.toString();
}

if (coverageProcess.stderr) {
    error = coverageProcess.stderr.toString();
}

console.log(result);
