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

	setUp()
	{

	}

	beforeEach()
	{

	}

	afterEach()
	{
		this.cleanupAfterSingleTestMethod();
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
			stack: counsel.serviceProviders.stackTrace.get(),
		}
	}

	notExpectException(exception, failureMessage)
	{
		this.notExpectedException = exception;
		this.notExpectedExceptionFailureMessage = failureMessage;
		this.error = {
			raw: new Error,
			stack: counsel.serviceProviders.stackTrace.get(),
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

        ioTest.filename = counsel.path(path);
        let ioTestReporter = new (require('./reporters/DotReporter'));
        ioTestReporter.forceColor = new counsel.serviceProviders.chalk.constructor({enabled: false, level: 0});
        ioTestReporter.silent = true;

        let parentTestReporter = Assertions.reporter;
        let parentTest = Assertions.test;
        Assertions.reporter = ioTestReporter;
        let ioTestRunner = new (require('./IOTestRunner'))([ioTest], ioTestReporter);

        ioTestReporter.beforeTest();

        await ioTestRunner.runTest(ioTest);

        ioTestReporter.afterTest();

        Assertions.reporter = parentTestReporter;
        Assertions.test = parentTest;

        return ioTestReporter;
	}

	/* istanbul ignore next */
	visualError(stack = null, name = null)
	{
		const codeExcerpt = require('code-excerpt');
		const equalLength = require('equal-length');
		const truncate = require('cli-truncate');
		const colors = require('ava/lib/colors');
		const indentString = require('indent-string');
		const formatLineNumber = (lineNumber, maxLineNumber) =>
			' '.repeat(Math.max(0, String(maxLineNumber).length - String(lineNumber).length)) + lineNumber;

		const maxWidth = 80;

		let fileName = null;
		let lineNumber = null;

		if (name == null) {
			name = this.name;
		}

		if (stack == null) {
			stack = stackTrace.get();

			let error = stack.filter(stackItem => {
				return stackItem.getFunctionName() == name.split(' -> ')[1];
			}).map(stackItem => {
				return {
					typeName: stackItem.getTypeName(),
					functionName: stackItem.getFunctionName(),
					methodName: stackItem.getMethodName(),
					fileName: stackItem.getFileName(),
					lineNumber: stackItem.getLineNumber(),
					columnNumber: stackItem.getColumnNumber(),
					isNative: stackItem.isNative(),
				};
			});

			if (error && error[0]) {
				fileName = error[0].fileName;
				lineNumber = error[0].lineNumber;
			}
		}

		if (! fileName) {
			return name;
		}

		let rootFolder = process.mainModule.paths[0].split('node_modules')[0].slice(0, -1) + '/';
		let relativeFileName = fileName.replace(rootFolder, '');

		let sourceInput = {};
		sourceInput.file = fileName;
		sourceInput.line = lineNumber;
		sourceInput.isDependency = false;
		sourceInput.isWithinProject = true;

		let contents = fs.readFileSync(sourceInput.file, 'utf8');
		const excerpt = codeExcerpt(contents, sourceInput.line, {maxWidth: process.stdout.columns, around: 1});

		if (! excerpt) {
			return null;
		}

		const file = sourceInput.file;
		const line = sourceInput.line;

		const lines = excerpt.map(item => ({
			line: item.line,
			value: truncate(item.value, maxWidth - String(line).length - 5)
		}));

		const joinedLines = lines.map(line => line.value).join('\n');
		const extendedLines = equalLength(joinedLines).split('\n');

		let errorContent = lines
			.map((item, index) => ({
				line: item.line,
				value: extendedLines[index]
			}))
			.map(item => {
				const isErrorSource = item.line === line;

				const lineNumber = formatLineNumber(item.line, line) + ':';
				const coloredLineNumber = isErrorSource ? lineNumber : chalk.dim(lineNumber);
				const result = `   ${coloredLineNumber} ${item.value}`;

				return isErrorSource ? chalk.bgRed(result) : result;
			})
			.join('\n');

		return name + ' at ' + sourceInput.file + ':' + sourceInput.line;
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
