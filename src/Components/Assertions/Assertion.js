module.exports = class Assertion
{
    /**
     * Create a new Assertion instance.
     * 
     * @constructor
     * 
     * @param  {string}    type
     * @param  {array}     parameters
     * @param  {object}    test
     * @param  {Reporter}  reporter
     */
    constructor(type, parameters, test, reporter)
    {
        this.type = type;
        this.parameters = parameters;
        this.test = test;
        this.reporter = reporter;
        this.error = null;	
        this.pass = null;	
        this.fail = null;	
        this.actual = null;	
        this.expected = null;	
        this.message = null;	
        this.contents = null;	
        this.regex = null;	
        this.failureMessage = null;
	}

    /**
     * Execute the assertion.
     * 
     * @return {void}
     */
    execute()
    {
        this.result = Assertions.executeAssertion(this.type, this.parameters);

        this.processResult();
    }

    /**
     * Process the assertion execution results.
     * 
     * @return {void}
     */
    processResult()
    {
        this.pass = this.result['pass'];
        this.fail = ! this.result['pass'];
        this.actual = this.result['actual'];
        this.expected = this.result['expected'];
        this.message = this.result['message'];
        this.contents = this.result['contents'];
        this.regex = this.result['regex'];
        this.failureMessage = this.result['failureMessage'];

        let stack = null;

        if (this.result.error) {
            this.error = this.result.error.raw;
            stack = this.result.error.stack;
        } else {
            stack = counsel().serviceProviders.stackTrace.get();
        }

        delete this.result['pass'];
        delete this.result['actual'];
        delete this.result['expected'];
        delete this.result['message'];
        delete this.result['failureMessage'];
        delete this.result['contents'];
        delete this.result['regex'];
        delete this.result['error'];

        if (this.fail) {
            let rawError = null;
            if (this.error) {
                rawError = this.error;
            } else {
                rawError = new Error;
            }

            this.error = stack.filter(stackItem => {
                return stackItem.getFunctionName() == this.test.function;
            }).map(stackItem => {
                return {
                    typeName: stackItem.getTypeName(),
                    functionName: stackItem.getFunctionName(),
                    fileName: stackItem.getFileName(),
                    lineNumber: stackItem.getLineNumber(),
                    columnNumber: stackItem.getColumnNumber(),
                    isNative: stackItem.isNative(),
                };
            })[0];

            if (! this.error) {
                this.error = {};
            }

            this.error.raw = rawError;
        }
    }

    /**
     * Retrieve if this assertion passes or not.
     * 
     * @return {boolean}
     */
    passed()
    {
        return this.pass == true;
    }

    /**
     * Retrieve if this assertion failed or not.
     * 
     * @return {boolean}
     */
    failed()
    {
        return this.fail == true;
    }

    /**
     * Retrieve the failure message for this assertion.
     * 
     * @return {string}
     */
    getFailureMessage()
    {
        let message = '';

        if (this.message) {
            message = `${this.message}\n\n`;
        }

        if (this.describeFailure()) {
            message += this.reporter.indent(this.describeFailure());
        }

        return message;
    }

    /**
     * Describe the failure for this assertion.
     * 
     * @return {string|array}
     */
    describeFailure()
    {
        if (! this.failureMessage && ! this.actual) {
            return null;
        }

        return `${this.failureMessage}:\n\n${this.beautify(this.actual)}`;
    }

    /**
     * Visualize the difference between the actual and expected value for this assertion.
     * 
     * @return {string}
     */
    visualDifference()
    {
        return this.reporter.visualDifference(this.actual, this.expected);
    }

    /**
     * Beautify a given value. When running as an IO test it will not beautify,
     * this way IO test results will return a clean output. This will make
     * the output expectation cleaner.
     * 
     * @return {string}
     */
    beautify(value)
    {
        if (counsel().isIOTestProcess) {
            return value;
        }

        return this.reporter.beautify(value);
    }
}
