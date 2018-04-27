module.exports = class DotReporter extends Reporter
{
    constructor()
    {
        super();

        this.testsExecuted = -1;

        this.testsPerLine = 43;
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

    afterEachTest(testName, results, failuresCount)
    {
        super.afterEachTest(testName, results, failuresCount);

        if (! this.fullRun) {
            return;
        }

        this.testsExecuted++;

        if (this.testsExecuted == this.testsPerLine) {
            this.testsExecuted = 0;

            this.appendLog(` ( ${this.progress}%)\n  `);
        }
    }

    afterTest()
    {
        if (this.fullRun && this.testsPerLine < this.totalTests) {
            let spaceLeft = '';
            let spacesLeft = (this.testsPerLine - this.testsExecuted) - 1;

            if (spacesLeft > 0) {
                spaceLeft = ' '.repeat(spacesLeft);
            }

            this.appendLog(`${spaceLeft} (100%)\n`);
        }

        super.afterTest();
    }
}
