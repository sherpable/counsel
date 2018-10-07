module.exports = class Assertion
{
	constructor(type, parameters, test, reporter)
	{
        this.type = type;
        this.parameters = parameters;
        this.test = test;
        this.reporter = reporter;
        this.error = null;
        this.pass = null;
        this.failed = null;
        this.actual = null;
        this.expected = null;
        this.message = null;
        this.contents = null;
        this.regex = null;
        this.failureMessage = null;
	}

    execute()
    {
        this.result = Assertions.executeAssertion(this.type, this.parameters);

        this.processResult();
    }

    processResult()
    {
        this.pass = this.result['pass'];
        this.failed = ! this.result['pass'];
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
            stack = counsel.serviceProviders.stackTrace.get();
        }

        delete this.result['pass'];
        delete this.result['actual'];
        delete this.result['expected'];
        delete this.result['message'];
        delete this.result['failureMessage'];
        delete this.result['contents'];
        delete this.result['regex'];
        delete this.result['error'];

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
            message = `${this.message}\n\n`;
        }

        if (this.describeFailure()) {
            message += this.reporter.indent(this.describeFailure());
        }

        return message;
    }

    describeFailure()
    {
        if (! this.failureMessage && ! this.actual) {
            return null;
        }

        return `${this.failureMessage}:\n\n${this.beautify(this.actual)}`;
    }

    visualDifference()
    {
        return this.reporter.visualDifference(this.actual, this.expected);
    }

    beautify(value)
    {
        if (counsel.isIOTestProcess) {
            return value;
        }

        return this.reporter.beautify(value);
    }
}
