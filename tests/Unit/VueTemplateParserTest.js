module.exports = class VueTemplateParserTest extends TestCase
{
    /** @test */
    it_is_able_to_parse_default_slots()
    {
        let vueTemplateParser = new VueTemplateParser(`<single-slot><div>Test</div><single-slot>`);

        this.assertEquals({
            component: Vue.options.components['single-slot'],
            config: {
                slots: {
                    default: `<div>Test</div>`,
                },
            },
        }, vueTemplateParser);
    }

    /** @test */
    it_is_able_to_parse_named_slots()
    {
        let vueTemplateParser = new VueTemplateParser(`
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
                    default: `
                        <p>A paragraph for the main content.</p>
                        <p>Another one.</p>
                    `,
                    header: ` <h1>Here might be a page title</h1>`,
                    footer: `<p>Here's some contact info</p>`,
                },
            },
        }, vueTemplateParser);
    }

    /** @test */
    it_is_able_to_parse_child_nodes()
    {
        let vueTemplateParser = new VueTemplateParser(`
            <view-presentation>
                <app-layout>
                    <template slot="title">Nodue</template>
                    <template slot="slogan">{{ name }}</template>

                    <div>
                        <h2>PRODUCT NAME&nbsp;&mdash;&nbsp;#PRODUCT ID</h2>
                        <p>Product name is {{ name }}</p>
                        <hr>
                        <button class="button is-primary">Log something</button>
                        <hr>
                    </div>
                </app-layout>
            </view-presentation>
        `);

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
