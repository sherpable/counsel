module.exports = {
    reporter: './reporters/DotReporter',
	bootstrap: 'bootstrap',
	vue: {
        require: () => {
            return require('vue');
        },
        referenceName: "Vue"
    },
	files: [
		"tests"
	],
    // assertionMacros: {
    //     assertNull: (actual, message) => {
    //         return new Assertion({
    //             pass: actual == null,
    //             message,
    //         });
    //     }
    // },
    // assertionMacros: './macros'
}
