module.exports = class IOTestRunner
{
	constructor(tests, reporter)
	{
		this.tests = tests;
		this.reporter = reporter;

		this.pass = true;
		this.fail = false;

		this.currentTestFail = false;

		this.yaml = require('js-yaml');
		this.chalk = require('chalk');
		this.figures = require('figures');
		this.dumper = require('intitule');
		this.path = require('path');

        this.root = this.path.normalize(
            process.cwd() + '/'
        );

		this.dumper.leftMarginSpaces = 4;
		this.dumper.makeGlobal();

		// console.log('');
	}

	test()
	{
		this.tests.forEach(async test => {
			if (this.testNeedToRunInCurrentPlatform(test) && test.test.skip !== true) {
				await this.reporter.beforeEachIOTest(test);

            	await this.runTest(test);

            	// await this.reporter.afterEachIOTest(test);
        	}
        });

        return this.pass;
	}

	testNeedToRunInCurrentPlatform(test)
	{
		if (! test.test.platform) {
			return true;
		}

		return test.test.platform.includes(process.platform);
	}

	async runTest(testContext)
	{
		let mainTestPassed = null;

		this.currentTestFail = false;

		let childParentMessage = false;

		let testFile = testContext.filename;

		let test = testContext.test;
		test.test = test.test.trim();
		test.perform = test.perform.trim();

		// process.stdout.write(`  ${this.figures.pointer} ${test.test} (${this.chalk.green(testFile.replace(this.root, ''))})`);

		let spawn = require('child_process').spawnSync;

		let cwd = process.cwd();

		if (test.cwd) {
			cwd = this.root + test.cwd.trim();
		}

		// Parse arguments
		let args = test.perform.split(' ');
		let options = {
			cwd,
		};
		let command = args.splice(0, 1)[0];

		if (test.perform.startsWith('src/counsel.js')) {
			args.push('--io-test');
		}

		let counselProcess = spawn(command, args, options);

		// Process IO results
		let result;
		let actual;
		let error;
		let failedAssertions = {};
		let passedAssertions = {};
		let assertionsPassed = true;

		if (counselProcess.stdout) {
			result = counselProcess.stdout.toString();
		}

		if (counselProcess.stderr) {
			error = counselProcess.stderr.toString();
		}

		let data = {};

		// Run IO assertions
	    let counselResults = {
	        status: counselProcess.status,
	        signal: counselProcess.signal,
	    };

		if (result) {
			result = result.split('\n').map(line => {
				// Maybe need to remove the trim() call
				// and don't replace tabs with spaces.
				// Because of manipulating the output.
				return line.trim().replace('\t', ' ');
			});

			let childParentMessageStart = result.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:START');
			let childParentMessageEnd = result.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:END');

			var childParentMessages = result.splice(childParentMessageStart, childParentMessageEnd);
			childParentMessages = childParentMessages.splice(1, childParentMessages.length - 2);

			// Convert raw child messages into an object
			childParentMessages.forEach(rawMessage => {
				let value = rawMessage.split('=');
				data[value[0]] = value[1];
			});

		    for (let item in data) {
		        let itemValue = data[item];
		        let regex = new RegExp(`\{\{${item}\}\}`, 'g');
		        test.expect = test.expect.replace(regex, itemValue);
		    }

		    // main test
		    actual = result.join('\n');

		    Assertions.assertEquals(test.expect, actual);

		    if (actual === test.expect) {
		    	mainTestPassed = true;
		    	// this.reporter.afterEachPassedIOTest(testContext);
		        // console.log(this.chalk.green(` ${this.figures.tick}`));
		    } else {
		    	mainTestPassed = false;
		    	// this.reporter.afterEachFailedIOTest(testContext, actual);
		    	// this.markFailure();

		     //    console.log(this.chalk.red(` ${this.figures.cross}`));
		     //    console.log('');

		     //    console.log(`--- Expected\n${test.expect.split(' ').join(this.chalk.bold.red('.'))}\n+++ Actual\n${actual.split(' ').join(this.chalk.bold.red('.'))}`);

		     //    console.log(this.chalk.yellow('  Difference'));
		     //    diff(actual, test.expect);
		    }
		} else {
			mainTestPassed = false;
			// this.reporter.afterEachFailedIOTest(testContext, null);
			// this.markFailure();

			// console.log(this.chalk.red(` ${this.figures.cross}`));
			// console.log(this.chalk.red(`  No result received from command "${test.perform}"`));

			// console.log(this.chalk.yellow('  Command'));
			// dump(command);
			// console.log(this.chalk.yellow('  Arguments'));
			// dump(args);
			// console.log(this.chalk.yellow('  Options'));
			// dump(options);
		}

	    if (Object.keys(test.assertions).length && mainTestPassed) {
		    // console.log(this.chalk.yellow('  Assertions'));

		    for (let assertion in test.assertions) {
		        // process.stdout.write(`  - ${assertion}`);

		        Assertions.assertEquals(counselResults[assertion], test.assertions[assertion]);

		        if (test.assertions[assertion] === counselResults[assertion]) {
		        	passedAssertions[assertion] = {
		        		actual: counselResults[assertion],
		        	};
		            // console.log(this.chalk.green(` ${this.figures.tick}`));
		        } else {
		        	assertionsPassed = false;
		            let assertionExpected = test.assertions[assertion];
		            let assertionActual = counselResults[assertion];

		        	failedAssertions[assertion] = {
		        		actual: assertionActual,
		        		expected: assertionExpected,
		        	};
					// this.markFailure();

		   			// console.log(this.chalk.red(` ${this.figures.cross}`));

		            // console.log(`    --- Expected`);
		            // dump(expected);
		            // console.log(`    +++ Actual`);
		            // dump(actual);
		        }
		    }
		}

	  //   if (this.currentTestFail) {
	  //   	console.log(this.chalk.yellow('  Command'));
			// dump(command);
			// console.log(this.chalk.yellow('  Arguments'));
			// dump(args);
			// console.log(this.chalk.yellow('  Options'));
			// dump(options);
	  //   }

	  	if (mainTestPassed && assertionsPassed) {
	  		this.reporter.afterEachPassedIOTest(testContext, passedAssertions);
	  		this.reporter.afterEachIOTest(testContext, testContext.test.expect, true, {}, passedAssertions);
	  	} else {
	  		this.reporter.afterEachFailedIOTest(testContext, actual, mainTestPassed, failedAssertions, passedAssertions);
	  		this.reporter.afterEachIOTest(testContext, actual, mainTestPassed, failedAssertions, passedAssertions);
	  	}

	}

	markFailure()
	{
		this.pass = false;
		this.fail = true;

		this.currentTestFail = true;
	}
}
