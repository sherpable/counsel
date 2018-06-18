module.exports = class DotReporter extends Reporter
{
    constructor()
    {
        super();

        this.testsExecuted = 0;

        this.testsPerLine = 34;

        if (counsel.isIOTestProcess) {
            this.testsPerLine = 24;
        }
    }

    afterEachFailedTest(testName, results, failuresCount)
    {
        super.afterEachFailedTest(testName, results, failuresCount);

        this.appendLog(counsel.serviceProviders.chalk.red('x'));
    }

    afterEachPassedTest(testName, results)
    {
        super.afterEachPassedTest(testName, results);

        this.appendLog(counsel.serviceProviders.chalk.green('.'));
    }

    afterEachIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions)
    {
        super.afterEachIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions);

        if (! this.fullRun) {
            return;
        }

        this.testsExecuted++;

        if (this.testsExecuted == this.testsPerLine) {
            this.testsExecuted = 0;

            this.appendLog(`  ${this.testsCountWithSpace()} / ${this.totalTests} (${this.progressWithSpace()}%)\n  `);
        }
    }

    afterEachFailedIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions)
    {
        super.afterEachFailedIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions);

        this.appendLog(counsel.serviceProviders.chalk.red('x'));
    }

    afterEachPassedIOTest(testContext, passedAssertions)
    {
        super.afterEachPassedIOTest(testContext, passedAssertions);

        this.appendLog(counsel.serviceProviders.chalk.green('.'));
    }

    afterEachIOTestWithoutResults(testContext, testProcess)
    {
        super.afterEachIOTestWithoutResults(testContext, testProcess);

        // this.log(counsel.serviceProviders.chalk.yellow('Command'));
        // this.log(testProcess.command);
        // this.log(counsel.serviceProviders.chalk.yellow('Arguments'));
        // this.log(testProcess.args);
        // this.log(counsel.serviceProviders.chalk.yellow('Options'));
        // this.log(testProcess.options);
    }

    afterEachTest(testName, results, failuresCount)
    {
        super.afterEachTest(testName, results, failuresCount);

        if (! this.fullRun) {
            return;
        }

        this.testsExecuted++;

        if (this.testsExecuted == this.testsPerLine) {
            this.testsExecuted = 0;

            this.appendLog(`  ${this.testsCountWithSpace()} / ${this.totalTests} (${this.progressWithSpace()}%)\n  `);
        }
    }

    afterTest()
    {
        if (this.fullRun && this.testsExecuted > 0) {
            let spaceLeft = '';
            let spacesLeft = this.testsPerLine - this.testsExecuted;

            if (spacesLeft > 0) {
                spaceLeft = ' '.repeat(spacesLeft);
            }

            this.appendLog(`${spaceLeft}  ${this.testsCount} / ${this.totalTests} (100%)\n`);
        }

        super.afterTest();
    }

    progressWithSpace()
    {
        let space = ' '.repeat(3 - this.progress.toString().length);

        return `${space}${this.progress}`;
    }

    testsCountWithSpace()
    {
        let space = ' '.repeat(this.totalTests.toString().length - this.testsCount.toString().length);

        return `${space}${this.testsCount}`;
    }
}
