module.exports = class Reporter
{
    /**
     * Create a new Reporter instance.
     * 
     * @constructor
     */
    constructor()
    {
        this.ansiStyles = require('ansi-styles');
        this.formatTime = require('pretty-ms');
        this.concordance = require('concordance');
        this.highlight = require('cli-highlight').highlight;
        this.prettier = require('prettier');
        this.isHtml = require('is-html');

        if (counsel().isIOTestProcess) {
            this.forceColor = new (counsel().serviceProviders.chalk).constructor({enabled: false, level: 0});
        } else {
            this.forceColor = new (counsel().serviceProviders.chalk).constructor({enabled: true});
        }

        this.theme = require('./Themes/Default')(counsel().serviceProviders.chalk, this.forceColor);

        this.silent = false;
        this.output = '';

        this.reporterDate = Date;

        this.results = {};
        this.passesResults = {};
        this.failuresResults = {};
        this.errorContent = '';

        this.incompleteTests = {};
        this.skippedTests = {};


        this.testsCount = 0;
        this.testFailures = {};
        this.testsPassesCount = 0;
        this.testsFailuresCount = 0;
        this.testsIncompleteCount = 0;
        this.testsSkippedCount = 0;

        this.totalTests = 0;

        this.assertionsCount = 0;
        this.assertionsPassesCount = 0;
        this.assertionsFailuresCount = 0;

        this.startTime = null;
        this.endTime = null;
        this.executionTime = null;
        this.executionTimeFormatted = null;

        this.progress = 0;

        this.indentation = 1;
    }

    /**
     * Retrieve the test results.
     * 
     * @return {object}
     */
    testResults()
    {
        return {
            testsCount: this.testsCount,
            testsPassesCount: this.testsPassesCount,
            testsFailuresCount: this.testsFailuresCount,
            testsIncompleteCount: this.testsIncompleteCount,
            testsSkippedCount: this.testsSkippedCount,

            assertionsCount: this.assertionsCount,
            assertionsPassesCount: this.assertionsPassesCount,
            assertionsFailuresCount: this.assertionsFailuresCount,

            progress: this.progress,
        }
    }

    /**
     * Before the application will be booted.
     * 
     * @return {void}
     */
    beforeBoot()
    {

    }

    /**
     * After the application is be booted.
     * 
     * @return {void}
     */
    afterBoot()
    {

    }

    /**
     * Before the tests will be triggered.
     * 
     * @return {void}
     */
    beforeTest()
    {
        this.startTime = new this.reporterDate();
    }

    /**
     * After the tests have been triggered.
     * 
     * @return {void}
     */
    afterTest()
    {
        if (this.assertionsCount == 0 && this.testsCount == 0) {
            this.log(this.forceColor.yellow(`No tests executed.`));
            return;
        }

        this.endTime = new this.reporterDate();
        this.executionTime = this.endTime - this.startTime;
        this.executionTimeFormatted = this.formatTime(this.executionTime);

        counsel().reportToParentProcess({
            root: counsel().root,
            version: counsel().version,
            executionTimeFormatted: this.executionTimeFormatted,
            executionTime: this.executionTime,
            ...this.testResults(),
        });

        this.appendLog('\n');

        if (this.assertionsFailuresCount > 0) {
            this.log(this.errorContent);
        }

        // let memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        // this.log(this.forceColor.dim(`Time: ${this.executionTimeFormatted}, Memory: ${memoryUsage.toFixed(2)}MB`));
        this.log(this.forceColor.dim(`Time: ${this.executionTimeFormatted}`));
        this.appendLog('\n');

        if (this.assertionsPassesCount > 0) {
            this.log(this.forceColor.green(`${this.assertionsPassesCount} passed, ${this.testsPassesCount} tests`));
        }

        if (this.assertionsFailuresCount > 0) {
            this.log(this.forceColor.red(`${this.assertionsFailuresCount} failed, ${this.testsFailuresCount} tests`));
        }

        if (this.testsIncompleteCount > 0 || this.testsSkippedCount > 0) {
            let incompleteTestsOverview = '';
            let skippedTestsOverview = '';

            let warningMessage = '';

            if (this.assertionsFailuresCount == 0) {
                warningMessage += this.forceColor.yellow(`OK, but `);
            }

            if (this.testsIncompleteCount > 0) {
                warningMessage += this.forceColor.yellow(`${this.testsIncompleteCount} incomplete`);

                if (counsel().arguments.verbose) {
                    for (let incompleteTest in this.incompleteTests) {
                        incompleteTestsOverview += '\n';
                        incompleteTestsOverview += incompleteTest;
                        incompleteTestsOverview += '\n';
                        incompleteTestsOverview += this.forceColor.dim(this.incompleteTests[incompleteTest]);
                    }
                }
            }

            if (this.testsSkippedCount > 0) {
                if (this.testsIncompleteCount > 0) {
                    warningMessage += this.forceColor.yellow(`, `);
                }

                warningMessage += this.forceColor.yellow(`${this.testsSkippedCount} skipped`);

                if (counsel().arguments.verbose) {
                    for (let skippedTest in this.skippedTests) {
                        skippedTestsOverview += '\n';
                        skippedTestsOverview += skippedTest;
                        skippedTestsOverview += '\n';
                        skippedTestsOverview += this.forceColor.dim(this.skippedTests[skippedTest]);
                    }
                }
            }

            this.log(warningMessage);

            this.log(incompleteTestsOverview);

            this.log(skippedTestsOverview);

            this.log('');
        }
    }

    /**
     * Before the IO tests will be triggered.
     * 
     * @return {void}
     */
    beforeIOTest()
    {

    }

    /**
     * After the IO tests have been triggered.
     * 
     * @return {void}
     */
    afterIOTest()
    {

    }

    /**
     * Before each IO test will be triggered.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    beforeEachIOTest(ioTest)
    {

    }

    /**
     * After each IO test have been triggered.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    afterEachIOTest(ioTest)
    {
        this.testsCount++;
    }

    /**
     * After each failed IO test.
     * @param  {IOTest}  ioTest
     * 
     * @return {void}
     */
    afterEachFailedIOTest(ioTest)
    {
        this.testsFailuresCount++;
    }

    /**
     * After each passed IO test.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    afterEachPassedIOTest(ioTest)
    {
        this.testsPassesCount++;
    }

    /**
     * After each incomplete test.
     * 
     * @param  {IOTest|Test}  test
     * @return {void}
     */
    afterEachIncompleteTest(test)
    {
        this.testsIncompleteCount++;

        if (test.className && test.functionName) {
            this.incompleteTests[`${test.className}->${test.functionName}`] = test.message;
        } else {
            this.incompleteTests[`${test.className}`] = test.message;
        }
    }

    /**
     * After each skipped test.
     * 
     * @param  {IOTest|Test}  test
     * @return {void}
     */
    afterEachSkippedTest(test)
    {
        this.testsSkippedCount++;

        if (test.className && test.functionName) {
            this.skippedTests[`${test.className}->${test.functionName}`] = test.message;
        } else {
            this.skippedTests[`${test.className}`] = test.message;
        }
    }

    /**
     * After each IO test without results.
     * 
     * @param  {IOTest}  test
     * @return {void}
     */
    afterEachIOTestWithoutResults(ioTest)
    {

    }

    /**
     * Before each test class will be triggered.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    beforeEachTestClass(testClass)
    {
        if (! this.testFailures[testClass.filePath]) {
            this.testFailures[testClass.filePath] = {};
            this.testFailures[testClass.filePath]['functions'] = [];
        }

        if (! this.testFailures[testClass.filePath]['count']) {
            this.testFailures[testClass.filePath]['count'] = 0;
        }
    }

    /**
     * After each test class have been triggered.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    afterEachTestClass(testClass)
    {

    }

    /**
     * After each failed test class.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    afterEachFailedTestClass(testClass)
    {

    }

    /**
     * After each passed test class.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    afterEachPassedTestClass(testClass)
    {

    }

    /**
     * Before each test will be triggered.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    beforeEachTest(test)
    {
        if (! this.testFailures[test.className]) {
            this.testFailures[test.className] = {};
            this.testFailures[test.className]['functions'] = [];
        }

        if (! this.testFailures[test.className]['count']) {
            this.testFailures[test.className]['count'] = 0;
        }

        if (! this.testFailures[test.className]['functions'][test.functionName]) {
            this.testFailures[test.className]['functions'][test.functionName] = []
            this.testFailures[test.className]['functions'][test.functionName]['count'] = 0;
        }
    }

    /**
     * After each test have been triggered.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachTest(test)
    {
        this.testsCount++;

        if (! this.fullRun) {
            return;
        }

        this.progress = Math.round((this.testsCount / this.totalTests) * 100);
    }

    /**
     * After each failed test.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachFailedTest(test)
    {
        this.testsFailuresCount++;
    }

    /**
     * After each passed test.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachPassedTest(test)
    {
        this.testsPassesCount++;
    }

    /**
     * Before each assertion will be triggered.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    beforeEachAssertion(assertion)
    {
        if (! this.testFailures[assertion.test.file]) {
            this.testFailures[assertion.test.file] = {};
            this.testFailures[assertion.test.file]['functions'] = [];
        }

        if (! this.testFailures[assertion.test.file]['count']) {
            this.testFailures[assertion.test.file]['count'] = 0;
        }

        if (! this.testFailures[assertion.test.file]['functions'][assertion.test.function]) {
            this.testFailures[assertion.test.file]['functions'][assertion.test.function] = []
            this.testFailures[assertion.test.file]['functions'][assertion.test.function]['count'] = 0;
        }
    }

    /**
     * After each assertion have been triggered.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachAssertion(assertion)
    {
        this.assertionsCount++;

        if (! this.testFailures[assertion.test.file]) {
            this.testFailures[assertion.test.file] = 0;
        }

        if (! this.results[assertion.test.file]) {
            this.results[assertion.test.file] = {};
        }

        if (! this.results[assertion.test.file][assertion.test.function]) {
            this.results[assertion.test.file][assertion.test.function] = {};
        }

        let assertionsCount = Object.keys(this.results[assertion.test.file][assertion.test.function]).length;

        this.results[assertion.test.file][assertion.test.function][assertionsCount] = assertion;
    }

    /**
     * After each failed assertion.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachFailedAssertion(assertion)
    {
        let name;
        let errorLocation;
        let additionalInformation = '';

        if (! this.testFailures[assertion.test.file]) {
            this.testFailures[assertion.test.file] = {};
            this.testFailures[assertion.test.file]['functions'] = [];
        }

        this.testFailures[assertion.test.file]['count']++;
        this.testFailures[assertion.test.file]['functions'][assertion.test.function]['count']++;

        this.assertionsFailuresCount++;

        if (assertion.test.io) {
            name = `${assertion.test.name} -> ${assertion.test.function}`;
            errorLocation = assertion.test.file;

            additionalInformation += this.forceColor.yellow('Command');
            additionalInformation += '\n';
            additionalInformation += this.beautify(assertion.test.executeInformation.command);
            additionalInformation += '\n';
            additionalInformation += this.forceColor.yellow('Arguments');
            additionalInformation += '\n';
            additionalInformation += this.beautify(assertion.test.executeInformation.args);
            additionalInformation += '\n';
            additionalInformation += this.forceColor.yellow('Options');
            additionalInformation += '\n';
            additionalInformation += this.beautify(assertion.test.executeInformation.options);
        } else {
            name = `${assertion.test.file} -> ${assertion.test.function}`;
            errorLocation = `${assertion.error.fileName}:${assertion.error.lineNumber}`;
        }

        if (this.assertionsFailuresCount > 1) {
            this.errorContent += '\n';
        }

        this.errorContent += this.forceColor.red('x') + this.forceColor.white(` ${this.assertionsFailuresCount}) ${name}`);
        this.errorContent += '\n';
        this.errorContent += this.forceColor.dim(`${errorLocation}`);
        if (additionalInformation) {
            this.errorContent += '\n';
            this.errorContent += additionalInformation;
        }
        this.errorContent += '\n';
        this.errorContent += '\n';
        this.errorContent += this.visualError(assertion);
        this.errorContent += '\n\n';
        this.errorContent += assertion.getFailureMessage();
        this.errorContent += '\n';
    }

    /**
     * After each passed assertion.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachPassedAssertion(assertion)
    {
        this.assertionsPassesCount++;
    }

    /**
     * Log something to the stdout stream with an ending line break.
     * 
     * @param  {string}  message
     * @return {void}
     */
    log(message = '')
    {
        if (! message || message == '' || message == '\n') {
            this.output += '\n';
        } else {
            message = this.indent(message) + '\n';
        }

        this.output += message;

        if (this.silent) {
            return;
        }

        process.stdout.write(message);
    }

    /**
     * Log something to the stdout stream and append it to the current steam.
     * 
     * @param  {string}  message
     * @return {void}
     */
    appendLog(message)
    {
        this.output += message;

        if (this.silent) {
            return;
        }

        process.stdout.write(message);
    }

    /**
     * Add indentation to the given message with an ending line break.
     * 
     * @param  {string}   message
     * @param  {int}      level
     * @param  {boolean}  append
     * @return {string}
     */
    indent(message, level = 1, append = false)
    {
        if (message == '\n' || message == '' || ! message) {
            return '\n';
        }

        let levelSpaces = this.indentation * level;
        let spaces = levelSpaces;

        let output = [];

        let lineCounter = 0;

        if (typeof message != 'object') {
            message = message.split('\n');
        }

        message.forEach(line => {
            if (lineCounter == 0 && level > 1) {
                spaces = levelSpaces / 2;
            } else {
                spaces = levelSpaces;
            }

            lineCounter++;

            let lineBreak = '';
            if (! append) {
                lineBreak = '\n';
            }

            output.push(`${this.addIndentation(spaces)}${line}`);
        });

        return output.join('\n');
    }

    /**
     * Add indentation to the given message without an ending line break.
     * 
     * @param  {string}   message
     * @param  {int}      level
     * @param  {boolean}  append
     * @return {string}
     */
    indentAppend(message, level = 1)
    {
        return this.indent(message, level, true);
    }

    /**
     * Retrieve only the indentation. When no number of space is given
     * it will use the property indentation to calculate the amount.
     * 
     * @param  {int}     spaces
     * @return {string}
     */
    addIndentation(spaces = undefined)
    {
        if (spaces === undefined) {
            spaces = this.indentation;
        }

        return `${' '.repeat(spaces)}`;
    }

    /**
     * Visualize the difference between the actual and expected value.
     * 
     * @param  {mixed}  actual
     * @param  {mixed}  expected
     * @return {string}
     */
    visualDifference(actual, expected)
    {
        if (this.isHtml(actual)) {
            actual = this.prettier.format(actual);
            actual = actual.replace(/{" "}/g, '');
            actual = actual.substring(0, actual.length - 2);
            actual = this.highlight(actual, {language: 'html', ignoreIllegals: true, theme: this.theme.htmlDumpTheme});
        }

        if (this.isHtml(expected)) {
            expected = this.prettier.format(expected);
            expected = expected.replace(/{" "}/g, '');
            expected = expected.substring(0, expected.length - 2);
            expected = this.highlight(expected, {language: 'html', ignoreIllegals: true, theme: this.theme.htmlDumpTheme});
        }

        return this.indent(
            this.concordance.diff(actual, expected, {plugins: [], theme: this.theme.dumpTheme}), 2
        );
    }

    /**
     * Beautify the given value.
     * 
     * @param  {mixed}  value
     * @return {string}
     */
    beautify(value)
    {
        if (this.isHtml(value)) {
            value = this.prettier.format(value);
            value = value.replace(/{" "}/g, '');
            value = value.substring(0, value.length - 2);
            value = this.highlight(value, {language: 'html', ignoreIllegals: true, theme: this.theme.htmlDumpTheme});

            return this.indent(value);
        }

        let options = {};

        if (! this.silent) {
            options = {plugins: [], theme: this.theme.dumpTheme};
        }

        let formatted = this.concordance.format(value, options);

        if (typeof value == 'object') {
            if (value.constructor == Array) {
                formatted = this.forceColor.magenta('Array ') + formatted;
            }

            if (value.constructor == Object) {
                formatted = this.forceColor.magenta('Object ') + formatted;
            }
        }

        return this.indent(formatted);
    }

    /**
     * Visualize the error from the given assertion.
     * 
     * @param  {object}  assertion
     * @return {string}
     */
    visualError(assertion)
    {
        if (! assertion.error.fileName) {
            return '';
        }

        const codeExcerpt = require('code-excerpt');
        const equalLength = require('equal-length');
        const truncate = require('cli-truncate');
        const indentString = require('indent-string');
        const formatLineNumber = (lineNumber, maxLineNumber) =>
        ' '.repeat(Math.max(0, String(maxLineNumber).length - String(lineNumber).length)) + lineNumber;

        const maxWidth = 80;

        let fileName = assertion.error.fileName;
        let lineNumber = assertion.error.lineNumber;

        let sourceInput = {};
        sourceInput.file = fileName;
        sourceInput.line = lineNumber;
        sourceInput.isDependency = false;
        sourceInput.isWithinProject = true;

        let contents = counsel().serviceProviders.fs.readFileSync(sourceInput.file, 'utf8');
        const excerpt = codeExcerpt(contents, sourceInput.line, { around: 1 });

        if (!excerpt) {
            return null;
        }

        const file = sourceInput.file;
        const line = sourceInput.line;

        const lines = excerpt.map(item => ({
            line: item.line,
            value: item.value,
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

                const lineNumber = formatLineNumber(item.line, line) + '|';
                const coloredLineNumber = isErrorSource ? lineNumber : this.forceColor.dim(lineNumber);
                const result = this.indentAppend(`${coloredLineNumber} ${item.value}`);

                return isErrorSource ? this.forceColor.bgRed(result) : result;
            })
            .join('\n');

        return errorContent;
    }
}
