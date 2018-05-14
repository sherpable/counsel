module.exports = class IOTestRunner
{
	constructor(tests)
	{
		this.tests = tests;

		this.pass = true;
		this.fail = false;

		this.yaml = require('js-yaml');
		this.chalk = require('chalk');
		this.figures = require('figures');
		this.dumper = require('intitule');
		this.dumper.leftMarginSpaces = 4;
		this.dumper.makeGlobal();

		console.log('');
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
		test.perform = test.perform.trim();

		process.stdout.write(`  ${this.figures.pointer} ${test.test} (${this.chalk.green(testFile)})`);

		const spawn = require('child_process').spawnSync;

		let args = [];

		if (test.perform.startsWith('src/counsel.js')) {
			args.push('io-test');
		}

		// Need to parse args
		if (test.perform == 'ls -al') {
			args.push('-al');
			test.perform = 'ls';
		}

		const counselProcess = spawn(test.perform, args);

		// Process IO results
		let result = counselProcess.stdout.toString();
		let error = counselProcess.stderr.toString();

		let data = {};

		result = result.split('\n').map(line => {
			// Maybe need to remove the trim() call
			// Because of manipulating the output.
			return line.trim();
		});

		let childParentMessageStart = result.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:START');
		let childParentMessageEnd = result.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:END');

		var childParentMessages = result.splice(childParentMessageStart, childParentMessageEnd - 1);
		childParentMessages = childParentMessages.splice(1, childParentMessages.length - 2);

		// Convert raw child messages into an object
		childParentMessages.forEach(rawMessage => {
			let value = rawMessage.split('=');
			data[value[0]] = value[1];
		});

		// Run IO assertions
	    let counselResults = {
	        status: counselProcess.status,
	        signal: counselProcess.signal,
	    };

	    for (let item in data) {
	        let itemValue = data[item];

	        test.expect = test.expect.replace(`\{\{${item}\}\}`, itemValue);
	    }

	    // main test
	    let actual = result.join('\n');

	    if (actual === test.expect) {
	        console.log(this.chalk.green(` ${this.figures.tick}`));
	    } else {
	    	this.markFailure();

	        console.log(this.chalk.red(` ${this.figures.cross}`));
	        console.log('');

	        console.log(`--- Expected\n${test.expect.split(' ').join(this.chalk.bold.red('.'))}\n+++ Actual\n${actual.split(' ').join(this.chalk.bold.red('.'))}`);
	    }

	    if (! test.assertions) {
	        return;
	    }

	    console.log(this.chalk.yellow('  Assertions'));

	    for (let assertion in test.assertions) {
	        process.stdout.write(`  - ${assertion}`);

	        if (test.assertions[assertion] === counselResults[assertion]) {
	            console.log(this.chalk.green(` ${this.figures.tick}`));
	        } else {
				this.markFailure();

	            console.log(this.chalk.red(` ${this.figures.cross}`));

	            let expected = test.assertions[assertion];
	            let actual = counselResults[assertion];

	            console.log(`    --- Expected`);
	            dump(expected);
	            console.log(`    +++ Actual`);
	            dump(actual);
	        }
	    }
	}

	markFailure()
	{
		this.pass = false;
		this.fail = true;
	}
}
