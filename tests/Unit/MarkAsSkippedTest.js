module.exports = class MarkAsSkippedTest extends TestCase
{
    /** @test */
    method_before_skipped_method()
    {
        this.assertTrue(true);
    }

    /** @test */
    it_is_possible_to_mark_a_test_as_skipped()
    {
        this.markAsSkipped(
            'This test is skipped.'
        );
    }

    /** @test */
    method_after_skipped_method()
    {
        this.assertTrue(true);
    }

        /** @test */
    it_is_possible_to_mark_a_test_as_skipped_for_second_time()
    {
        this.markAsSkipped(
            'This test is also skipped.'
        );
    }
}
