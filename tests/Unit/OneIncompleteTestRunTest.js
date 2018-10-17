use('TestCase');

module.exports = class OneIncompleteTestRunTest extends TestCase
{
    setUp()
    {
        this.markAsIncomplete(
            'This test is incomplete.'
        );
    }

    /** @test */
    never_hit_test_method()
    {
        this.assertTrue(false);
    }
}
