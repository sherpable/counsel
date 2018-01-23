module.exports = class HelloWorldVueComponentTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_to_render_a_dot_vue_component_file()
    {
        let component = this.render('<vue-hello-world></vue-hello-world>');

        // console.log(component);

        // component.changeText('Hello JSUnit');

        // component.assertSee('Hello JSUnit');
    }
}
