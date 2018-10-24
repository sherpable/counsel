use('Reporter');

module.exports = class DotReporter extends Reporter
{
    /**
     * Create a new DotReporter instance.
     * 
     * @constructor
     */
    constructor()
    {
        super();

        this.testsExecuted = 0;

        this.testsPerLine = 34;

        if (counsel().isIOTestProcess) {
            this.testsPerLine = 24;
        }
    }

    /**
     * Before the tests will be triggered.
     * 
     * @return {void}
     */
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

    /**
     * After each failed test class.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    afterEachFailedTest(test)
    {
        super.afterEachFailedTest(test);

        this.appendLog(this.forceColor.red('x'));
    }

    /**
     * After each passed test class.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
    afterEachPassedTest(test)
    {
        super.afterEachPassedTest(test);

        this.appendLog(this.forceColor.green('.'));
    }

    /**
     * After each incomplete test.
     * 
     * @param  {IOTest|Test}  test
     * @return {void}
     */
    afterEachIncompleteTest(test)
    {
        super.afterEachIncompleteTest(test);

        this.appendLog(this.forceColor.yellow('I'));
    }

    /**
     * After each skipped test.
     * 
     * @param  {IOTest|Test}  test
     * @return {void}
     */
    afterEachSkippedTest(test)
    {
        super.afterEachSkippedTest(test);

        this.appendLog(this.forceColor.blue('S'));
    }

    /**
     * After each IO test without results.
     * 
     * @param  {IOTest}  test
     * @return {void}
     */
    afterEachIOTest(ioTest)
    {
        super.afterEachIOTest(ioTest);

        if (! this.fullRun) {
            return;
        }

        this.testsExecuted++;

        if (this.testsExecuted == this.testsPerLine) {
            this.testsExecuted = 0;

            this.appendLog(`  ${this.testsCountWithSpace()} / ${this.totalTests} (${this.progressWithSpace()}%)\n${this.addIndentation()}`);
        }
    }

    /**
     * After each failed IO test.
     * @param  {IOTest}  ioTest
     * 
     * @return {void}
     */
    afterEachFailedIOTest(ioTest)
    {
        super.afterEachFailedIOTest(ioTest);

        this.appendLog(this.forceColor.red('x'));
    }

    /**
     * After each passed IO test.
     * 
     * @param  {IOTest}  ioTest
     * @return {void}
     */
    afterEachPassedIOTest(ioTest)
    {
        super.afterEachPassedIOTest(ioTest);

        this.appendLog(this.forceColor.green('.'));
    }

    /**
     * After each IO test without results.
     * 
     * @param  {IOTest}  test
     * @return {void}
     */
    afterEachIOTestWithoutResults(ioTest)
    {
        super.afterEachIOTestWithoutResults(ioTest);
    }

    /**
     * After each test class have been triggered.
     * 
     * @param  {TestClass}  testClass
     * @return {void}
     */
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

    /**
     * After the tests have been triggered.
     * 
     * @return {void}
     */
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

    /**
     * Retrieve the test progress with indentation so all progress percentages will lineup in the output.
     * 
     * @return {string}
     */
    progressWithSpace()
    {
        let space = ' '.repeat(3 - this.progress.toString().length);

        return `${space}${this.progress}`;
    }

    /**
     * Retrieve the test count with indentation so all counters will lineup in the output.
     * 
     * @return {string}
     */
    testsCountWithSpace()
    {
        let space = ' '.repeat(this.totalTests.toString().length - this.testsCount.toString().length);

        return `${space}${this.testsCount}`;
    }
}
