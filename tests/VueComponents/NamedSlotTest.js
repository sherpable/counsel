counsel_use('VueComponentTestCase');

module.exports = class NamedSlotTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_render_a_named_slot_component()
    {
        let component = this.render(`
            <named-slot>
                <h1 slot="header">Here might be a page title</h1>

                <p>A paragraph for the main content.</p>
                <p>Another one.</p>

                <p slot="footer">Here's some contact info</p>
            </named-slot>
        `);

        this.assertEquals(`<div><header><h1>Here might be a page title</h1></header> <main><p>A paragraph for the main content.</p><p>Another one.</p></main> <footer><p>Here's some contact info</p></footer></div>`, component.toHtml());
    }
}
