module.exports = class EmptyIOCommandResponseTest extends TestCase
{
    /** @test */
    async it_will_report_proper_about_io_tests_with_an_empty_response()
    {
        let reporter = await this.executeIOTest({
            test: 'Empty command response logging',
            perform: 'echo',
            expect: undefined,
        });

        this.assertEquals(`x  
  x 1) Empty command response logging -> main test
  ${counsel.root}tests/IO/EmptyCommandResponseTest.yaml
  Command
  'echo'
  Arguments
  Array []
  Options
  Object {
    cwd: '${counsel.rootWithoutTrailingsSlash}',
  }

  

  No result received from command "echo".


   Time: ${reporter.executionTimeFormatted}  1 failed, 1 tests`, reporter.output);
    }
}
