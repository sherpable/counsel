module.exports = class VueTemplateParserTest extends TestCase
{
    /** @test-skip */
    it_is_able_to_parse_default_slots()
    {
        let vueTemplateParser = VueTemplateParser.parse(`<single-slot><h1>Test</h1></single-slot>`);

        this.assertEquals({
            component: Vue.options.components['single-slot'],
            config: {
                slots: {
                    default: `<h1>Test</h1>`,
                },
            },
        }, vueTemplateParser);
    }

    /** @test-skip */
    it_is_able_to_parse_named_slots()
    {
        let vueTemplateParser = VueTemplateParser.parse(`
            <named-slot>
                <h1 slot="header">Here might be a page title</h1>

                <p>A paragraph for the main content.</p>
                <p>Another one.</p>

                <p slot="footer">Here's some contact info</p>
            </named-slot>
        `);

        this.assertEquals({
            component: Vue.options.components['named-slot'],
            config: {
                slots: {
                    default: `<main><p>A paragraph for the main content.</p><p>Another one.</p></main>`,
                    header: `<h1>Here might be a page title</h1>`,
                    footer: `<p>Here&apos;s some contact info</p>`,
                },
            },
        }, vueTemplateParser);
    }

    /** @test-skip */
    unit_it_is_able_to_render_sub_components()
    {
        Vue.component('hello-world-dot-vue-component', require('../../VueComponents/HelloWorld.vue'));

        let vueTemplateParser = VueComponentTestWrapper.wrap(
            VueTemplateParser.parse('<hello-world-dot-vue-component greeting="Foo Bar Hello World"></hello-world-dot-vue-component>')
        );
    }
}
