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
		"io-tests/dot-reporter-success-reporting-test"
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
    env: {
        'APP_ENV': 'testing',
    },
}
