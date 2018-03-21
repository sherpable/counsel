module.exports = class VueStubParser
{
    constructor(component, htmlElement)
    {
        this.validHtmlTags = require('html-tags');

        this.component = component;
        this.htmlElement = htmlElement;
    }

    static parse(component, htmlElement)
    {
        let parser = new this(component, htmlElement);

        return parser.parseElement(htmlElement);
    }

    parseElement(htmlElement)
    {
        let stubs = {};

        htmlElement.children().each((index, element) => {
            let child = counsel.serviceProviders.cheerio(element);

            if (! this.isValidHtmlTag(element.name)) {
                let component = this.getComponent(element.name);
                let componentWrapper = VueComponentTestWrapper.wrap({
                    component: {
                        template: this.getComponentTemplate(component),
                    },
                    config: {},
                });

                stubs[element.name] = componentWrapper.html();
            }

            if (child.children()) {
                stubs = Object.assign(stubs, this.parseElement(child));
            }
        });

        return stubs;
    }

    getComponent(name)
    {
        let component = null;

        if (! name) {
            return;
        }

        component = Vue.options.components[name];

        if (! component && ! this.isValidHtmlTag(name) && this.component && this.component.sealedOptions && this.component.sealedOptions.components) {
            component = this.component.sealedOptions.components[name];
        }

        if (! component && ! this.isValidHtmlTag(name) && this.component && this.component.components) {
            component = this.component.components[name];
        }

        if (! component && ! this.isValidHtmlTag()) {
            throw new Error(`Component [${name}] don't exists.`);
        }

        return component;
    }

    getComponentTemplate(component)
    {
        if (component.options && component.options.template) {
            return component.options.template;
        } else if (component.template) {
            return component.template;
        }

        return null;
    }

    isValidHtmlTag(name)
    {
        return this.validHtmlTags.includes(name);
    }
}
