use('TestCase');

module.exports = class FilterTest extends TestCase
{
    /** @test */
    it_is_able_to_assert_true()
    {
        this.assertTrue(true);
    }

    /** @test */
    it_is_able_to_assert_false()
    {
        this.assertFalse(false);
    }
}
