use('VueComponentTestCase');

module.exports = class HelloWorldTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_to_change_the_component_text()
    {
        let component = this.render('<hello-world></hello-world>');

        component.changeText('Hello JSUnit');

        component.assertSee('Hello JSUnit');
    }

    /** @test */
    it_is_able_to_specify_a_text_color()
    {
        let component = this.render('<hello-world color="red"></hello-world>');

        this.assertSee('<div class="red">', component.toHtml());
    }

    /** @test */
    it_will_prevent_updating_its_text_with_some_bad_text()
    {
        let component = this.render('<hello-world></hello-world>');

        this.assertSee('Hello World', component.toHtml());

        component.changeText('Bad text');

        this.assertSee('Hello World', component.toHtml());
    }

    /** @test */
    it_is_able_to_change_the_compent_text_with_a_button()
    {
        let component = this.render('<hello-world></hello-world>');

        this.assertNotSee('From button', component.toHtml());

        component.click('button');

        this.assertSee('From button', component.toHtml());
    }

    /** @test */
    it_is_able_to_set_the_component_title_with_a_input_element()
    {
        let component = this.render('<hello-world></hello-world>');

        component.typeInto('input', 'My title');

        this.assertEquals('My title', component.find('h1').text());
    }
}
