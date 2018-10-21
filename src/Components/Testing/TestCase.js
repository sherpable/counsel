module.exports = class TestCase
{
	constructor()
	{
		this.vm = null;
		this.test = null;
		this.reporter = null;
		this.firstAssertionHit = true;
		this.assertions = null;

		this.cleanupAfterSingleTestMethod();
	}

	setUpInternal()
	{
		this.setUp();
	}

	beforeEachInternal()
	{
		this.beforeEach();
	}

	afterEachInternal()
	{
		this.cleanupAfterSingleTestMethod();

		this.afterEach();
	}

	tearDownInternal()
	{
		this.tearDown();
	}

	setUp()
	{

	}

	beforeEach()
	{

	}

	afterEach()
	{

	}

	tearDown()
	{

	}

	pass(message)
	{
		this.assertions.pass(message);
	}

	fail(message)
	{
		this.assertions.fail(message);
	}

	assertTrue(actual, message)
	{
		this.assertions.assertTrue(actual, message);
	}

	assertFalse(actual, message)
	{
		this.assertions.assertFalse(actual, message);
	}

	assertEquals(expected, actual, message)
	{
		this.assertions.assertEquals(expected, actual, message);
	}

	assertNotEquals(expected, actual, message)
	{
		this.assertions.assertNotEquals(expected, actual, message);
	}

	assertCount(expected, countable, message)
	{
		this.assertions.assertCount(expected, countable, message);
	}

	assertContains(regex, contents, message)
	{
		this.assertions.assertContains(regex, contents, message);
	}

	assertNotContains(regex, contents, message)
	{
		this.assertions.assertNotContains(regex, contents, message);
	}

	expectException(exception, exceptionMessage, failureMessage)
	{
		this.expectedException = exception;
		this.expectedExceptionMessage = exceptionMessage;
		this.expectedExceptionFailureMessage = failureMessage;
		this.error = {
			raw: new Error,
			stack: counsel().serviceProviders.stackTrace.get(),
		}
	}

	notExpectException(exception, failureMessage)
	{
		this.notExpectedException = exception;
		this.notExpectedExceptionFailureMessage = failureMessage;
		this.error = {
			raw: new Error,
			stack: counsel().serviceProviders.stackTrace.get(),
		}
	}

	markAsIncomplete(message)
	{
		throw new IncompleteTestError(message);
	}

	markAsSkipped(message)
	{
		throw new SkippedTestError(message);
	}

	async executeIOTest(test)
	{
        let ioTest = {};
        let path = test.path;
        delete test.path;

        ioTest.test = test;

        ioTest.filename = counsel().path(path);
        let ioTestReporter = new (require('../Reporters/DotReporter'));
        ioTestReporter.forceColor = new (counsel().serviceProviders.chalk).constructor({enabled: false, level: 0});
        ioTestReporter.silent = true;

        let parentTestReporter = Assertions.reporter;
        let parentTest = Assertions.test;
        Assertions.setReporter(ioTestReporter);
        let ioTestRunner = new (counsel().resolve('IOTestRunner'))([ioTest], ioTestReporter);

        ioTestReporter.beforeTest();

        await ioTestRunner.runTest(
			new (counsel().resolve('IOTest'))(ioTest)
		);

        ioTestReporter.afterTest();

        Assertions.setReporter(parentTestReporter);
        Assertions.setTest(parentTest);

        return ioTestReporter;
	}

	beforeAssertion()
	{
		this.reporter.beforeEachAssertion(this.test);
	}

	afterAssertion(assertion)
	{
		assertion.file = this.test.file;
		assertion.function = this.test.function;

		this.reporter.afterEachAssertion(assertion);

		if (assertion.pass) {
			this.reporter.afterEachPassedAssertion(assertion);
		} else {
			this.reporter.afterEachFailedAssertion(assertion);
		}
	}

	cleanupAfterSingleTestMethod()
	{
		this.expectedException = null;
		this.expectedExceptionMessage = null;
		this.expectedExceptionFailureMessage = null;
		this.notExpectedException = null;
		this.notExpectedExceptionFailureMessage = null;
		this.error = null;
	}
}
