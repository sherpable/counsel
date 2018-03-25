let Vue = require('vue');

const renderer = require('vue-server-renderer').createRenderer();

const VueComponentWrapper = require('./src/VueComponentWrapper');
const VueComponentTester = require('./src/VueComponentTester');

const component = {
  template: `
      <div>
      	<h1>{{ name }}</h1>
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
};


const app = VueComponentTester.test(template, component);
// console.log(app);
app.updateProductName('Foo');

console.log('done.');
process.exit();
