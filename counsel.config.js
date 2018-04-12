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
    autoloadFiles: [
        'tests/TestAutoloadFile.js',
    ],
    autoloadClasses: {
        TestAutoloadClassFile: 'tests/TestAutoloadClassFile.js',
    },
    env: {
        'APP_ENV': 'testing',
    },
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
