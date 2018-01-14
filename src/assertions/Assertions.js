module.exports = class Assertions
{
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
		            pass: counsel.serviceProviders.concordance.compare(actual, expected).pass == true,
		            message,
		            expected,
		            actual,
		            error,
		        };
		    },

		    assertNotEquals: (expected, actual, message, error = null) =>
		    {
		        return {
		            pass: counsel.serviceProviders.concordance.compare(actual, expected).pass == false,
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

	macro(name, assertion)
	{
		this.assertions[name] = assertion;
	}

	execute(assertion, parameters)
	{
		this.reporter.beforeEachAssertion(assertion, parameters);

		let assertionResultFileName = assertion.charAt(0).toUpperCase() + assertion.substr(1);
		let assertionResult = null;

		let rootFolder = counsel.serviceProviders.path.normalize(
		    process.cwd() + '/'
		);

		let assertionResultFileLocation = `${rootFolder}src/assertions/results/${assertionResultFileName}Result.js`;

		if (counsel.serviceProviders.fs.existsSync(assertionResultFileLocation)) {
			let assertionClass = require(assertionResultFileLocation);
			assertionResult = new assertionClass(
				assertion,
				this.test,
				this.reporter,
				this.assertions[assertion](...parameters),
			);
		} else {
			assertionResult = new AssertionResult(
				assertion,
				this.test,
				this.reporter,
				this.assertions[assertion](...parameters),
			);
		}

	    this.reporter.afterEachAssertion(assertionResult);

	    if (assertionResult.passed()) {
	    	this.reporter.afterEachPassedAssertion(assertionResult);
	    } else {
	    	this.reporter.afterEachFailedAssertion(assertionResult);
	    }

	    return assertionResult;
	}

	pipe(assertion, parameters)
	{
	    return this.assertions[assertion](...parameters);
	}
}
