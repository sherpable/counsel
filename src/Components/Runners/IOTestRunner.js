module.exports = class IOTestRunner
{
    /**
     * Create a new IOTestRunner instance.
     * 
     * @constructor
     * 
     * @param  {array}     tests
     * @param  {Reporter}  reporter
     */
	constructor(tests, reporter)
	{
		this.tests = tests;
		this.reporter = reporter;

		this.pass = true;
		this.fail = false;

		this.yaml = require('js-yaml');
		this.chalk = require('chalk');
		this.figures = require('figures');
		this.path = require('path');
	}

    /**
     * Execute all IO tests.
     * 
     * @return {void}
     */
	async test()
	{
		for (let ioTestIndex in this.tests) {
			let ioTest = this.tests[ioTestIndex];

			if (ioTest.needToRun()) {
				await this.reporter.beforeEachIOTest(ioTest);

				// Resolve it in the IOTest itself
				ioTest.reporter = this.reporter;
            	await ioTest.run();
        	} else {
        		await this.reporter.beforeEachIOTest(ioTest);

        		// Nicer to implement like this:
        		// throw new TestSkippedError('IO test is skipped.');
				// Instead of this:
				ioTest.message = 'IO test is skipped.';
        		this.reporter.afterEachSkippedTest(ioTest);

        		this.reporter.afterEachIOTest(ioTest);
        	}
		}
	}
}
