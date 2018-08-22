module.exports = class HelloWorldTest extends TestCase
{
    test_without_annotation()
    {
        this.assertTrue(false);
    }

	/** @test */
	with_annotation()
	{
		this.assertTrue(true);
	}
}
