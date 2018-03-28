const cheerio = require('cheerio');
const VueComponentWrapper = require('./VueComponentWrapper');
const bus = new Vue;

module.exports = class VueComponentTester
{
    constructor(template, testCaseInstance = null)
    {
        let component = {
            template,
        };

        this.parsedTemplate = cheerio.load(template);

        this.template = component.template.replace(/\r?\n?/g, '');
        this.html = null;
        this.props = {};
        this.tester = testCaseInstance;
        this.componentName = this.template.match(/<([^\s>]+)(\s|>)+/)[1];

        this.component = Vue.options.components[this.componentName];

        if (! this.component) {
            throw new Error(`Component [${this.componentName}] don't exists.`);
        }

        this.testComponent = this.component;

        this.props = this.parseProps();

        this.testComponent.props = this.props;

        let originBeforeCreate = this.testComponent.beforeCreate;
        this.testComponent.sealedOptions.beforeCreate = function beforeCreate()
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

            if (typeof originBeforeCreate == 'function') {
                originBeforeCreate.bind(this)();
            }
        }

        this.testComponent.extendOptions.beforeCreate = this.testComponent.sealedOptions.beforeCreate;
        this.testComponent.options.beforeCreate = this.testComponent.sealedOptions.beforeCreate;

        this.testComponent.methods = {};

        this.testComponent.methods.updateProductName = function updateProductName(name)
        {
            bus.$emit('updateProductName', name);
        }

        // this.testComponent.sealedOptions.template = template;
        // this.testComponent.extendOptions.template = template;
        // this.testComponent.options.template = template;

        // component.methods = this.testComponent.sealedOptions.methods;
        // component.props = this.testComponent.sealedOptions.props;
        // component.data = this.testComponent.sealedOptions.data;
        // component.created = this.testComponent.sealedOptions.created;

        // console.log(this.testVm._renderProxy.$options._base.options.components[this.componentName]);
        // process.exit();
        // this.vm = this.testVm._renderProxy._base.options.components[this.componentName];
        // this.vm = this.testVm._renderProxy.$options._base.options.components[this.componentName];

        this.vm = new Vue(this.testComponent);
        // console.log(this.vm);
        // process.exit();

        // console.log(this.vm);
        // process.exit();
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

    static test(template, testCaseInstance = null)
    {
        let tester = new this(template, testCaseInstance);

        return new Proxy(
            VueComponentWrapper.wrap(tester.vm),
            {
                get(target, property, receiver)
                {
                    // target.vm.$nextTick();

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

                    // console.log(target);
                    // process.exit();

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
