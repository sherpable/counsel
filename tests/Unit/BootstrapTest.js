module.exports = class BootstrapTest extends TestCase
{
    /** @test */
    it_will_override_env_data()
    {
        this.assertEquals('testing', process.env['APP_ENV']);
    }

    /** @test */
    it_will_autoload_the_specified_files()
    {
        TestAutoloadFile === {
            'test-autoload-file': true,
        };
    }
}
