const yaml = require('js-yaml');
const fs = require('fs');
const formatTime = require('pretty-ms');
const superchild = require('superchild');

let test = yaml.safeLoad(fs.readFileSync('dot-reporter.yaml', 'utf8'));

console.log(test.test);

const counselProcess = superchild(test.perform);

let result = [];
let data = {};

counselProcess.on('stdout_line', function(line) {
    if (line.trim().startsWith('COUNSEL-CHILD-PARENT-MESSAGE:')) {
        let plainValue = line.trim().replace('COUNSEL-CHILD-PARENT-MESSAGE:', '');
        let value = plainValue.split('=');
        data[value[0]] = value[1];

        return;
    }

    // Maybe need to remove the trim() call
    // Because of manipulating the output.
    result.push(line.trim());
});

counselProcess.on('exit', function(status, signal) {
    let counselResults = {
        status
    };

    for (item in data) {
        let itemValue = data[item];

        test.expect = test.expect.replace(`\{\{${item}\}\}`, itemValue);
    }

    if (test.expect.endsWith('\n')) {
        test.expect = test.expect.substring(0, test.expect.length - 1);
    }

    console.log(result.join('\n') === test.expect);

    for (assertion in test.assertions) {
        console.log(test.assertions[assertion] === counselResults[assertion]);
    }
});
