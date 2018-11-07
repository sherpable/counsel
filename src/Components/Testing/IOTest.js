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

    /**
     * Parse the command who will be executed.
     * 
     * @return {void}
     */
	parseCommand()
	{
		this.process.command = this.process.arguments.splice(0, 1)[0];
	}

    /**
     * Parse the process arguments.
     * 
     * @return {void}
     */
	parseArguments()
	{
		this.process.arguments = this.perform.split(' ');
	}

    /**
     * Parse the process options.
     * 
     * @return {void}
     */
	parseOptions()
	{
		let cwd = process.cwd();

		if (this.cwd) {
			cwd = this.root + this.cwd.trim();
		}

		this.process.options.cwd = cwd;

		if (process.platform == 'win32') {
			this.process.options.shell = true;
		}
	}

    /**
     * Parse the process who will be executed.
     * 
     * @return {object}
     */
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
	
    /**
     * Execute the process.
     * 
     * @return {object}
     */
	executeProcess()
	{
		let spawn = require('child_process').spawnSync;

		return spawn(
			this.process.command,
			this.process.arguments,
			this.process.options
		);
	}
	
    /**
     * Parse the executed process his output.
     * 
     * @param  {object}  ioProcess
	 * @return {void}
     */
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

		if (this.process.hasOutput) {
			this.processOutput();

		}
	}

    /**
     * Process the executed process his output.
     * 
     * @return {void}
     */
	processOutput()
	{
		this.process.output = this.process.output.split('\n').map(line => {
			return line.trim().replace('\t', ' ');
		});

		let processVariables = this.getProcessVariables();

		this.processExpectation(processVariables);

		// Main test
		this.actual = this.process.output.join('\n');
	}

    /**
     * Process the expectation from this test.
	 * This will replace all "placeholders" with
	 * it's actual value from the io process.
     * 
     * @param  {object}  processVariables
	 * @return {void}
     */
	processExpectation(processVariables)
	{
		for (let variable in processVariables) {
			let value = processVariables[variable];
			// Also assign child parent items to the assertions results
			// so we can assert against the version number for example
			this.assertionsResult[variable] = (parseInt(value) === NaN)
				? value
				: parseInt(value);

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

			let regex = new RegExp(`\{\{${variable}\}\}`, 'g');
			this.expect = this.expect.replace(regex, value);
		}
	}

    /**
     * Retrieve the variables who are send-back to the parent process
	 * from within the child (IO) process.
     * 
     * @return {object}
     */
	getProcessVariables()
	{
		let childParentMessageStart = this.process.output.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:START');
		let childParentMessageEnd = this.process.output.indexOf('COUNSEL-CHILD-PARENT-MESSAGE:END');

		let childParentMessages = this.process.output.splice(childParentMessageStart, childParentMessageEnd - 2);
		childParentMessages = childParentMessages.splice(1, childParentMessages.length - 2); // Remove closing item

		let variables = {};

		// Convert raw child messages into an object
		childParentMessages.forEach(rawMessage => {
			let value = rawMessage.split('=');
			variables[value[0]] = value[1];
		});

		return variables;
	}

    /**
     * Run the assertions from this IO test.
     * 
     * @return {void}
     */
	runAssertions()
	{
		this.assertionsPassed = true;

	    if (this.assertions && Object.keys(this.assertions).length) {
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
	}

    /**
     * Run the main test from this IO test.
	 * Basically check if the actual and expected value are equal.
     * 
     * @return {void}
     */
	runMainTest()
	{
		this.expect = this.expect.trim();
		this.actual = this.actual.trim();
		Assertions.assertEquals(this.expect, this.actual);

		if (this.actual === this.expect) {
			this.mainTestPassed = true;
		} else {
			this.mainTestPassed = false;
		}
	}

    /**
     * Notify about an IO test without output.
     * 
     * @return {void}
     */
	notifyAboutNoTestResults()
	{
		Assertions.fail(
			`No result received from command "${this.perform}".`
		);

		this.reporter.afterEachIOTestWithoutResults(this);

		this.mainTestPassed = false;
	}

    /**
     * Process the results from an IO test without output.
     * 
     * @return {void}
     */
	processWithoutTestResults()
	{
		if (this.expect == 'undefined') {
			this.expect = undefined;
		}

		if (this.actual == undefined) {
			this.notifyAboutNoTestResults();
		} else {
			Assertions.assertEquals(
				tethist.expect, this.actual
			);

			if (this.expect != this.actual) {
				this.mainTestPassed = false;
			}
		}
	}

    /**
     * Set the IO test as current test within the Assertions instance.
     * 
     * @return {void}
     */
	setTest()
	{
		Assertions.setTest({ name: this.name, file: this.filename, function: 'main test', io: true, executeInformation: this.process });
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

		this.setTest();

		if (this.process.hasOutput) {
			this.runMainTest();
			
			this.runAssertions();
		} else {
			this.processWithoutTestResults();
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
