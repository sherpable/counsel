module.exports = class VueTemplateParserTest extends TestCase
{
    /** @test */
    it_is_able_to_parse_default_slots()
    {
        let vueTemplateParser = new VueTemplateParser(
            `<div><slot></slot></div>`,
            `<div>Test</div>`
        );
    }

    /** @test */
    it_is_able_to_parse_named_slots()
    {
        let vueTemplateParser = new VueTemplateParser(`
            <div>
                <header>
                    <slot name="header"></slot>
                </header>
                <main>
                    <slot></slot>
                </main>
                <footer>
                    <slot name="footer"></slot>
                </footer>
            </div>
        `,
        `
            <h1 slot="header">Here might be a page title</h1>

            <p>A paragraph for the main content.</p>
            <p>Another one.</p>

            <p slot="footer">Here's some contact info</p>
        `);
    }

    /** @test */
    it_is_able_to_parse_child_nodes()
    {
        let vueTemplateParser = new VueTemplateParser(`
            <div><slot></slot></div>
        `,
        `
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
        `);
    }
}
