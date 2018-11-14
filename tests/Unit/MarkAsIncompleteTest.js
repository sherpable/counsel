counsel_use('TestCase');

module.exports = class MarkAsIncompleteTest extends TestCase
{
    /** @test */
    method_before_incomplete_method()
    {
        this.assertTrue(true);
    }

    /** @test */
    it_is_possible_to_mark_a_test_as_incomplete()
    {
        this.assertTrue(true);

        this.markAsIncomplete(
            'This test is not implemented yet.'
        );

        this.assertTrue(true);
    }

    /** @test */
    method_after_incomplete_method()
    {
        this.assertTrue(true);
    }

        /** @test */
    it_is_possible_to_mark_a_test_as_incomplete_for_second_time()
    {
        this.assertTrue(true);

        this.markAsIncomplete(
            'This test is also not implemented yet.'
        );

        this.assertTrue(true);
    }
}
