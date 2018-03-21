module.exports = class VueComponentTester
{
    constructor(testCaseInstance, template, props = {})
    {
        this.tasks = [
            'getComponentName',
            'getProps',
            'parseTemplate',
            'buildTestComponent',
        ];

        this.parsedTemplate = counsel.serviceProviders.cheerio.load(template);

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

        this.component = Vue.options.components[this.componentName];

        if (! this.component) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }

        let testComponent = VueTemplateParser.parse(template);

        this.wrapper = VueComponentTestWrapper.wrap({
            component: this.component.options,
            config: testComponent.config
        }).wrapper;

        this.vm = this.wrapper.vm;

        this.props = this.parseProps();

        this.wrapper.setProps(this.props);
    }

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

    setProps(props)
    {
        this.wrapper.setProps(props);

        return this;
    }

    static test(testCaseInstance, template, props)
    {
        let tester = new this(testCaseInstance, template, props);
        return tester;
    }

    fastForward(timeExpression)
    {
        let time = parseFloat(timeExpression);

        if(timeExpression.substr(timeExpression.length - 2) != 'ms' && timeExpression.substr(timeExpression.length - 1) == 's') {
            time *= 1000;
        }

        this.tester.clock.tick(time);
    }

    toHtml()
    {
        this.wrapper.update();
        return this.wrapper.html();
    }

    dd()
    {
        dd(this.toHtml());
    }

    assertEmitted(eventName)
    {
        this.wrapper.update();

        let events = this.wrapper.emitted();
        let eventNames = Object.keys(events);

        this.tester.assertTrue(eventNames.includes(eventName), `Assert that event [${eventName}] was emitted, but is was not.`);
    }

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

    andSee(expression)
    {
        return this.assertSee(expression);
    }

    see(expression)
    {
        return this.assertSee(expression);
    }

    assertNotSee(expression)
    {
        let rawExpression = expression;

        if (typeof expression == 'string') {
            expression = new RegExp(expression, 'gim');
        }

        this.tester.assertNotRegExp(expression, this.toHtml(), `Assert that "${rawExpression}" should not exists on the page, but it was found.`);
    }

    andNotSee(expression)
    {
        return this.assertNotSee(expression);
    }

    notSee(expression)
    {
        return this.assertNotSee(expression);
    }

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

    async assertNotVisible(text)
    {
        let cheerio = require('cheerio');
        let html = await this.toHtml();
        let $ = cheerio.load(html);

        let isNotVisible = $('div').filter(function() {
            return $(this).text().trim() === text;
        }).attr('style') == 'display:none;';

        this.tester.assertTrue(isNotVisible);

        return this;
    }

    click(selector)
    {
        this.find(selector).trigger('click');
    }

    typeInto(selector, value)
    {
        let elementWrapper = this.find(selector);

        elementWrapper.element.value = value;
        elementWrapper.trigger('input');
    }

    find(selector)
    {
        return this.wrapper.find(selector);
    }
}
