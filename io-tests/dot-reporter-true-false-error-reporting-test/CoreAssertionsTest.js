counsel_use('TestCase');

module.exports = class CoreAssertionsTest extends TestCase
{
    /** @test */
    it_is_able_to_assert_true()
    {
        this.assertTrue(false);
    }

    /** @test */
    it_is_able_to_assert_false()
    {
        this.assertFalse(true);
    }
}
