module.exports = {
    reporter: './reporters/DotReporter',
	bootstrap: 'bootstrap',
	locations: [
		'tests',
	],
    autoloadFiles: [
        'tests/TestAutoloadFile.js',
    ],
    autoloadClasses: {
        TestAutoloadClassFile: 'tests/TestAutoloadClassFile.js',
    },
    instantiateClasses: {
        TestInstantiateClassFile: 'tests/TestInstantiateClassFile.js',
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
