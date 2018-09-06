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

    afterEachIncompleteTest(test, message)
    {
        super.afterEachIncompleteTest(test, message);

        this.appendLog(this.forceColor.yellow('I'));
    }

    afterEachSkippedTest(test, message)
    {
        super.afterEachSkippedTest(test, message);

        this.appendLog(this.forceColor.blue('S'));
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

            this.appendLog(`  ${this.testsCountWithSpace()} / ${this.totalTests} (${this.progressWithSpace()}%)\n${this.addIndentation()}`);
        }
    }

    afterEachFailedIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions, testProcess)
    {
        super.afterEachFailedIOTest(testContext, actual, mainTestPasses, failedAssertions, passedAssertions, testProcess);

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

            this.appendLog(`  ${this.testsCountWithSpace()} / ${this.totalTests} (${this.progressWithSpace()}%)\n${this.addIndentation()}`);
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
