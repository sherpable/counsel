module.exports = class MenuTest extends VueComponentTestCase
{
    beforeEach()
    {
        this.component = this.render('<menu :items="items"></menu>', {
            items: ['Foo', 'Bar', 'Baz']
        });
    }

    /** @test */
    it_is_able_render_the_items_in_the_menu_component()
    {
        this.assertEquals('<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>', this.component.toHtml());

        this.component.setItems(['Foo', 'Bar']);

        this.assertEquals('<ul><li>Foo</li><li>Bar</li></ul>', this.component.toHtml());
    }

    /** @test */
    the_last_menu_item_contains_the_text_baz()
    {
        this.assertEquals('Baz', this.component.find('li:last-child').text());
    }
}
