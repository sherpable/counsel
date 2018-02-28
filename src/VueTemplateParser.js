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
        this.testComponent = null;
    }

    static parse(template)
    {
        let parser = new this(template);

        parser.tasks.forEach(task => {
            parser[task]();
        });

        return parser.testComponent;
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
        let rootTagName = this.parsedComponentTemplate.root().children().first()[0].name;

        this.parsedComponentTemplate(rootTagName).children().each((index, element) => {
            if (element.name == 'slot') {
                this.testComponent = this.parsedTemplate(this.componentName).html();
            }
        });

        this.parsedTemplate(this.componentName).children().each((index, element) => {
            let tagName = element.tagName;
            // dd(tagName);
        });
    }
}
