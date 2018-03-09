module.exports = class VueTemplateParser
{
    constructor(template)
    {
        this.validHtmlTags = require('html-tags');

        this.tasks = [
            'getComponentName',
            'parseTemplate',
            'getComponent',
            'getComponentTemplate',
            'parseComponentTemplate',
            'parseChildNodes',
        ];

        this.template = template;
        this.componentName = null;
        this.componentTemplate = null;
        this.parsedComponentTemplate = null;
        this.result = {
            component: null,
            config: {
                slots: {
                    default: null,
                },
            },
        };

        this.htmlResult = null;
    }

    static parse(template)
    {
        let parser = new this(template);

        parser.tasks.forEach(task => {
            parser[task]();
        });

        parser.result.component = parser.component;

        if (parser.htmlResult) {
            return parser.htmlResult;
        }

        return parser.result;
    }

    getComponentName()
    {
        let matches = this.template.match(/<([^\s>]+)(\s|>)+/);

        if (! matches) {
            this.htmlResult = this.template;

            return;
        }

        this.componentName = matches[1];
    }

    parseTemplate()
    {
        this.parsedTemplate = counsel.serviceProviders.cheerio.load(this.template, {
            withDomLvl1: false,
            xmlMode: true,
        });
    }

    getComponent()
    {
        if (! this.componentName) {
            return;
        }

        this.component = Vue.options.components[this.componentName];

        if (! this.component && ! this.isValidHtmlTag()) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }
    }

    getComponentTemplate()
    {
        if (! this.isValidHtmlTag() && this.componentName) {
            this.componentTemplate = this.component.options.template;
        }
    }

    parseComponentTemplate()
    {
        if (! this.componentTemplate) {
            this.parsedComponentTemplate = counsel.serviceProviders.cheerio.load(`<${this.componentName}></${this.componentName}`);
            return;
        }

        this.parsedComponentTemplate = counsel.serviceProviders.cheerio.load(this.componentTemplate, {
            withDomLvl1: false,
            xmlMode: true,
        });
    }

    parseChildNodes()
    {
        this.defaultSlot = '';

        let defaultSlot = '';

        this.parsedComponentTemplate.root().children().first().children().each((index, element) => {
            let child = counsel.serviceProviders.cheerio(element);

            let children = child.children();

            if (children.length > 0) {
                // let childComponent = new VueComponentTestWrapper(
                //     VueTemplateParser.parse(child.html())
                // );
            }
        });

        let defaultSlotElement = this.parsedTemplate(this.componentName);

        this.parsedComponentTemplate.root().find('slot[name]').each((index, element) => {
            let child = counsel.serviceProviders.cheerio(element);
            let namedSlotElement = this.parsedTemplate(`[slot="${child.attr('name')}"]`);
            let namedSlotName = namedSlotElement[0].name;
            let namedSlotHtml = `<${namedSlotName}>${namedSlotElement.html()}</${namedSlotName}>`;

            defaultSlotElement.find(`${namedSlotName}[slot="${child.attr('name')}"]`).remove();

            this.result.config.slots[child.attr('name')] =+ VueTemplateParser.parse(namedSlotHtml);
        });

        if(defaultSlotElement.length > 0) {
            this.result.config.slots.default =+ VueTemplateParser.parse(defaultSlotElement.html());
        }

        return;

        this.parsedTemplate(this.componentName).children().each((index, element) => {
            let tagName = element.name;
            let child = counsel.serviceProviders.cheerio(element);
            let childHtml = `<${tagName}>${child.html()}</${tagName}>`;

            // if (Vue.options.components[tagName]) {
            //     let childComponent = new VueComponentTestWrapper(
            //         VueTemplateParser.parse(childHtml)
            //     );
            //     console.log(childComponent);
            //     process.exit();
            // }

            if (child.attr('slot')) {
                this.result.config.slots[child.attr('slot')] = childHtml;
            } else {
                defaultSlot += childHtml;
            }
        });

        if (defaultSlot) {
            let defaultSlotParentName = (this.parsedComponentTemplate('slot').not('[name]').parent()[0].name);

            let cleanComponentTemplate = this.componentTemplate.replace(/\s+/g, '');
            let cleanSlotParentHtml = counsel.serviceProviders.cheerio.html(this.parsedComponentTemplate('slot').not('[name]').parent()).replace(/\s+/g, '');

            if (cleanSlotParentHtml != cleanComponentTemplate) {
                this.parsedComponentTemplate('slot').not('[name]').parent().replaceWith('<slot></slot>');
                this.component.options.template = this.parsedComponentTemplate('body').html();

                this.result.config.slots.default = `<${defaultSlotParentName}>${defaultSlot}</${defaultSlotParentName}>`;
            } else {
                this.result.config.slots.default = defaultSlot;
            }
        }
    }

    isValidHtmlTag()
    {
        return this.validHtmlTags.includes(this.componentName);
    }
}
