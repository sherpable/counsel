module.exports = class Test
{
    /**
     * Create a new Test instance.
     * 
     * @constructor
     * 
     * @param  {string}  className
     * @param  {string}  functionName
     */
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
