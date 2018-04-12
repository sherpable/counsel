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
        this.assertTrue(global['test-autoload-file']);
    }

    /** @test */
    it_will_instantiate_the_specified_classes()
    {
        this.assertEquals(TestAutoloadClassFile, new (require('../TestAutoloadClassFile.js')));
        this.assertTrue(TestAutoloadClassFile.isAutoloadClass());
    }
}
