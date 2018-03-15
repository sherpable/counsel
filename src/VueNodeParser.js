module.exports = class VueNodeParser
{
    constructor(parsedTemplate, parsedComponentTemplate)
    {
        this.validHtmlTags = require('html-tags');
        this.minify = require('html-minifier').minify;

        this.parentComponent = parentComponent;

        this.tasks = [
            'getComponentName',
            'parseTemplate',
            'getComponent',
            'getComponentTemplate',
            'parseComponentTemplate',
            'parseChildNodes',
        ];

        this.parsedTemplate = parsedTemplate;
        this.parsedComponentTemplate = parsedComponentTemplate;

        this.result = {
            component: null,
            config: {
                slots: {
                    default: null,
                },
                stubs: {},
            },
        };

        this.htmlResult = null;
    }

    static parse(parsedTemplate, parsedComponentTemplate)
    {
        let parser = new this(parsedTemplate, parsedComponentTemplate);

        parser.tasks.forEach(task => {
            parser[task]();
        });

        return parser.result;
    }

    parseChildNodes()
    {
        this.result.config.slots.default = '';

        this.defaultSlot = '';

        let defaultSlot = '';

        let defaultSlotHtmlElement = null;

        this.parsedComponentTemplate.root().children().first().children().each((index, element) => {
            let child = counsel.serviceProviders.cheerio(element);

            let childTemplate = `<${element.name}>${child.html()}</${element.name}>`;

            if (! this.isValidHtmlTag(element.name)) {
                if (element.name == 'slot') {
                    childTemplate = this.parsedTemplate(this.componentName).html();
                    // console.log(childTemplate);
                }

                let childComponentConfig = VueTemplateParser.parse(
                    childTemplate,
                    this.component
                );

                console.log(childComponentConfig.component);

                if (element.name == 'slot') {
                    this.result.config.slots.default = VueComponentTestWrapper.wrap(childComponentConfig).toHtml();
                } else if (childComponentConfig.component) {
                    let childComponent = VueComponentTestWrapper.wrap(childComponentConfig);
                    this.result.config.stubs[element.name] = childComponent.toHtml();
                }
            }

            let children = child.children();

            if (children.length > 0) {
                children.each((index, childElement) => {
                    // console.log(child.html());
                    // let childComponent = new VueComponentTestWrapper(
                    //     VueTemplateParser.parse(child.html())
                    // );
                });
            }
        });

        let componentTemplateDefaultSlotExists = this.parsedComponentTemplate.root().find('slot:not([name])').length;

        let defaultSlotElement = false;

        if (componentTemplateDefaultSlotExists) {
            defaultSlotElement = this.parsedTemplate(this.componentName);
        }

        this.parsedComponentTemplate.root().find('slot[name]').each((index, element) => {
            let child = counsel.serviceProviders.cheerio(element);
            let namedSlotElement = this.parsedTemplate(`[slot="${child.attr('name')}"]`);

            let namedSlotName = namedSlotElement[0].name;
            let namedSlotHtml = `<${namedSlotName}>${namedSlotElement.html()}</${namedSlotName}>`;

            if (defaultSlotElement) {
                defaultSlotElement.find(`${namedSlotName}[slot="${child.attr('name')}"]`).remove();
            }

            this.result.config.slots[child.attr('name')] = VueTemplateParser.parse(namedSlotHtml, this.component);
        });

        if(defaultSlotElement && defaultSlotElement.length > 0) {
            let defaultSlotParentName = this.parsedComponentTemplate('slot').not('[name]').parent()[0].name;

            let cleanComponentTemplate = this.componentTemplate.replace(/\s+/g, '');
            let cleanSlotParentHtml = counsel.serviceProviders.cheerio.html(this.parsedComponentTemplate('slot').not('[name]').parent()).replace(/\s+/g, '');

            if (cleanSlotParentHtml != cleanComponentTemplate) {
                this.parsedComponentTemplate('slot').not('[name]').parent().replaceWith('<slot></slot>');
                this.component.options.template = this.parsedComponentTemplate.html();

                if (! this.result.config.slots.default) {
                    this.result.config.slots.default += VueTemplateParser.parse(
                        `<${defaultSlotParentName}>${defaultSlotElement.html()}</${defaultSlotParentName}>`,
                        this.component
                    );
                }
            } else if (! this.result.config.slots.default) {
                this.result.config.slots.default += VueTemplateParser.parse(defaultSlotElement.html(), this.component);
            }
        }
    }

    minifyHtml(html)
    {
        return this.minify(html, { collapseWhitespace: true })
    }

    isValidHtmlTag(name = false)
    {
        if (! name) {
            name = this.componentName;
        }

        return this.validHtmlTags.includes(this.componentName);
    }
}
