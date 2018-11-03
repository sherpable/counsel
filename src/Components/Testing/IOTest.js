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
		this.failedAssertions = {};
		this.passedAssertions = {};
		this.assertionsPassed = null;
		this.assertionsResult = {};
		
		this.process = {
			command: null,
			arguments: [],
			options: {},
		};
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

	parseCommand()
	{
		this.process.command = this.process.arguments.splice(0, 1)[0];
	}

	parseArguments()
	{
		this.process.arguments = this.perform.split(' ');
	}

	parseOptions()
	{
		let cwd = process.cwd();

		if (this.cwd) {
			cwd = this.root + this.cwd.trim();
		}

		this.process.options.cwd = cwd;


		let options = {
			cwd,
		};

		if (process.platform == 'win32') {
			this.process.options.shell = true;
		}
	}

	parseProcess()
	{
		this.parseOptions();
		this.parseArguments();
		this.parseCommand();


		if (this.process.command.startsWith('src/counsel.js') && this.process.arguments.includes('--as-io-test')) {
			this.process.arguments.push('--io-test-filename');
			this.process.arguments.push(this.filename);
		}

		if (this.process.command.endsWith('.js') && process.platform == 'win32') {
			this.process.command = 'node ' + this.process.command;
		}

		return this.process;
	}
	
	executeProcess()
	{
		let spawn = require('child_process').spawnSync;

		return spawn(
			this.process.command,
			this.process.arguments,
			this.process.options
		);
	}
	
	parseExecutedProcess(ioProcess)
	{
		if (ioProcess.stdout) {
			this.process.output = ioProcess.stdout.toString();
			this.process.rawOutput = this.process.output;
			
			if (this.process.output.trim()) {
				this.process.hasOutput = true;
			}
		}

		if (ioProcess.stderr) {
			this.process.error = ioProcess.stderr.toString();
		}
		
		this.process.status = ioProcess.status;
		this.process.signal = ioProcess.signal;
		
		this.assertionsResult.status = this.process.status;
		this.assertionsResult.signal = this.process.signal;
	}
	
    /**
     * Execute the IO test.
     * 
     * @return {void}
     */
	run()
	{
		this.parseProcess();

		let ioProcess = this.executeProcess();
		
		this.parseExecutedProcess(ioProcess);

		this.assertionsPassed = true;

		let data = {};

		if (this.process.hasOutput) {
			this.process.output = this.process.output.split('\n').map(line => {
				// Maybe need to remove the trim() call
				// and don't replace tabs with spaces.
				// Because of manipulating the output.
				return line.trim().replace('\t', ' ');
			});

			let childParentMessageStart = this.process.output.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:START');
			let childParentMessageEnd = this.process.output.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:END');

			var childParentMessages = this.process.output.splice(childParentMessageStart, childParentMessageEnd - 2);
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
		        this.assertionsResult[item] = (parseInt(itemValue) === NaN)
		        	? itemValue
		        	: parseInt(itemValue);

		        // Replace directory seperator '/' with '\' when running in Windows
		        if (process.platform == 'win32' && this.expect.includes('{{root}}')) {
			        let pathRegex = new RegExp('{{root}}*.*', 'g');
			        let paths = this.expect.match(pathRegex);
			        paths.forEach(path => {
			        	let replaceDirectorySeperatorRegex = new RegExp('/', 'g');
			        	let windowsPath = path.replace(replaceDirectorySeperatorRegex, '\\');
			        	this.expect = this.expect.replace(path, windowsPath);
			        });
		    	}

		        let regex = new RegExp(`\{\{${item}\}\}`, 'g');
		        this.expect = this.expect.replace(regex, itemValue);
		    }

		    // Main test
		    this.actual = this.process.output.join('\n');

		    Assertions.setTest({ name: this.name, file: this.filename, function: 'main test', io: true, executeInformation: this.process });
		    this.expect = this.expect.trim();
		    this.actual = this.actual.trim();
		    Assertions.assertEquals(this.expect, this.actual);

		    if (this.actual === this.expect) {
		    	this.mainTestPassed = true;
		    } else {
		    	this.mainTestPassed = false;
		    }
		} else {
			Assertions.setTest({ name: this.name, file: this.filename, function: 'main test', io: true, executeInformation: this.process });

			if (this.expect == 'undefined') {
				this.expect = undefined;
			}

			if (this.actual == undefined) {
				Assertions.fail(
					`No result received from command "${this.perform}".`
				);

				this.reporter.afterEachIOTestWithoutResults(this);

				this.mainTestPassed = false;
			} else {
				Assertions.assertEquals(
					tethist.expect, this.actual
				);

				if (this.expect != this.actual) {
					this.mainTestPassed = false;
				}
			}
		}

	    if (this.process.output && this.assertions && Object.keys(this.assertions).length) {
		    for (let assertion in this.assertions) {
				Assertions.setTest({ name: this.name, file: this.filename, function: `assertion "${assertion}"`, io: true, executeInformation: this.process });
		        Assertions.assertEquals(this.assertions[assertion], this.assertionsResult[assertion]);

		        if (this.assertions[assertion] === this.assertionsResult[assertion]) {
		        	this.passedAssertions[assertion] = {
		        		actual: this.assertionsResult[assertion],
		        	};
		        } else {
		        	this.assertionsPassed = false;
		            let assertionExpected = this.assertions[assertion];
		            let assertionActual = this.assertionsResult[assertion];

		        	this.failedAssertions[assertion] = {
		        		actual: assertionActual,
		        		expected: assertionExpected,
		        	};
		        }
		    }
		}

	  	if (this.mainTestPassed && this.assertionsPassed) {
			this.reporter.afterEachPassedIOTest(this);
			this.reporter.afterEachIOTest(this);
	  	} else {
			this.reporter.afterEachFailedIOTest(this);
			this.reporter.afterEachIOTest(this);
	  	}
	}
}
