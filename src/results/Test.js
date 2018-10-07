module.exports = class Test
{
	constructor(className, functionName)
	{
		this.className = className;

		this.functionName = functionName;

		this.failuresCount = 0;

		this.incomplete = false;

		this.skipped = false;

		this.results = [];

		this.message = '';
	}
}