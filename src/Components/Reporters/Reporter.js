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
        this.customResults = {};
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

        this.noTestsExecuted = null;
        this.totalTests = 0;

        this.assertionsCount = 0;
        this.assertionsPassesCount = 0;
        this.assertionsFailuresCount = 0;

        this.startTime = null;
        this.endTime = null;
        this.executionTime = null;
        this.formattedExecutionTime = null;

        this.progress = 0;

        this.indentation = 1;

        this.events = this.registerEvents();
    }

    /**
     * Register result data who will be available when in the parent process.
     * 
     * @param  {string}  name
     * @param  {mixed}   value
     * @return {void}
     */
    addResult(name, value)
    {
        this.customResults[name] = value;
    }

    /**
     * Register the events.
     * 
     * @return {void}
     */
    registerEvents()
    {
        return {
            beforeBoot: [
                'beforeBoot',
            ],
            afterBoot: [
                'afterBoot',
            ],
            beforeTest: [
                'recordTestStaringTime',
                'beforeTest',
            ],
            afterTest: [
                'afterTestCalculations',
                'afterTest',
                'reportTestOverview',
                'reportToParentProcess',
            ],
            beforeIOTest: [
                'beforeIOTest',
            ],
            afterIOTest: [
                'afterIOTest',
            ],
            beforeEachIOTest: [
                'beforeEachIOTest',
            ],
            afterEachIOTest: [
                'afterEachIOTestCalculations',
                'afterEachIOTest',
            ],
            afterEachFailedIOTest: [
                'afterEachFailedIOTestCalculations',
                'afterEachFailedIOTest',
            ],
            afterEachPassedIOTest: [
                'afterEachPassedIOTestCalculations',
                'afterEachPassedIOTest',
            ],
            afterEachIncompleteTest: [
                'afterEachIncompleteTestCalculations',
                'afterEachIncompleteTest',
            ],
            afterEachSkippedTest: [
                'afterEachSkippedTestCalculations',
                'afterEachSkippedTest',
            ],
            afterEachIOTestWithoutResults: [
                'afterEachIOTestWithoutResults',
            ],
            beforeEachTestClass: [
                'beforeEachTestClassCalculations',
                'beforeEachTestClass',
            ],
            afterEachTestClass: [
                'afterEachTestClass',
            ],
            afterEachFailedTestClass: [
                'afterEachFailedTestClass',
            ],
            afterEachPassedTestClass: [
                'afterEachPassedTestClass',
            ],
            beforeEachTest: [
                'beforeEachTestCalculations',
                'beforeEachTest',
            ],
            afterEachTest: [
                'afterEachTestCalculations',
                'afterEachTest',
            ],
            afterEachFailedTest: [
                'afterEachFailedTestCalculations',
                'afterEachFailedTest',
            ],
            afterEachPassedTest: [
                'afterEachPassedTestCalculations',
                'afterEachPassedTest',
            ],
            beforeEachAssertion: [
                'beforeEachAssertionCalculations',
                'beforeEachAssertion',
            ],
            afterEachAssertion: [
                'afterEachAssertionCalculations',
                'afterEachAssertion',
            ],
            afterEachFailedAssertion: [
                'afterEachFailedAssertionCalculations',
                'afterEachFailedAssertion',
            ],
            afterEachPassedAssertion: [
                'afterEachPassedAssertionCalculations',
                'afterEachPassedAssertion',
            ],
        };
    }

    /**
     * Emit the given event.
     * 
     * @param  {string}  event
     * @param  {object}  payload
     * @return {void} 
     */
    emit(event, payload = [])
    {
        if (! this.events[event]) {
            console.log('');
            console.error(counsel().serviceProviders.chalk.red(`  ${counsel().serviceProviders.figures.cross} event [${event}] don't exists on the Reporter class.`));
        }

        this.events[event].forEach(functionName => {
            this[functionName](...payload);
        });
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
            ...this.customResults,
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
     * Record that starting time before the tests will be triggered.
     * 
     * @return {void}
     */
    recordTestStaringTime()
    {
        this.startTime = new this.reporterDate();
    }

    /**
     * Before the tests will be triggered.
     * 
     * @return {void}
     */
    beforeTest()
    {
        
    }

    /**
     * Perform the necessary calculations after all tests have been executed.
     * 
     * @return {void}
     */
    afterTestCalculations()
    {
        if (this.assertionsCount == 0 && this.testsCount == 0) {
            this.noTestsExecuted = true;
            return;
        }
        
        this.noTestsExecuted = false;

        this.endTime = new this.reporterDate();
        this.executionTime = this.endTime - this.startTime;
        this.formattedExecutionTime = this.formatTime(this.executionTime);
    }

    /**
     * After the tests have been triggered.
     * 
     * @return {void}
     */
    afterTest()
    {

    }

    /**
     * Report the test overview results.
     * 
     * @return {void}
     */
    reportTestOverview()
    {
        if (this.noTestsExecuted) {
            this.log(this.forceColor.yellow(`No tests executed.`));
            return;
        }

        this.appendLog('\n');

        if (this.assertionsFailuresCount > 0) {
            this.log(this.errorContent);
        }

        this.log(this.forceColor.dim(`Time: ${this.formattedExecutionTime}`));
        this.appendLog('\n');

        if (this.assertionsPassesCount > 0) {
            this.log(this.forceColor.green(`${this.assertionsPassesCount} passed, ${this.testsPassesCount} tests`));
        }

        if (this.assertionsFailuresCount > 0) {
            this.log(this.forceColor.red(`${this.assertionsFailuresCount} failed, ${this.testsFailuresCount} tests`));
        }

        if (this.testsIncompleteCount > 0 || this.testsSkippedCount > 0) {
            this.reportAboutIncompleteAndSkippedTests();
        }
    }

    /**
     * Report variables from the child process back to the parent process.
     * 
     * @return {void}
     */
    reportToParentProcess()
    {
        counsel().reportToParentProcess({
            root: counsel().root,
            version: counsel().version,
            formattedExecutionTime: this.formattedExecutionTime,
            executionTime: this.executionTime,
            ...this.testResults(),
        });
    }

    /**
     * Report about incomplete and skipped test results.
     * 
     * @return {void}
     */
    reportAboutIncompleteAndSkippedTests()
    {
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
     * Perform the necessary calculations after each IO test have been triggered.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    afterEachIOTestCalculations(ioTest)
    {
        this.testsCount++;
    }

    /**
     * After each IO test have been triggered.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    afterEachIOTest(ioTest)
    {
        
    }

    /**
     *  Perform the necessary calculations after each failed IO test.
     * @param  {IOTest}  ioTest
     * 
     * @return {void}
     */
    afterEachFailedIOTestCalculations(ioTest)
    {
        this.testsFailuresCount++;
    }

    /**
     * After each failed IO test.
     * @param  {IOTest}  ioTest
     * 
     * @return {void}
     */
    afterEachFailedIOTest(ioTest)
    {
        
    }

    /**
     * Perform the necessary calculations after each passed IO test.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    afterEachPassedIOTestCalculations(ioTest)
    {
        this.testsPassesCount++;
    }

    /**
     * After each passed IO test.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    afterEachPassedIOTest(ioTest)
    {
        
    }

    /**
     * Perform the necessary calculations after each incomplete test.
     * 
     * @param  {IOTest|Test}  test
     * @return {void}
     */
    afterEachIncompleteTestCalculations(test)
    {
        this.testsIncompleteCount++;

        if (test.className && test.functionName) {
            this.incompleteTests[`${test.className}->${test.functionName}`] = test.message;
        } else {
            this.incompleteTests[`${test.className}`] = test.message;
        }
    }

    /**
     * After each incomplete test.
     * 
     * @param  {IOTest|Test}  test
     * @return {void}
     */
    afterEachIncompleteTest(test)
    {
        
    }

    /**
     * Perform the necessary calculations after each skipped test.
     * 
     * @param  {IOTest|Test}  test
     * @return {void}
     */
    afterEachSkippedTestCalculations(test)
    {
        this.testsSkippedCount++;

        if (test.className && test.functionName) {
            this.skippedTests[`${test.className}->${test.functionName}`] = test.message;
        } else {
            this.skippedTests[`${test.className}`] = test.message;
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
     * Perform the necessary calculations before each test class will be triggered.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    beforeEachTestClassCalculations(testClass)
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
     * Before each test class will be triggered.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    beforeEachTestClass(testClass)
    {
        
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
     * Perform the necessary calculations before each test will be triggered.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    beforeEachTestCalculations(test)
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
     * Before each test will be triggered.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    beforeEachTest(test)
    {
        
    }

    /**
     * Perform the necessary calculations after each test have been triggered.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachTestCalculations(test)
    {
        this.testsCount++;

        if (! this.fullRun) {
            return;
        }

        this.progress = Math.round((this.testsCount / this.totalTests) * 100);
    }

    /**
     * After each test have been triggered.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachTest(test)
    {
        
    }

    /**
     * Perform the necessary calculations after each failed test.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachFailedTestCalculations(test)
    {
        this.testsFailuresCount++;
    }

    /**
     * After each failed test.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachFailedTest(test)
    {
        
    }

    /**
     * After each passed test.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachPassedTestCalculations(test)
    {
        this.testsPassesCount++;
    }

    /**
     * After each passed test.
     * 
     * @param  {Test}  test
     * @return {void}
     */
    afterEachPassedTest(test)
    {
        
    }

    /**
     * Perform the necessary calculations before each assertion will be triggered.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    beforeEachAssertionCalculations(assertion)
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
     * Before each assertion will be triggered.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    beforeEachAssertion(assertion)
    {
        
    }

    /**
     * Perform the necessary calculations after each assertion have been triggered.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachAssertionCalculations(assertion)
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
     * After each assertion have been triggered.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachAssertion(assertion)
    {
        
    }

    /**
     * Perform the necessary calculations after each failed assertion.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachFailedAssertionCalculations(assertion)
    {
        if (! this.testFailures[assertion.test.file]) {
            this.testFailures[assertion.test.file] = {};
            this.testFailures[assertion.test.file]['functions'] = [];
        }

        this.testFailures[assertion.test.file]['count']++;
        this.testFailures[assertion.test.file]['functions'][assertion.test.function]['count']++;

        this.assertionsFailuresCount++;
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

        if (assertion.test.io) {
            name = `${assertion.test.name} -> ${assertion.test.function}`;
            errorLocation = assertion.test.file;

            additionalInformation += this.forceColor.yellow('Command');
            additionalInformation += '\n';
            additionalInformation += this.beautify(assertion.test.executeInformation.command);
            additionalInformation += '\n';
            additionalInformation += this.forceColor.yellow('Arguments');
            additionalInformation += '\n';
            additionalInformation += this.beautify(assertion.test.executeInformation.arguments);
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
     * Perform the necessary calculations after each passed assertion.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachPassedAssertionCalculations(assertion)
    {
        this.assertionsPassesCount++;
    }

    /**
     * After each passed assertion.
     * 
     * @param  {Assertion}  assertion
     * @return {void}
     */
    afterEachPassedAssertion(assertion)
    {
        
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
