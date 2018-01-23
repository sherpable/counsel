path = require('path');

module.exports = {
	resolveLoader: {
	    alias: {
	      'counsel-loader': path.join(__dirname, './counsel-loader'),
	    },
 	},
    module: {
        rules: [{
        	test: /\.vue$/,
            use: 'counsel-loader',
        }],
    },
   //  resolve: {
	  //   alias: {
	  //     	'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
	  //   }
  	// }
};
