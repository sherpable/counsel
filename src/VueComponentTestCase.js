module.exports = class VueComponentTestCase extends TestCase
{
    constructor()
    {
        super();

        this.clock = counsel.serviceProviders.sinon.useFakeTimers();
    }

    render(template, props)
    {
        return new Proxy(VueComponentTester.test(
            this,
            template,
            props
        ), {
            get(target, property, receiver)
            {
                if (property == 'page') {
                    return target.vm;
                }

                if (typeof target[property] == 'function') {
                    return function(...args) {
                       return target[property](...args);
                    };
                }

                if (target[property] !== undefined) {
                    return target[property];
                }

                if (typeof target.vm[property] == 'function') {
                    return function(...args) {
                        return target.vm[property](...args);
                    };
                }

                if (target.vm[property] !== undefined) {
                    return target.vm[property];
                }
            },
        });
    }

    assertSee(regex, contents, message)
    {
        this.assertContains(regex, contents, message);
    }

    assertNotSee(regex, contents, message)
    {
        this.assertNotContains(regex, contents, message);
    }

    beforeEachInternal()
    {
        this.clock.restore();
        this.clock = counsel.serviceProviders.sinon.useFakeTimers();

        super.beforeEachInternal();
    }

    tearDownInternal()
    {
        this.clock.restore();

        super.tearDownInternal();
    }
}
