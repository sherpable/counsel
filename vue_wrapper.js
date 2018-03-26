(async () => {
  global.Vue = require('vue');

  const renderer = require('vue-server-renderer').createRenderer();

  const VueComponentWrapper = require('./src/VueComponentWrapper');
  const VueComponentTester = require('./src/VueComponentTester');

  Vue.component('foo', {
    template: `
        <div>
        	<h1>{{ name }}</h1>
          <slot></slot>
        </div>
    `,

    props: {
    	foo: {
    		default: 'bar',
    	},
    },

    data()
    {
      return {
          name: 'Test Product',
      }
    },

      created()
      {
          this.$on('updateProductName', (payload) => this.productNameUpdated(payload));
      },

    methods: {
      updateProductName(name)
      {
      	this.name = name;
      	console.log('fire event!');
          this.$emit('updateProductName', {name});
      },

      productNameUpdated(payload)
      {
      	console.log('product name was upated.');
      	console.log(payload);
      },
    }
  });


  const app = VueComponentTester.test('<foo><span>SLOT</span></foo>');

  // console.log(app);
  app.updateProductName('Foo');


  let html = await app.toHtml();
  console.log(html);


  console.log('done.');
  process.exit();
})();
