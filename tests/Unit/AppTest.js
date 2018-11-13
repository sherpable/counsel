counselUse('TestCase');

module.exports = class AppTest extends TestCase
{
    setUp()
    {
        this.foo = new Foo;

        counsel().bind('foo', this.foo);
    }

    /** @test */
    it_is_possible_to_bind_something_into_the_app()
    {
        Assertions.assertTrue(true);

        this.assertEquals(
            this.foo,
            counsel().resolve('foo')
        );
    }

    /** @test */
    it_is_possible_use_a_binding_and_assign_it_to_the_global_object()
    {
        counselUse('foo');

        this.assertEquals(
            this.foo,
            foo
        );
    }

    /** @test */
    it_is_possible_fetch_a_binding_with_a_facade_object()
    {
        counsel().defineFacade('FooFacade', 'foo');

        this.assertEquals(
            FooFacade.bar(),
            'baz'
        );

        this.assertEquals(
            'buz',
            FooFacade.bar('buz')
        );
    }

    /** @test */
    it_will_update_the_bindings_proper_for_a_facade_object()
    {
        let bar = new Bar;
        let otherBar = new OtherBar;
        counsel().bind('bar', bar);

        counsel().defineFacade('BarFacade', 'bar');

        this.assertEquals(
            BarFacade.resolveBinding(),
            bar
        );

        counsel().bind('bar', otherBar);

        this.assertEquals(
            BarFacade.resolveBinding(),
            otherBar
        );

        // global.TestCase = 'foo';
    }
}

class Foo
{
    bar(message = null)
    {
        if (message) {
            return message;
        }

        return 'baz';
    }
}

class Bar
{
    baz(message = null)
    {
        if (message) {
            return message;
        }

        return 'buz';
    }
}

class OtherBar
{
    otherBaz(message = null)
    {
        if (message) {
            return message;
        }

        return 'other buz';
    }
}

// global.FooFacade = new Proxy(
//     new (require('../../src/Facade'))('foo'),
//     require('../../src/FacadeProxy')
// );

// global.BarFacade = new Proxy(
//     new (require('../../src/Facade'))('bar'),
//     require('../../src/FacadeProxy')
// );
