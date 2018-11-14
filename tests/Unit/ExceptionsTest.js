counsel_use('TestCase');

module.exports = class ExceptionsTest extends TestCase
{
	/** @test */
    it_is_able_to_expect_an_exception()
    {
        this.expectException(Error);

        throw new Error;
    }

    /** @test */
    it_is_able_to_not_expect_an_exception()
    {
        this.notExpectException(TypeError);

        throw new Error;
    }

    /** @test */
    it_is_able_to_expect_an_exception_thrown_from_another_class()
    {
        let ExternalClass = new (new require('./ExternalClass'));

        this.expectException(TypeError);

        ExternalClass.throwTypeError();
    }

    /** @test */
    it_is_able_to_no_expect_an_exception_thrown_from_another_class()
    {
        let ExternalClass = new (new require('./ExternalClass'));

        this.notExpectException(Error);

        ExternalClass.throwTypeError();
    }

    /** @test */
    it_is_able_to_expect_and_not_expect_an_exception_thrown_from_another_class()
    {
        let ExternalClass = new (new require('./ExternalClass'));

        this.expectException(TypeError);
        this.notExpectException(Error);

        ExternalClass.throwTypeError();
    }
}
