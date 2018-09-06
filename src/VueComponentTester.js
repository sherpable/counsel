module.exports = class VueComponentTester
{
    constructor(testCaseInstance, template, props = {}, parentComponent = false)
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

        // console.log(Vue.options.components['hello-world-dot-vue-component'].sealedOptions);
        // process.exit();

        if (! this.component) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }

        let testComponent = this.component;

        // Stub child components
        let componentTemplate = null;
        if (this.component.template) {
            componentTemplate = counsel.serviceProviders.cheerio.load(this.component.template);
        } else {
            componentTemplate = counsel.serviceProviders.cheerio.load(this.component.options.template);
        }

        let componentRootHtml = componentTemplate('body').children().first().html();

        // console.log(this.componentName);
        // console.log(this.component);

        counsel.serviceProviders.cheerio(componentRootHtml).each((index, element) => {
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
                    let childComponent = new VueComponentTester(this.tester, `<${childComponentName}>${stub.template}</${childComponentName}>`, stub.props, this.component);
                    this.children[childComponentName] = childComponent;
                    this.config.stubs[childComponentName] = childComponent.toHtml();
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

        // Need to remove this ! parentComponent check for default slots in sub-components
        if (this.defaultSlot && ! parentComponent) {
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

        this.wrapper = vueTestUtils.mount(testComponent, this.config);

        this.vm = this.wrapper.vm;

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
        return this.wrapper.html();
    }

    dd()
    {
        dd(this.toHtml());
    }

    assertEmitted(eventName)
    {
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

        this.tester.assertNotContains(expression, this.toHtml(), `Assert that "${rawExpression}" should not exists on the page, but it was found.`);
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
        }).attr('style').replace(/\s/g,'') == 'display:none;';

        this.tester.assertTrue(isNotVisible);

        return this;
    }

    async assertHidden(text)
    {
        return await this.assertNotVisible(text);
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
