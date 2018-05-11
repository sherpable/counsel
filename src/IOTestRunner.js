module.exports = class IOTestRunner
{
	constructor(tests)
	{
		this.tests = tests;

		this.pass = true;
		this.fail = false;

		this.yaml = require('js-yaml');
		this.superchild = require('superchild');
		this.chalk = require('chalk');
		this.figures = require('figures');
		this.dumper = require('intitule');
		this.dumper.addLeftMargin = false;
		this.dumper.makeGlobal();
	}

	test()
	{
		this.tests.forEach(test => {
            this.runTest(test);
        });

        return this.pass;
	}

	runTest(testContext)
	{
		let childParentMessage = false;

		let testFile = testContext.filename;

		let test = testContext.test;

		process.stdout.write(`${this.figures.pointer} ${test.test} (${this.chalk.green(testFile)})`);

		// const spawn = require('child_process').spawnSync;
		// const child = spawn(test.perform);

		// let result = child.stdout.toString();

		// dd(result);

		let counselProcess = this.superchild(test.perform);

		let result = [];
		let data = {};

		counselProcess.on('stdout_line', function(line) {
			console.log(line + '---');
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
		        console.log(chalk.green(` ${this.figures.tick}`));
		        console.log('');
		    } else {
		    	this.markFailure();

		        console.log(chalk.red(` ${this.figures.cross}`));
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
		            console.log(chalk.green(` ${this.figures.tick}`));
		        } else {
					this.markFailure();

		            console.log(chalk.red(` ${this.figures.cross}`));

		            let expected = test.assertions[assertion];
		            let actual = counselResults[assertion];

		            console.log(`--- Expected`);
		            dump(expected);
		            console.log(`+++ Actual`);
		            dump(actual);
		        }
		    }
		});
	}

	markFailure()
	{
		this.pass = false;
		this.fail = true;
	}
}