counsel_use('TestCase');

module.exports = class EmptyIOCommandResponseTest extends TestCase
{
    /** @test */
    async it_will_report_proper_about_io_tests_with_an_empty_response()
    {
        if (process.platform == 'win32') {
            this.markAsSkipped(
                '"echo" command in windows will return "ECHO is on." instead of nothing.'
            );
        }

        let reporter = await this.executeIOTest({
            path: 'tests/IO/EmptyCommandResponseTest.yaml',
            test: 'Empty command response logging',
            perform: 'echo',
            expect: undefined,
        });

        this.assertEquals(` x

 x 1) Empty command response logging -> main test
 ${counsel().root}tests/IO/EmptyCommandResponseTest.yaml
 Command
  'echo'
 Arguments
  Array []
 Options
  Object {
    cwd: '${counsel().cwd()}',
  }
 
 
 
 No result received from command "echo".
 
 
 
 Time: ${reporter.formattedExecutionTime}

 1 failed, 1 tests
`, reporter.output);
    }
}
