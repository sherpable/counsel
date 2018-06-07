module.exports = {
    reporter: './reporters/DotReporter',
	vue: {
        require: () => {
            return require('vue');
        },
        referenceName: 'Vue'
    },
	locations: [
		'tests',
	],
    patterns: [
        'Test.js$',
        'test.js$',
        'Test.yaml$',
        'test.yaml$',
    ],
    env: {
        'APP_ENV': 'testing',
    }
}
