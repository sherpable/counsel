const glob = require('fast-glob');

const entriesUnit = glob.sync(['tests/**/*Test.js'], {
	nocase: true,
});

const entriesIO = glob.sync(['tests/**/*Test.yaml'], {
	nocase: true,
});

let paths = {};

entriesUnit.forEach(entry => {
	paths[entry.replace(/\.[^/.]+$/, '')] = entry;
});

entriesIO.forEach(entry => {
	paths[entry.replace(/\.[^/.]+$/, '')] = entry;
});

console.log(paths);