module.exports = class DotReporter extends Reporter
{
    constructor()
    {
        super();

        this.testsExecuted = 0;

        this.testsPerLine = 34;

        if (counsel().isIOTestProcess) {
            this.testsPerLine = 24;
        }
    }

    beforeTest()
    {
        super.beforeTest();

        if (this.testsCount > 0) {
            return;
        }

        this.appendLog(
            this.addIndentation()
        );
    }

    beforeIOTest()
    {
        super.beforeIOTest();

        if (this.testsCount > 0) {
            return;
        }

        this.appendLog(
            this.addIndentation()
        );
    }

    afterEachFailedTest(test)
    {
        super.afterEachFailedTest(test);

        this.appendLog(this.forceColor.red('x'));
    }

    afterEachPassedTest(test)
    {
        super.afterEachPassedTest(test);

        this.appendLog(this.forceColor.green('.'));
    }

    afterEachIncompleteTest(test)
    {
        super.afterEachIncompleteTest(test);

        this.appendLog(this.forceColor.yellow('I'));
    }

    afterEachSkippedTest(test)
    {
        super.afterEachSkippedTest(test);

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

    afterEachTest(test)
    {
        super.afterEachTest(test);

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

            this.appendLog(`${spaceLeft}  ${this.testsCount} / ${this.totalTests} (100%)`);
        }

        this.appendLog('\n');

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
