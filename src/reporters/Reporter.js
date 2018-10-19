module.exports = class Reporter
{
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

        this.theme = require('../Theme')(counsel().serviceProviders.chalk, this.forceColor);

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

    beforeBoot()
    {

    }

    afterBoot()
    {
        // Assertions.macro('assertNull', (actual, message) => {
        //     return new Assertion({
        //         pass: actual == null,
        //         message,
        //     });
        // });
    }

    beforeTest()
    {
        this.startTime = new this.reporterDate();
    }

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

    beforeIOTest()
    {

    }

    afterIOTest()
    {

    }

    beforeEachIOTest(testContext)
    {

    }

    afterEachIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions)
    {
        // let failedCount = Object.keys(failedAssertions).length;
        // if (! mainTestPasses) {
        //     failedCount++;
        // }



        // let passedCount = Object.keys(passedAssertions).length;
        // if (! mainTestPasses) {
        //     passedCount++;
        // }


        this.testsCount++;
    }

    afterEachFailedIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions, testProcess)
    {
        this.testsFailuresCount++;
        // this.afterEachIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions);
    }

    afterEachPassedIOTest(testContext, passedAssertions)
    {
        this.testsPassesCount++;
        // this.afterEachIOTest(testContext, testContext.test.expect, true, {}, passedAssertions);
    }

    afterEachIncompleteTest(test)
    {
        this.testsIncompleteCount++;

        if (test.className && test.functionName) {
            this.incompleteTests[`${test.className}->${test.functionName}`] = test.message;
        } else {
            this.incompleteTests[`${test.className}`] = test.message;
        }
    }

    afterEachSkippedTest(test)
    {
        this.testsSkippedCount++;

        if (test.className && test.functionName) {
            this.skippedTests[`${test.className}->${test.functionName}`] = test.message;
        } else {
            this.skippedTests[`${test.className}`] = test.message;
        }
    }

    afterEachIOTestWithoutResults(testContext, testProcess)
    {

    }

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

    afterEachTestClass(testClass)
    {

    }

    afterEachFailedTestClass(testClass)
    {

    }

    afterEachPassedTestClass(testClass)
    {

    }

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

    afterEachTest(test)
    {
        this.testsCount++;

        if (! this.fullRun) {
            return;
        }

        this.progress = Math.round((this.testsCount / this.totalTests) * 100);
    }

    afterEachFailedTest(test)
    {
        this.testsFailuresCount++;
    }

    afterEachPassedTest(test)
    {
        this.testsPassesCount++;
    }

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

    afterEachPassedAssertion(assertion)
    {
        this.assertionsPassesCount++;
    }

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

    appendLog(message)
    {
        this.output += message;

        if (this.silent) {
            return;
        }

        process.stdout.write(message);
    }

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

    indentAppend(message, level = 1)
    {
        return this.indent(message, level, true);
    }

    addIndentation(spaces = undefined)
    {
        if (spaces === undefined) {
            spaces = this.indentation;
        }

        return `${' '.repeat(spaces)}`;
    }

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
