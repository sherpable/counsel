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
}