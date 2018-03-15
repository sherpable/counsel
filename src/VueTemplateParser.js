module.exports = class VueTemplateParser
{
    constructor(template)
    {
        this.validHtmlTags = require('html-tags');
        this.minify = require('html-minifier').minify;

        this.tasks = [
            'getComponentName',
            'parseTemplate',
            'getComponent',
            // 'getComponentTemplate',
            // 'parseComponentTemplate',
            // 'parseChildNodes',
        ];

        this.template = template;
        this.componentName = null;
        this.componentTemplate = null;
        this.parsedComponentTemplate = null;

        this.config = {
            slots: {
                default: '',
            },
            stubs: {},
        };
    }

    static parse(template)
    {
        let parser = new this(template);

        parser.tasks.forEach(task => {
            parser[task]();
        });

        return {
            component: parser.component,
            config: parser.config,
        };
    }

    getComponentName()
    {
        let matches = this.template.match(/<([^\s>]+)(\s|>)+/);

        if (! matches) {
            this.htmlResult = this.template;

            return;
        }

        this.componentName = matches[1];

        if (this.componentName.substr(-1) == '/') {
            this.componentName = this.componentName.slice(0, -1);
        }
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

        if (! this.component && ! this.isValidHtmlTag() && this.parentComponent && this.parentComponent.sealedOptions && this.parentComponent.sealedOptions.components) {
            this.component = this.parentComponent.sealedOptions.components[this.componentName];
        }

        if (! this.component && ! this.isValidHtmlTag() && this.parentComponent && this.parentComponent.components) {
            this.component = this.parentComponent.components[this.componentName];
        }

        if (! this.component && ! this.isValidHtmlTag()) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }
    }

    getComponentTemplate()
    {
        if (! this.isValidHtmlTag() && this.componentName) {
            if (this.component.options && this.component.options.template) {
                this.componentTemplate = this.component.options.template;
            } else if (this.component.template) {
                this.componentTemplate = this.component.template;
            }
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
        this.result.config = VueNodeParser.parse(this.parsedTemplate, this.parsedComponentTemplate);
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
