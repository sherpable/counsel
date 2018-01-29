module.exports = {
    reporter: './reporters/DotReporter',
	vue: {
        require: () => {
            return require('vue');
        },
        referenceName: 'Vue'
    },
	files: [
		"tests"
	]
}
