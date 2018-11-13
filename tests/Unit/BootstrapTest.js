counselUse('TestCase');

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
    it_will_autoload_the_specified_classes()
    {
        this.assertEquals(TestAutoloadClassFile, require('../TestAutoloadClassFile.js'));
        this.assertTrue((new TestAutoloadClassFile).isAutoloadedClass());
    }

    /** @test */
    it_will_instantiate_the_specified_classes()
    {
        this.assertEquals(TestInstantiateClassFile, new (require('../TestInstantiateClassFile.js')));
        this.assertTrue(TestInstantiateClassFile.isInstantiatedClass());
    }
}
