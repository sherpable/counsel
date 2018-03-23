module.exports = class PageTest extends VueComponentTestCase
{
    /** @test */
    it_is_able_to_render_a_page_component()
    {
        const renderer = require('vue-server-renderer').createRenderer();

        const app = new Vue({
          template: `
              <view-presentation>
                  <app-layout @foo="eventFooFired">
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
          `,

          data()
          {
            return {
                name: 'Test Product',
            }
          },

          methods: {
            updateProductName(name)
            {
                this.$emit('foo', {'foo': 'bar'});
                this.name = name;
            },

            // $emit(name, payload)
            // {
            //     console.log('fire event!');
            // },

            eventFooFired(payload)
            {
                console.log('event fired!');
            }
          }
        });

        // let pageComponent = vueTestUtils.mount(app);
        // console.log(pageComponent);

        renderer.renderToString(app, (err, html) => {
          if (err) throw err
          console.log(html.replace(' data-server-rendered="true"', ''));
        });

        app.updateProductName('FOO PRODUCT');
        process.exit();

        renderer.renderToString(app, (err, html) => {
          if (err) throw err
          console.log(html.replace(' data-server-rendered="true"', ''));
        });

        process.exit();

        let viewPresentation = {
            template: `<div><slot></slot></div>`,
        };

        let appLayoutTemplate = {
            template: `
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
                            <n-nav></n-nav>
                        </slot>

                        <slot></slot>

                        <footer-layout></footer-layout>
                    </div>
                </div>
            `,
        };

        let page = {
            template: `
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
            `,
        };

        let appLayout = {
            template: `
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
            `,
        }

        let navTemplate = {
            template: `
                <div class="tabs">
                    <ul>
                        <n-nav-item href="/">Home</n-nav-item>
                        <n-nav-item href="/products">Products</n-nav-item>
                        <n-nav-item href="/products/1">Product 1</n-nav-item>
                        <n-nav-item href="/products/2">Product 2</n-nav-item>
                        <n-nav-item href="/products/3">Product 3</n-nav-item>
                        <n-nav-item href="/products/4">Product 4</n-nav-item>
                        <n-nav-item href="/products/5">Product 5</n-nav-item>
                    </ul>
                </div>
            `,
        }

        let navComponent = vueTestUtils.mount(navTemplate, {
            stubs: {
                'n-nav-item': `
                    <li :class="{'is-active': isActive }"><a :href="href"><slot></slot></a></li>
                `,
            }
        });

        let appLayoutWrapper = vueTestUtils.mount(appLayoutTemplate, {
            stubs: {
                'footer-layout': `
                    <div>Footer</div>
                `,
                'n-nav': navComponent.html(),
            },
            slots: {
                default: `
                    <div>
                        <h2>PRODUCT NAME&nbsp;&mdash;&nbsp;#PRODUCT ID</h2>
                        <p>Product name is {{ name }}</p>
                        <hr>
                        <button class="button is-primary">Log something</button>
                        <hr>
                    </div>
                `,
            }
        });

        // console.log(appLayoutWrapper.html());
        // process.exit();

        let wrapper = vueTestUtils.mount(page, {
            stubs: {
                'view-presentation': `
                    <div><slot></slot></div>
                `,
                'app-layout': appLayoutWrapper.html(),
            },
        });

        console.log(wrapper.html());
        process.exit();

        let component = this.render(`
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
        `, { product: { id: 1, name: 'Product 1' } });

        console.log(component.toHtml());
    }
}
