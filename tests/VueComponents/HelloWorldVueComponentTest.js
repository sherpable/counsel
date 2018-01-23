module.exports = class HelloWorldVueComponentTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_to_render_a_dot_vue_component_file()
    {
		Vue.component('hello-world-dot-vue-component', require('../../VueComponents/HelloWorld.vue'));

        let component = this.render('<hello-world-dot-vue-component greeting="Hello Vue Component"></hello-world-dot-vue-component>');
        component.assertSee('Hello Vue Component!');

        let component2 = this.render('<hello-world-dot-vue-component></hello-world-dot-vue-component>');
        component2.assertSee('Hello World!');
    }
}
