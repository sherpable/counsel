const yaml = require('js-yaml');
const fs = require('fs');
const formatTime = require('pretty-ms');
const superchild = require('superchild');
const chalk = require('chalk');
const figures = require('figures');
const dumper = require('intitule');
dumper.addLeftMargin = false;
dumper.makeGlobal();

let childParentMessage = false;

let testFile = 'dot-reporter.yaml';

let test = yaml.safeLoad(fs.readFileSync(testFile, 'utf8'));

process.stdout.write(`${figures.pointer} ${test.test} (${chalk.green(testFile)})`);

const counselProcess = superchild(test.perform);

let result = [];
let data = {};

counselProcess.on('stdout_line', function(line) {
    if (line.trim().startsWith('COUNSEL-CHILD-PARENT-MESSAGE:START')) {
        childParentMessage = true;

        return;
    }

    if (line.trim().startsWith('COUNSEL-CHILD-PARENT-MESSAGE:END')) {
        childParentMessage = false;

        return;
    }

    if (childParentMessage) {
        let value = line.split('=');
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

    // main test
    let actual = result.join('\n');

    if (actual === test.expect) {
        console.log(chalk.green(` ${figures.tick}`));
        console.log('');
    } else {
        console.log(chalk.red(` ${figures.cross}`));
        console.log('');

        console.log(`--- Expected\n${test.expect.split(' ').join(chalk.bold.red('.'))}\n+++ Actual\n${actual.split(' ').join(chalk.bold.red('.'))}`);
        console.log('');
    }

    if (! test.assertions) {
        return;
    }

    console.log(chalk.yellow('Assertions'));

    for (assertion in test.assertions) {
        process.stdout.write(`- ${assertion}`);

        if (test.assertions[assertion] === counselResults[assertion]) {
            console.log(chalk.green(` ${figures.tick}`));
        } else {
            console.log(chalk.red(` ${figures.cross}`));

            let expected = test.assertions[assertion];
            let actual = counselResults[assertion];

            console.log(`--- Expected`);
            dump(expected);
            console.log(`+++ Actual`);
            dump(actual);
        }
    }
});
