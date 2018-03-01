module.exports = class VueTemplateParser
{
    constructor(template)
    {
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
    }

    static parse(template)
    {
        let parser = new this(template);

        parser.tasks.forEach(task => {
            parser[task]();
        });

        parser.result.component = parser.component;

        return parser.result;
    }

    getComponentName()
    {
        this.componentName = this.template.match(/<([^\s>]+)(\s|>)+/)[1];
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
        this.component = Vue.options.components[this.componentName];

        if (! this.component) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }
    }

    getComponentTemplate()
    {
        this.componentTemplate = this.component.options.template;
    }

    parseComponentTemplate()
    {
        this.parsedComponentTemplate = counsel.serviceProviders.cheerio.load(this.componentTemplate, {
            withDomLvl1: false,
            xmlMode: true,
        });
    }

    parseChildNodes()
    {
        this.defaultSlot = '';

        let defaultSlot = '';

        this.parsedTemplate(this.componentName).children().each((index, element) => {
            let tagName = element.name;
            let child = counsel.serviceProviders.cheerio(element);
            let childHtml = `<${tagName}>${child.html()}</${tagName}>`;

            if (Vue.options.components[tagName]) {
                this.result.
            }

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
}
