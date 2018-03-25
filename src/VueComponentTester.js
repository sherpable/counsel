module.exports = class VueComponentTester
{
    constructor(component, testCaseInstance = null)
    {
        let template = component.template.replace(/\r?\n?/g, '');
        this.template = template;
        this.html = null;
        this.props = {};
        this.tester = testCaseInstance;
        this.componentName = template.match(/<([^\s>]+)(\s|>)+/)[1];

        if (! this.component) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }

        this.component = component;

        this.props = this.parseProps();

       this.component.props = this.props;

        let originBeforeCreate = this.component.beforeCreate;
        this.component.beforeCreate = function()
        {
            let $on = this.$on;
            let $emit = this.$emit;

            this.$on = (name, callback) => {
                console.log('Trap $on');
                $on.bind(this)(name, callback);
            };

            this.$emit = (name, payload) => {
                console.log('Trap $emit');
                $emit.bind(this)(name, payload);
            };

            originBeforeCreate.bind(this)();
        }

        this.vm = new Vue(this.component);
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

    static test(component, testCaseInstance = null)
    {
        let tester = new this(component, testCaseInstance);

        return new Proxy(
            new VueComponentWrapper.wrap(tester.vm),
            {
                get(target, property, receiver)
                {
                    target.vm.$nextTick();

                    if (property == 'page') {
                        return target.vm;
                    }

                    if (typeof target[property] == 'function') {
                        return function(...args) {
                           return target[property](...args);
                        };
                    }

                    if (target[property] !== undefined) {
                        return target[property];
                    }

                    if (typeof target.vm[property] == 'function') {
                        return function(...args) {
                            return target.vm[property](...args);
                        };
                    }

                    if (target.vm[property] !== undefined) {
                        return target.vm[property];
                    }
                }
            }
        );
    }
}
