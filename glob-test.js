const glob = require('fast-glob');

const entries = glob.sync(['tests/**/*Test.js', 'tests/**/*Test.yaml']);
console.log(entries);