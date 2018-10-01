module.exports = {
    reporter: './reporters/DotReporter',
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
