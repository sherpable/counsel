counsel_use('TestCase');

module.exports = class SetUpTest extends TestCase
{
    constructor()
    {
        super();

        this.setUpMethodIsHit = false;
    }

    setUp()
    {
        this.setUpMethodIsHit = true;
    }

    /** @test */
    async it_will_call_the_set_up_method_if_exists()
    {
        this.assertTrue(this.setUpMethodIsHit);
    }
}
