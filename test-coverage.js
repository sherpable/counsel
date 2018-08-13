let spawn = require('child_process').spawnSync;

let coverageProcess = spawn('node_modules/.bin/nyc', [
	'--reporter', 'text',
	'check-coverage',
	'--lines', '95',
	'src/counsel.js'
]);

let result = null;

if (coverageProcess.stdout) {
    result = coverageProcess.stdout.toString();
}

if (coverageProcess.stderr) {
    error = coverageProcess.stderr.toString();
}

console.log(result);
