require('jsdom-global')();

global.Vue = require('vue');

let nodeHook = require('node-hook');
let cheerio = require('cheerio');

require('./bootstrap');

let vueTestUtils = require('@vue/test-utils');

            nodeHook.hook('.vue', (source, filename) => {

                let rawComponent = cheerio.load(source);
                let component = rawComponent('script').html();
                let template = rawComponent('template').html();

                return component.replace('module.exports = {', 'module.exports = { template: `' + template + '`,');
            });

let Foo = require('./VueComponents/HelloWorld.vue');

let wrapper = vueTestUtils.mount(Foo);

console.log(wrapper.html());