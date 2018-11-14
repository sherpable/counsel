counsel_use('TestCase');

module.exports = class OneSkippedTestRunTest extends TestCase
{
    setUp()
    {
        this.markAsSkipped(
            'This test is skipped.'
        );
    }

    /** @test */
    never_hit_test_method()
    {
        this.assertTrue(false);
    }
}
