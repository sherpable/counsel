counselUse('TestCase');

module.exports = class VueComponentTestCase extends TestCase
{
    /**
     * Create a new VueComponentTestCase instance.
     * 
     * @constructor
     */
    constructor()
    {
        super();

        this.moment = counsel().resolve('moment');

        this.clock = counsel().resolve('sinon').useFakeTimers();
    }

    /**
     * Render a template into a vue component tester instance.
     * It will return a Proxy with the VueComponentTester
     * instance as it's target.
     * 
     * @param  {string}  template
     * @param  {object}  props
     * @return {Proxy}
     */
    render(template, props)
    {
        return new Proxy(counsel().resolve('VueComponentTester').test(
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

    /**
     * Assert that the contents will exists in the html presentation from the component.
     * This is an alias method for the assertContains assertion.
     * When the given regex is a string it will be converter into
     * a RegExp instance with flags 'gim'.
     * 
     * @param  {string|RegExp}  regex
     * @param  {string}   		contents
     * @param  {string}  		message
     * @return {void}
     */
    assertSee(regex, contents, message)
    {
        this.assertContains(regex, contents, message);
    }

    /**
     * Assert that the contents not exists in the html presentation from the component.
     * This is an alias method for the assertNotContains assertion.
     * When the given regex is a string it will be converter into
     * a RegExp instance with flags 'gim'.
     * 
     * @param  {string|RegExp}  regex
     * @param  {string}   		contents
     * @param  {string}  		message
     * @return {void}
     */
    assertNotSee(regex, contents, message)
    {
        this.assertNotContains(regex, contents, message);
    }

    /**
     * Use the fake times from sinon and
     * And trigger the beforeEach fixture.
     * 
     * @return {void}
     */
    beforeEachInternal()
    {
        this.clock = counsel().serviceProviders.sinon.useFakeTimers();

        super.beforeEachInternal();
    }

    /**
     * Restore the fake timers from sinon
     * and trigger the tearDown fixture.
     * 
     * @return {void}
     */
    tearDownInternal()
    {
        this.clock.restore();

        super.tearDownInternal();
    }
}
