module.exports = class VueComponentTester
{
    /**
     * Create a new VueComponentTester instance.
     * 
     * @constructor
     * 
     * @param  {TestCase}  testCaseInstance
     * @param  {string}    template
     * @param  {object}    props
     * @param  {boolean}   parentComponent
     */
    constructor(testCaseInstance, template, props = {}, parentComponent = false)
    {
        this.parsedTemplate = counsel().serviceProviders.cheerio.load(template);

        template = template.replace(/\r?\n?/g, '');
        this.template = template;
        this.html = null;
        this.propsOverride = props;
        this.props = {};
        this.config = {};
        this.config.stubs = {};
        this.slots = {};
        this.children = {};
        this.tester = testCaseInstance;
        this.componentName = template.match(/<([^\s>]+)(\s|>)+/)[1];

        if (parentComponent && parentComponent.sealedOptions) {
            this.component = parentComponent.sealedOptions.components[this.componentName];
        } else {
            this.component = Vue.options.components[this.componentName];
        }

        if (! this.component && parentComponent.components[this.componentName]) {
            this.component = parentComponent.components[this.componentName];
        }

        if (! this.component) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }

        let testComponent = this.component;

        // Stub child components
        let componentTemplate = null;
        if (this.component.template) {
            componentTemplate = counsel().serviceProviders.cheerio.load(this.component.template);
        } else {
            componentTemplate = counsel().serviceProviders.cheerio.load(this.component.options.template);
        }

        let componentRootHtml = componentTemplate('body').children().first().html();

        counsel().serviceProviders.cheerio(componentRootHtml).each((index, element) => {
            let childComponentName = element.tagName;

            if (childComponentName) {
                let stub = null;

                if (this.component.sealedOptions && this.component.sealedOptions.components[childComponentName]) {
                    stub = this.component.sealedOptions.components[childComponentName];
                } else if (this.component.components) {
                    stub = this.component.components[childComponentName];
                }

                if (! stub) {
                    Vue.options.components[childComponentName];
                }

                if (stub) {
                    // let childComponentWrapper = vueTestUtils.mount(stub);
                    let childComponent = new (counsel().resolve('VueComponentTester'))(this.tester, `<${childComponentName}>${stub.template}</${childComponentName}>`, stub.props, this.component);
                    this.children[childComponentName] = childComponent;
                    this.config.stubs[childComponentName] = childComponent.toHtml();
                }
            }
        });

        this.defaultSlot = '';

        this.parsedTemplate(this.componentName).children().each((index, element) => {
            let tagName = element.tagName;
            let child = counsel().serviceProviders.cheerio(element);

            if (child.attr('slot')) {
                this.slots[child.attr('slot')] = `<${tagName}>${child.html()}</${tagName}>`;
            } else {
                this.defaultSlot += `<${tagName}>${child.html()}</${tagName}>`;
            }
        });

        // Need to remove this ! parentComponent check for default slots in sub-components
        if (this.defaultSlot && ! parentComponent) {
            let defaultSlotParentName = (componentTemplate('slot').not('[name]').parent()[0].name);

            let cleanComponentTemplate = this.component.options.template.replace(/\s+/g, '');
            let cleanSlotParentHtml = counsel().serviceProviders.cheerio.html(componentTemplate('slot').not('[name]').parent()).replace(/\s+/g, '');

            if (cleanSlotParentHtml != cleanComponentTemplate) {
                componentTemplate('slot').not('[name]').parent().replaceWith('<slot></slot>');
                this.component.options.template = componentTemplate('body').html();

                this.slots.default = `<${defaultSlotParentName}>${this.defaultSlot}</${defaultSlotParentName}>`;
            } else {
                this.slots.default = this.defaultSlot;
            }
        }

        this.props = this.parseProps();
        // let propsRegex = new RegExp(`<${this.componentName}\s?([^\>]+)(|>)+`, 'igm');
        // this.rawProps = propsRegex.exec(template);

        // if (this.rawProps && this.rawProps[1]) {
        //     this.rawProps = this.rawProps[1];
        //     this.props = this.parseProps();
        // } else {
        //     this.rawProps = null;
        // }

        this.config.slots = this.slots;

        this.wrapper = counsel().resolve('vueTestUtils').mount(testComponent, this.config);

        this.vm = this.wrapper.vm;

        this.wrapper.setProps(this.props);
    }

    /**
     * Parse the given props from the component.
     * 
     * @return {object}
     */
    parseProps()
    {
        let props = {};
        let template = this.parsedTemplate;
        let rawProps = template(this.componentName).attr();

        for (let attributeName in rawProps) {
            if (attributeName.startsWith(':')) {
                props[attributeName.replace(':', '')] = this.propsOverride[attributeName.replace(':', '')];
            } else {
                props[attributeName] = rawProps[attributeName];
            }
        }

        return props;
    }

    /**
     * Specify the props for the component.
     * 
     * @param  {object}  props
     * @return {this}
     */
    setProps(props)
    {
        this.wrapper.setProps(props);

        return this;
    }

    /**
     * Create a new VueComponentTester instance.
     * 
     * @static
     * 
     * @param  {TestCase}  testCaseInstance
     * @param  {string}    template
     * @param  {object}    props
     * @return {this}
     */
    static test(testCaseInstance, template, props)
    {
        let tester = new this(testCaseInstance, template, props);
        return tester;
    }

    /**
     * Fast forward the components timeline with a given time.
     * Supported time expressions (converted into ms):
     * - 1s   => 1000
     * - 50ms => 50
     * - 50   => 50
     * 
     * @param  {float|int|string}  timeExpression
     * @return {void}
     */
    fastForward(timeExpression)
    {
        let time = parseFloat(timeExpression);

        if(timeExpression.substr(timeExpression.length - 2) != 'ms' && timeExpression.substr(timeExpression.length - 1) == 's') {
            time *= 1000;
        }

        this.tester.clock.tick(time);
    }

    /**
     * Retrieve the html presentation from the component.
     * 
     * @return {string}
     */
    toHtml()
    {
        return this.wrapper.html();
    }

    /**
     * Dump the html presentation from the component and exit the process.
     * 
     * @return {void}
     */
    dd()
    {
        dd(this.toHtml());
    }

    /**
     * Assert than an event was emitted.
     * 
     * @param  {string}  eventName
     * @return {void}
     */
    assertEmitted(eventName)
    {
        let events = this.wrapper.emitted();
        let eventNames = Object.keys(events);

        this.tester.assertTrue(eventNames.includes(eventName), `Assert that event [${eventName}] was emitted, but is was not.`);
    }

    /**
     * Assert that the contents will exists in the html presentation from the component.
	 * When the given regex is a string it will be converter into
	 * a RegExp instance with flags 'gim'.
     * 
	 * @param  {string|RegExp}  expression
     * @return {this}
     */
    assertSee(expression)
    {
        let rawExpression = expression;

        if (typeof expression == 'string') {
            expression = new RegExp(expression, 'gim');
        }

        let html = this.toHtml();

        this.tester.assertContains(expression, html, `Assert that "${rawExpression}" should exists on the page, but it was not found.`);

        return this;
    }

    /**
     * Alias method for assertSee.
     * 
	 * @param  {string|RegExp}  expression
     * @return {this}
     */
    andSee(expression)
    {
        return this.assertSee(expression);
    }

    /**
     * Alias method for assertSee.
     * 
	 * @param  {string|RegExp}  expression
     * @return {this}
     */
    see(expression)
    {
        return this.assertSee(expression);
    }

    /**
     * Assert that the contents not exists in the html presentation from the component.
	 * When the given regex is a string it will be converter into
	 * a RegExp instance with flags 'gim'.
     * 
	 * @param  {string|RegExp}  expression
     * @return {this}
     */
    assertNotSee(expression)
    {
        let rawExpression = expression;

        if (typeof expression == 'string') {
            expression = new RegExp(expression, 'gim');
        }

        this.tester.assertNotContains(expression, this.toHtml(), `Assert that "${rawExpression}" should not exists on the page, but it was found.`);
    }

    /**
     * Alias method for assertNotSee.
     * 
	 * @param  {string|RegExp}  expression
     * @return {this}
     */
    andNotSee(expression)
    {
        return this.assertNotSee(expression);
    }

    /**
     * Alias method for assertNotSee.
     * 
	 * @param  {string|RegExp}  expression
     * @return {this}
     */
    notSee(expression)
    {
        return this.assertNotSee(expression);
    }

    /**
     * Assert that the text is visible in the current component state.
     * 
	 * @param  {string}  text
     * @return {this}
     */
    async assertVisible(text)
    {
        let cheerio = require('cheerio');
        let html = await this.toHtml();
        let $ = cheerio.load(html);

        let isVisible = $('div').filter(function() {
            return $(this).text().trim() === text;
        }).attr('style') != 'display:none;';

        this.tester.assertTrue(isVisible);

        return this;
    }

    /**
     * Assert that the text is not visible in the current component state.
     * 
	 * @param  {string}  text
     * @return {this}
     */
    async assertNotVisible(text)
    {
        let cheerio = require('cheerio');
        let html = await this.toHtml();
        let $ = cheerio.load(html);

        let isNotVisible = $('div').filter(function() {
            return $(this).text().trim() === text;
        }).attr('style').replace(/\s/g,'') == 'display:none;';

        this.tester.assertTrue(isNotVisible);

        return this;
    }

    /**
     * Alias method for assertNotVisible.
     * 
	 * @param  {string}  text
     * @return {this}
     */
    async assertHidden(text)
    {
        return await this.assertNotVisible(text);
    }

    /**
     * Simulate a click operation on the element find by the selector.
     * 
	 * @param  {string}  selector
     * @return {void}
     */
    click(selector)
    {
        this.find(selector).trigger('click');
    }

    /**
     * Simulate typing a value into the element find by the selector.
     * 
	 * @param  {string}  selector
     * @param  {mixed}   value
     * @return {void}
     */
    typeInto(selector, value)
    {
        let elementWrapper = this.find(selector);

        elementWrapper.element.value = value;
        elementWrapper.trigger('input');
    }

    /**
     * Find the element with the given selector.
     * 
	 * @param  {string}  selector
     * @return {Wrapper}
     */
    find(selector)
    {
        return this.wrapper.find(selector);
    }
}
