import { Reporter as ReporterContract } from '../Contracts/Reporters/Reporter';
import { Assertions as AssertionsContract } from '../Contracts/Assertions/Assertions';

export class Assertions implements AssertionsContract
{
	protected reporter: ReporterContract = null;

	protected test: any = null;

	protected assertions: object = null;

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

	execute(type, parameters)
	{
		let assertion = new (this.assertionClass(type))(
			type,
			parameters,
			this.test,
			this.reporter
		);

		this.reporter.beforeEachAssertion(assertion);

		assertion.execute();

	    this.reporter.afterEachAssertion(assertion);

	    if (assertion.passed()) {
	    	this.reporter.afterEachPassedAssertion(assertion);
	    } else {
	    	this.reporter.afterEachFailedAssertion(assertion);
	    }

	    return assertion;
	}

	pipe(assertion, parameters)
	{
	    return this.assertions[assertion](...parameters);
	}

	executeAssertion(type, parameters)
	{
		return this.assertions[type](...parameters);
	}

	assertionClass(type)
	{
		let assertionFileName = type.charAt(0).toUpperCase() + type.substr(1);
		
		let rootFolder = counsel.serviceProviders.path.normalize(
		    process.cwd() + '/'
		);

		let assertionFileLocation = `${rootFolder}src/assertions/results/${assertionFileName}.js`;

		if (counsel.serviceProviders.fs.existsSync(assertionFileLocation)) {
			return require(assertionFileLocation);
		} else {
			return Assertion;
		}
	}
}
