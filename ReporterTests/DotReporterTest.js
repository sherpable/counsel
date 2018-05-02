module.exports = class DotReporterTest extends TestCase
{
	test_total_tests()
	{
		this.assertEquals(this.reporter.totalTests, 48);
	}
}
