counselUse('Assertion');

module.exports = class Assertions
{
    /**
     * Create a new Assertions instance.
     * 
     * @constructor
     * 
     * @param  {Reporter}  reporter
     */
	constructor(reporter)
	{
		this.reporter = reporter;
		this.test = {};

		this.assertions = {
		    pass: (message) =>
		    {
		        return {
		            pass: true,
		            message,
		        };
		    },

		    fail: (message, error = null) =>
		    {
		        return {
		            pass: false,
		            message,
		            error,
		        };
		    },

		    assertTrue: (actual, message, error = null) =>
		    {
		        return {
		            pass: actual == true,
		            message,
		            expected: true,
		            actual,
		            failureMessage: 'Value is not truthy',
		            error,
		        };
		    },

		    assertFalse: (actual, message, error = null) =>
		    {
		        return {
		            pass: actual == false,
		            message,
		            expected: false,
		            actual,
		            failureMessage: 'Value is not falsy',
		            error,
		        };
		    },

		    assertEquals: (expected, actual, message, error = null) =>
		    {
		        return {
		            pass: counsel().serviceProviders.concordance.compare(actual, expected).pass == true,
		            message,
		            expected,
		            actual,
		            error,
		        };
		    },

		    assertNotEquals: (expected, actual, message, error = null) =>
		    {
		        return {
		            pass: counsel().serviceProviders.concordance.compare(actual, expected).pass == false,
		            message,
		            expected,
		            actual,
		            error,
		        };
		    },

		    assertCount: (expected, countable, message, error = null) =>
		    {
		        try {
		            return this.pipe('assertEquals', [expected, Object.keys(countable).length, message, error]);
		        } catch (error) {
		            return this.pipe('fail', [`[${countable}] is not countable.`]);
		        }
		    },

		    assertContains: (regex, contents, message, error = null) =>
		    {
		        if (typeof regex == 'string') {
		            regex = new RegExp(regex, 'gim');
		        }

		        return {
		            pass: regex.test(contents) == true,
		            message,
		            contents,
		            regex,
		            error,
		        };
		    },

		    assertNotContains: (regex, contents, message, error = null) =>
		    {
		        if (typeof regex == 'string') {
		            regex = new RegExp(regex, 'gim');
		        }

		        return {
		            pass: regex.test(contents) == false,
		            message,
		            contents,
		            regex,
		            error,
		        };
		    },
		};
	}

    /**
     * Specify the details from associated test with the current assertions.
     * 
	 * @param  {object}  test
     * @return {void}
     */
	setTest(test)
	{
		this.test = test;
	}

    /**
     * Specify the reporter.
     * 
	 * @param  {Reporter}  reporter
     * @return {void}
     */
	setReporter(reporter)
	{
		this.reporter = reporter;
	}

    /**
     * Create a custom assertion.
     * 
	 * @param  {string}  name
	 * @param  {object}  assertion
     * @return {void}
     */
	macro(name, assertion)
	{
		this.assertions[name] = assertion;
	}

    /**
     * Execute a specific assertion.
     * 
	 * @param  {string}  	type
	 * @param  {array}  	parameters
     * @return {Assertion}
     */
	execute(type, parameters)
	{
		let assertion = new (this.assertionClass(type))(
			type,
			parameters,
			this.test,
			this.reporter
		);

		this.reporter.emit('beforeEachAssertion', [assertion]);

		assertion.execute();

	    this.reporter.emit('afterEachAssertion', [assertion]);

	    if (assertion.passed()) {
	    	this.reporter.emit('afterEachPassedAssertion', [assertion]);
	    } else {
	    	this.reporter.emit('afterEachFailedAssertion', [assertion]);
	    }

	    return assertion;
	}

    /**
     * Useful for calling assertion type from within an other assertion
	 * without reporting the assertions both.
     * 
	 * @param  {string}  	assertion
	 * @param  {array}  	parameters
     * @return {Assertion}
     */
	pipe(assertion, parameters)
	{
	    return this.assertions[assertion](...parameters);
	}

    /**
     * Execute a given assertion.
     * 
	 * @param  {string}  type
	 * @param  {array}   parameters
     * @return {object}
     */
	executeAssertion(type, parameters)
	{
		return this.assertions[type](...parameters);
	}

    /**
     * Retieve the assertion class for a given assertion type.
     * 
	 * @param  {string}  	type
     * @return {Assertion}
     */
	assertionClass(type)
	{
		let assertionFileName = type.charAt(0).toUpperCase() + type.substr(1);

		let rootFolder = counsel().serviceProviders.path.normalize(
		    process.cwd() + '/'
		);

		let assertionFileLocation = `${rootFolder}src/Components/Assertions/Results/${assertionFileName}.js`;

		if (counsel().serviceProviders.fs.existsSync(assertionFileLocation)) {
			return require(assertionFileLocation);
		} else {
			return Assertion;
		}
	}
}
