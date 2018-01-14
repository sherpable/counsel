module.exports = class TearDownTest extends TestCase
{
    constructor()
    {
        super();

        this.stack = {};
    }

    /** @test */
    first_append_to_stack()
    {
        this.stack['first'] = 'foo';
    }

    /** @test */
    second_append_to_stack()
    {
        this.stack['second'] = 'bar';
    }

    tearDown()
    {
        this.assertEquals({first: 'foo', second: 'bar'}, this.stack);
    }
}
