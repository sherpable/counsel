module.exports = class VueTemplateParserTest extends TestCase
{
    /** @test */
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

    /** @test */
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

    /** @test */
    unit_it_is_able_to_render_sub_components()
    {
        Vue.component('hello-world-dot-vue-component', require('../../VueComponents/HelloWorld.vue'));

        let vueTemplateParser = VueComponentTestWrapper.wrap(
            VueTemplateParser.parse('<hello-world-dot-vue-component greeting="Foo Bar Hello World"></hello-world-dot-vue-component>')
        );

        console.log(vueTemplateParser.html());
    }

    /** @test */
    async it_is_able_to_parse_child_nodes()
    {
        let vueTemplateParser = VueTemplateParser.parse(`
            <view-presentation>
                <app-layout>
                    <div>Hello Counsel</div>

                    <div><simple-component></simple-component></div>

                    <h1>Foo</h1>
                </app-layout>
            </view-presentation>
        `);

        console.log(vueTemplateParser.html());

        process.exit();

        // console.log(vueTemplateParser);
        // console.log(VueComponentTestWrapper.wrap(vueTemplateParser).toHtml());

        process.exit();

        this.assertEquals({
            component: Vue.options.components['view-presentation'],
            config: {
                slots: {
                    default: `
                        <div>
                            <section class="hero is-primary is-bold">
                                <div class="hero-body">
                                    <div class="container">
                                        <h1 class="title">
                                            <slot name="title">{{ title }}</slot>
                                        </h1>
                                        <h2 class="subtitle">
                                            <slot name="slogan">{{ slogan }}</slot>
                                        </h2>
                                    </div>
                                </div>
                            </section>

                            <div class="container">

                                <slot name="nav">
                                    <nav></nav>
                                </slot>

                                <slot></slot>

                                <footer-layout></footer-layout>
                            </div>
                        </div>
                    `,
                },
            },
        }, vueTemplateParser);
    }
}
