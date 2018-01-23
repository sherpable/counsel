module.exports = class VueComponentTester
{
    constructor(testCaseInstance, template, props = {})
    {
        this.parsedTemplate = counsel.serviceProviders.cheerio.load(template);

        template = template.replace(/\r?\n?/g, '');
        this.template = template;
        this.html = null;
        this.propsOverride = props;
        this.props = {};
        this.config = {};
        this.config.stubs = {};
        this.slots = {};
        this.tester = testCaseInstance;
        this.componentName = template.match(/<([^\s>]+)(\s|>)+/)[1];

        this.component = Vue.options.components[this.componentName];
        // console.log(this.component);

        if (! this.component) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }

        let testComponent = this.component;

        // Stub child components
        let componentTemplate = counsel.serviceProviders.cheerio.load(this.component.options.template);

        let componentRootHtml = componentTemplate('body').children().first().html();

        counsel.serviceProviders.cheerio(componentRootHtml).each((index, element) => {
            let childComponentName = element.tagName;

            if (childComponentName) {
                let stub = Vue.options.components[childComponentName];

                if (stub) {
                    let childComponentWrapper = vueTestUtils.mount(stub);
                    this.config.stubs[childComponentName] = childComponentWrapper.html();
                }
            }
        });

        this.defaultSlot = '';

        this.parsedTemplate(this.componentName).children().each((index, element) => {
            let tagName = element.tagName;
            let child = counsel.serviceProviders.cheerio(element);

            if (child.attr('slot')) {
                this.slots[child.attr('slot')] = `<${tagName}>${child.html()}</${tagName}>`;
            } else {
                this.defaultSlot += `<${tagName}>${child.html()}</${tagName}>`;
            }
        });

        if (this.defaultSlot) {
            let defaultSlotParentName = (componentTemplate('slot').not('[name]').parent()[0].name);

            let cleanComponentTemplate = this.component.options.template.replace(/\s+/g, '');
            let cleanSlotParentHtml = counsel.serviceProviders.cheerio.html(componentTemplate('slot').not('[name]').parent()).replace(/\s+/g, '');

            if (cleanSlotParentHtml != cleanComponentTemplate) {
                componentTemplate('slot').not('[name]').parent().replaceWith('<slot></slot>');
                this.component.options.template = componentTemplate('body').html();

                this.slots.default = `<${defaultSlotParentName}>${this.defaultSlot}</${defaultSlotParentName}>`;
            } else {
                this.slots.default = this.defaultSlot;
            }
        }

        let propsRegex = new RegExp(`<${this.componentName}\s?([^\>]+)(|>)+`, 'igm');
        this.rawProps = propsRegex.exec(template);

        if (this.rawProps && this.rawProps[1]) {
            this.rawProps = this.rawProps[1];
            this.props = this.parseProps();
        } else {
            this.rawProps = null;
        }

        this.config.slots = this.slots;

        this.wrapper = vueTestUtils.mount(testComponent, this.config);

        this.vm = this.wrapper.vm;

        this.wrapper.setProps(this.props);
    }

    parseProps()
    {
        let props = {};

        this.rawProps = this.rawProps.replace(/\s/g, '');
        this.rawProps = this.rawProps.replace(/"/g, '" ');
        this.rawProps = this.rawProps.replace(/=" /g, '="');

        this.rawProps.split(' ').map(prop => {
            return prop.split('=');
        }).forEach(prop => {
            if (! prop[0]) {
                return;
            }

            if (prop[0].includes(':')) {
                let propName = prop[0].replace(':', '');
                props[propName] = this.propsOverride[propName];
            } else {
                props[prop[0]] = prop[1].replace(/"/g, '');
            }
        });

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
