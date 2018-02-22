module.exports = class PageTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_to_render_a_page_component()
    {
        let component = this.render(`
            <view-presentation>
                <app-layout>
                    <template slot="title">Nodue</template>
                    <template slot="slogan">PRODUCT NAME</template>

                    <div>
                        <h2>PRODUCT NAME&nbsp;&mdash;&nbsp;#PRODUCT ID</h2>
                        <p>Product name is PRODUCT NAME</p>
                        <hr>
                        <button class="button is-primary" @click="log">Log something</button>
                        <hr>
                    </div>
                </app-layout>
            </view-presentation>
        `, { product: { id: 1, name: 'Product 1' } });

        console.log(component.toHtml());
    }
}
