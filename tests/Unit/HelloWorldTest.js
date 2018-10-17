use('TestCase');

module.exports = class HelloWorldTest extends TestCase
{
    test_without_annotation()
    {
        this.assertTrue(true);
    }

	/** @test */
	with_annotation()
	{
		this.assertTrue(true);
	}
}
