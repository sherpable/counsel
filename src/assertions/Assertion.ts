import { Reporter as ReporterContract } from '../Contracts/Reporters/Reporter';
import { Assertion as AssertionContract } from '../Contracts/Assertions/Assertion';

export class Assertion implements AssertionContract
{
    protected type: string = null;

    protected parameters: Array<any> = [];

    protected result: any = {};

    protected test: any = {};

    protected reporter: ReporterContract;

    protected error: any = null;

    protected pass: boolean = null;

    protected fail: boolean = null;

    protected actual: any = null;

    protected expected: any = null;

    protected message: string = null;

    protected contents: any = null;

    protected regex: RegExp = null;

    protected failureMessage: string = null;

    constructor(type: string, parameters: Array<any>, test: Object, reporter: ReporterContract)
    {
        this.type = type;
        this.parameters = parameters;
        this.test = test;
        this.reporter = reporter;
	}

    execute()
    {
        this.result = Assertions.executeAssertion(this.type, this.parameters);

        this.processResult();
    }

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

    passed()
    {
        return this.pass == true;
    }

    failed()
    {
        return this.fail == true;
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
