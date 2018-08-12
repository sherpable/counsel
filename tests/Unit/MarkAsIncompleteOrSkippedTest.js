module.exports = class MarkAsIncompleteOrSkippedTest extends TestCase
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
