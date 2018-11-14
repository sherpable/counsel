counsel_use('VueComponentTestCase');

module.exports = class TodoListTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_render_the_items_in_the_todo_list_component()
    {
        let items = ['Foo', 'Bar', 'Baz'];

        let component = this.render('<todo-list :items="items"></todo-list>', {
            items
        });

        this.assertEquals('<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>', component.toHtml());
    }
}
