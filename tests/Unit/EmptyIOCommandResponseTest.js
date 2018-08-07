module.exports = class EmptyIOCommandResponseTest extends TestCase
{
    /** @test */
    async it_will_report_proper_about_io_tests_with_an_empty_response()
    {
        let ioTest = {};
        
        ioTest.test = counsel.serviceProviders.yaml.safeLoad(
            counsel.serviceProviders.fs.readFileSync(counsel.path('tests/IO/EmptyCommandResponseTest.yaml'), 'utf8')
        );

        ioTest.filename = counsel.path('tests/IO/EmptyCommandResponseTest.yaml');
        let reporter = new (require('../../src/reporters/DotReporter'));
        reporter.silent = true;
        let oldReporter = Assertions.reporter;
        Assertions.reporter = reporter;
        let ioTestRunner = new (require('../../src/IOTestRunner'))([ioTest], reporter);

        await ioTestRunner.runTest(ioTest);

        reporter.afterTest();

        Assertions.reporter = oldReporter;

        this.assertContains(`No result received from command "echo".`, reporter.output);
    }
}
