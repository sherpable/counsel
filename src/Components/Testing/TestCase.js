module.exports = class TestCase
{
    /**
     * Create a new TestCase instance.
     * 
     * @constructor
     */
	constructor()
	{
		this.vm = null;
		this.test = null;
		this.reporter = null;
		this.firstAssertionHit = true;
		this.assertions = null;

		this.cleanupAfterSingleTestMethod();
	}

    /**
     * Trigger the setUp fixture.
     * 
     * @return {void}
     */
	setUpInternal()
	{
		this.setUp();
	}

    /**
     * Trigger the beforeEach fixture.
     * 
     * @return {void}
     */
	beforeEachInternal()
	{
		this.beforeEach();
	}

    /**
     * Trigger the afterEach fixture.
	 * This will also perform some cleanup.
     * 
     * @return {void}
     */
	afterEachInternal()
	{
		this.cleanupAfterSingleTestMethod();

		this.afterEach();
	}

    /**
     * Trigger the tearDown fixture.
     * 
     * @return {void}
     */
	tearDownInternal()
	{
		this.tearDown();
	}

    /**
     * Blank setUp fixture implementation.
     * 
     * @return {void}
     */
	setUp()
	{

	}

    /**
     * Blank beforeEach fixture implementation.
     * 
     * @return {void}
     */
	beforeEach()
	{

	}

    /**
     * Blank afterEach fixture implementation.
     * 
     * @return {void}
     */
	afterEach()
	{

	}

    /**
     * Blank tearDown fixture implementation.
     * 
     * @return {void}
     */
	tearDown()
	{

	}

    /**
     * Mark a test as passed.
     * 
	 * @param  {string}  message
     * @return {void}
     */
	pass(message)
	{
		this.assertions.pass(message);
	}

    /**
     * Mark a test as failed.
     * 
	 * @param  {string}  message
     * @return {void}
     */
	fail(message)
	{
		this.assertions.fail(message);
	}

    /**
     * Assert that the actual value is equal to true.
     * 
	 * @param  {mixed}   actual
	 * @param  {string}  message
     * @return {void}
     */
	assertTrue(actual, message)
	{
		this.assertions.assertTrue(actual, message);
	}

    /**
     * Assert that the actual value is equal to false.
     * 
	 * @param  {mixed}   actual
	 * @param  {string}  message
     * @return {void}
     */
	assertFalse(actual, message)
	{
		this.assertions.assertFalse(actual, message);
	}

    /**
     * Assert that the expected value is equal to actual value.
     * 
	 * @param  {mixed}   expected
	 * @param  {mixed}   actual
	 * @param  {string}  message
     * @return {void}
     */
	assertEquals(expected, actual, message)
	{
		this.assertions.assertEquals(expected, actual, message);
	}

    /**
     * Assert that the expected value is not equal to actual value.
     * 
	 * @param  {mixed}   expected
	 * @param  {mixed}   actual
	 * @param  {string}  message
     * @return {void}
     */
	assertNotEquals(expected, actual, message)
	{
		this.assertions.assertNotEquals(expected, actual, message);
	}

    /**
     * Assert that the expected count is equal to the count or lenght from the given countable variable.
     * 
	 * @param  {mixed}   expected
	 * @param  {mixed}   countable
	 * @param  {string}  message
     * @return {void}
     */
	assertCount(expected, countable, message)
	{
		this.assertions.assertCount(expected, countable, message);
	}

    /**
     * Assert that the contents will contain the regex.
	 * When the given regex is a string it will be converter into
	 * a RegExp instance with flags 'gim'.
     * 
	 * @param  {string|RegExp}  regex
	 * @param  {string}   		contents
	 * @param  {string}  		message
     * @return {void}
     */
	assertContains(regex, contents, message)
	{
		this.assertions.assertContains(regex, contents, message);
	}

    /**
     * Assert that the contents will not contain the regex.
	 * When the given regex is a string it will be converter into
	 * a RegExp instance with flags 'gim'.
     * 
	 * @param  {string|RegExp}  regex
	 * @param  {string}   		contents
	 * @param  {string}  		message
     * @return {void}
     */
	assertNotContains(regex, contents, message)
	{
		this.assertions.assertNotContains(regex, contents, message);
	}

    /**
     * Expect that the given expection will be thrown.
	 * With the second parameter it is possible to assert against the exception message,
	 * this will check if the exception messages are equal.
     * 
	 * @param  {Error}   exception
	 * @param  {string}  exceptionMessage
	 * @param  {string}  failureMessage
     * @return {void}
     */
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

    /**
     * Expect that the given expection will not be thrown.
	 * With the second parameter it is possible to assert against the exception message,
	 * this will check if the exception messages are not equal.
     * 
	 * @param  {Error}   exception
	 * @param  {string}  exceptionMessage
	 * @param  {string}  failureMessage
     * @return {void}
     */
	notExpectException(exception, failureMessage)
	{
		this.notExpectedException = exception;
		this.notExpectedExceptionFailureMessage = failureMessage;
		this.error = {
			raw: new Error,
			stack: counsel().serviceProviders.stackTrace.get(),
		}
	}

    /**
     * Mark the test as incomplete.
     * 
	 * @param  {string}  message
     * @return {void}
	 * @throws {IncompleteTestError}
     */
	markAsIncomplete(message)
	{
		throw new IncompleteTestError(message);
	}

    /**
     * Mark the test as skipped.
     * 
	 * @param  {string}  message
     * @return {void}
	 * @throws {SkippedTestError}
     */
	markAsSkipped(message)
	{
		throw new SkippedTestError(message);
	}

    /**
     * Execute an IO test.
     * 
	 * @param  {object}  test
     * @return {Reporter}
     */
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
		// When the IOTest will resolve the reporter this line can be removed
        Assertions.setReporter(ioTestReporter);
        let ioTestRunner = new (counsel().resolve('IOTestRunner'))([
			new (counsel().resolve('IOTest'))(ioTest)
		], ioTestReporter);

        ioTestReporter.beforeTest();

        await ioTestRunner.test();

        ioTestReporter.afterTest();

        Assertions.setReporter(parentTestReporter);
        Assertions.setTest(parentTest);

        return ioTestReporter;
	}

    /**
     * Cleanup some instance properties after each single test method.
     * 
     * @return {void}
     */
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
