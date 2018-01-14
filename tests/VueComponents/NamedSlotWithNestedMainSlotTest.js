module.exports = class NamedSlotTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_render_a_named_slot_component_with_default_slot_in_nested_element()
    {
        let component = this.render(`
            <named-slot-with-nested-main-slot>
                <h1 slot="header">Here might be a page title</h1>

                <p>A paragraph for the main content.</p>
                <p>Another one.</p>

                <p slot="footer">Here's some contact info</p>
            </named-slot-with-nested-main-slot>
        `);

        this.assertEquals(`<div><header><h1>Here might be a page title</h1></header> <main><div><p>A paragraph for the main content.</p><p>Another one.</p></div></main> <footer><p>Here's some contact info</p></footer></div>`, component.toHtml());
    }
}
