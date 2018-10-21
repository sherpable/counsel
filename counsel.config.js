module.exports = {
    reporter: './Components/Reporters/DotReporter',
    vue: {
        require: () => {
            return require('vue');
        },
        referenceName: 'Vue'
    },
	bootstrap: 'bootstrap',
	locations: [
		'tests',
	],
    suites: {
        all: 'tests',
        unit: 'tests/Unit',
        io: 'tests/IO',
        'vue-components': 'tests/VueComponents',
    },
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
