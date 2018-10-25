module.exports = class IOTest
{
    /**
     * Create a new IOTest instance.
     * 
     * @constructor
     * 
     * @param  {object}  test
     */
	constructor(test)
	{
		this.test = test;

		// Resolve it
		this.reporter = counsel().reporter;
		
		this.root = counsel().root;

		this.test.test.test = this.test.test.test.trim();
		this.test.test.perform = this.test.test.perform.trim();

		this.filename = this.test.filename;
		this.className = this.filename;
		this.name = this.test.test.test;
		this.functionName = this.name;
		this.perform = this.test.test.perform;
		this.expect = this.test.test.expect;
		this.cwd = this.test.test.cwd;
		this.platform = this.test.test.platform;
		this.skip = this.test.test.skip;
		this.assertions = this.test.test.assertions;

		this.actual = null;
		this.mainTestPassed = null;
		this.failedAssertions = [];
		this.passedAssertions = [];
		this.process = {};
	}

    /**
     * Check if we need to run this IO test.
     * 
     * @return {boolean}
     */
	needToRun()
	{
		return this.needToRunInCurrentPlatform() && this.skip !== true;
	}

    /**
     * Check if we need to run this IO test within the current platform.
     * 
     * @return {boolean}
     */
	needToRunInCurrentPlatform()
	{
		if (! this.platform) {
			return true;
		}

		return this.platform.includes(process.platform);
	}

    /**
     * Execute the IO test.
     * 
     * @return {void}
     */
	async run()
	{
		let mainTestPassed = null;

		this.currentTestFail = false;

		let childParentMessage = false;

		let testFile = this.filename;

		let test = this.test.test;

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

		if (command.startsWith('src/counsel.js') && args.includes('--as-io-test')) {
			args.push('--io-test-filename');
			args.push(this.filename);
		}

		if (command.endsWith('.js') && process.platform == 'win32') {
			command = 'node ' + command;
		}

		if (process.platform == 'win32') {
			options.shell = true;
		}

		let counselProcess = spawn(command, args, options);

		let executeInformation = {command, args, options};

		// Process IO results
		let result = '';
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

	    let cleanResult = result.trim();

		if (cleanResult) {
			result = result.split('\n').map(line => {
				// Maybe need to remove the trim() call
				// and don't replace tabs with spaces.
				// Because of manipulating the output.
				return line.trim().replace('\t', ' ');
			});

			let childParentMessageStart = result.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:START');
			let childParentMessageEnd = result.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:END');

			var childParentMessages = result.splice(childParentMessageStart, childParentMessageEnd - 2);
			childParentMessages = childParentMessages.splice(1, childParentMessages.length - 2); // Remove closing item

			// Convert raw child messages into an object
			childParentMessages.forEach(rawMessage => {
				let value = rawMessage.split('=');
				data[value[0]] = value[1];
			});

		    for (let item in data) {
		        let itemValue = data[item];
		        // Also assign child parent items to the assertions results
		        // so we can assert against the version number for example
		        counselResults[item] = (parseInt(itemValue) === NaN)
		        	? itemValue
		        	: parseInt(itemValue);

		        // Replace directory seperator '/' with '\' when running in Windows
		        if (process.platform == 'win32' && test.expect.includes('{{root}}')) {
			        let pathRegex = new RegExp('{{root}}*.*', 'g');
			        let paths = test.expect.match(pathRegex);
			        paths.forEach(path => {
			        	let replaceDirectorySeperatorRegex = new RegExp('/', 'g');
			        	let windowsPath = path.replace(replaceDirectorySeperatorRegex, '\\');
			        	test.expect = test.expect.replace(path, windowsPath);
			        });
		    	}

		        let regex = new RegExp(`\{\{${item}\}\}`, 'g');
		        test.expect = test.expect.replace(regex, itemValue);
		    }

		    // Main test
		    actual = result.join('\n');

		    Assertions.setTest({ name: test.test, file: testFile, function: 'main test', io: true, executeInformation });
		    test.expect = test.expect.trim();
		    actual = actual.trim();
		    Assertions.assertEquals(test.expect, actual);

		    if (actual === test.expect) {
		    	mainTestPassed = true;
		    } else {
		    	mainTestPassed = false;
		    }
		} else {
			Assertions.setTest({ name: test.test, file: testFile, function: 'main test', io: true, executeInformation });

			if (test.expect == 'undefined') {
				test.expect = undefined;
			}

			if (actual == undefined) {
				Assertions.fail(
					`No result received from command "${test.perform}".`
				);

				this.process = {command, args, options};
				this.reporter.afterEachIOTestWithoutResults(this);

				mainTestPassed = false;
			} else {
				Assertions.assertEquals(
					test.expect, actual
				);

				if (test.expect != actual) {
					mainTestPassed = false;
				}
			}
		}

	    if (result && test.assertions && Object.keys(test.assertions).length) {
		    for (let assertion in test.assertions) {
				Assertions.setTest({ name: test.test, file: testFile, function: `assertion "${assertion}"`, io: true, executeInformation });
		        Assertions.assertEquals(test.assertions[assertion], counselResults[assertion]);

		        if (test.assertions[assertion] === counselResults[assertion]) {
		        	passedAssertions[assertion] = {
		        		actual: counselResults[assertion],
		        	};
		        } else {
		        	assertionsPassed = false;
		            let assertionExpected = test.assertions[assertion];
		            let assertionActual = counselResults[assertion];

		        	failedAssertions[assertion] = {
		        		actual: assertionActual,
		        		expected: assertionExpected,
		        	};
		        }
		    }
		}

		this.actual = actual;
		this.mainTestPassed = mainTestPassed;
		this.failedAssertions = failedAssertions;
		this.passedAssertions = passedAssertions;
		this.process = {command, args, options};


	  	if (mainTestPassed && assertionsPassed) {
	  		this.reporter.afterEachPassedIOTest(this);
	  		this.reporter.afterEachIOTest(this);
	  	} else {
	  		this.reporter.afterEachFailedIOTest(this);
	  		this.reporter.afterEachIOTest(this);
	  	}
	}
}
