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

        this.appendLog(this.forceColor.red('x'));
    }

    afterEachPassedTest(testName, results)
    {
        super.afterEachPassedTest(testName, results);

        this.appendLog(this.forceColor.green('.'));
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

        this.appendLog(this.forceColor.red('x'));
    }

    afterEachPassedIOTest(testContext, passedAssertions)
    {
        super.afterEachPassedIOTest(testContext, passedAssertions);

        this.appendLog(this.forceColor.green('.'));
    }

    afterEachIOTestWithoutResults(testContext, testProcess)
    {
        super.afterEachIOTestWithoutResults(testContext, testProcess);

        // this.log(this.forceColor.yellow('Command'));
        // this.log(testProcess.command);
        // this.log(this.forceColor.yellow('Arguments'));
        // this.log(testProcess.args);
        // this.log(this.forceColor.yellow('Options'));
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
