module.exports = class AssertionResult
{
	constructor(assertion, test, reporter, result = {})
	{
        this.assertion = assertion;
        this.test = test;
        this.reporter = reporter;
        this.error = null;
        this.pass = result['pass'];
        this.failed = ! result['pass'];
        this.actual = result['actual'];
        this.expected = result['expected'];
        this.message = result['message'];
        this.contents = result['contents'];
        this.regex = result['regex'];
		this.failureMessage = result['failureMessage'];

        let stack = null;

        if (result.error) {
            this.error = result.error.raw;
            stack = result.error.stack;
        } else {
            stack = counsel.serviceProviders.stackTrace.get();
        }

        delete result['pass'];
        delete result['actual'];
        delete result['expected'];
        delete result['message'];
        delete result['failureMessage'];
        delete result['contents'];
        delete result['regex'];
		delete result['error'];

		this.result = result;

        if (this.failed) {
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

    passed()
    {
        return this.pass == true;
    }

    failed()
    {
        return this.failed == true;
    }

    getFailureMessage()
    {
        let message = '';

        if (this.message) {
            message = `  ${this.message}\n\n`;
        }

        if (this.describeFailure()) {
            message += `  ${this.describeFailure()}`;
        }

        return message;
    }

    describeFailure()
    {
        if (! this.failureMessage && ! this.actual) {
            return null;
        }

        return `${this.failureMessage}:\n\n  ${this.beautify(this.actual)}`;
    }

    visualDifference()
    {
        return this.reporter.visualDifference(this.actual, this.expected);
    }

    beautify(value)
    {
        return this.reporter.beautify(value);
    }
}
