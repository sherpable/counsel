module.exports = class DotReporter extends Reporter
{
    constructor()
    {
        super();

        this.assertionsExecuted = -1;

        this.assertionsPerLine = 31;
    }

    afterEachFailedAssertion(assertion)
    {
        super.afterEachFailedAssertion(assertion);

        this.appendLog(counsel.serviceProviders.chalk.red('x'));
    }

    afterEachPassedAssertion(assertion)
    {
        super.afterEachPassedAssertion(assertion);

        this.appendLog(counsel.serviceProviders.chalk.green('.'));
    }

    afterEachAssertion(assertion)
    {
        super.afterEachAssertion(assertion);

        if (! this.fullRun) {
            return;
        }

        this.assertionsExecuted++;

        if (this.assertionsExecuted == this.assertionsPerLine) {
            this.assertionsExecuted = 0;

            this.appendLog(` ( ${this.progress}%)\n  `);
        }
    }

    afterTest()
    {
        if (this.assertionsPerLine < this.assertionsCount) {
            let spaceLeft = '';
            let spacesLeft = (this.assertionsPerLine - this.assertionsExecuted) - 1;

            if (spacesLeft > 0) {
                spaceLeft = ' '.repeat(spacesLeft);
            }

            this.appendLog(`${spaceLeft} (100%)\n`);
        }

        super.afterTest();
    }
}
