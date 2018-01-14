module.exports = class SingleSlotTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_render_a_single_slot_component()
    {
        let component = this.render('<single-slot><div>Test</div></single-slot>');

        this.assertEquals('<div><div>Test</div></div>', component.toHtml());
    }
}
