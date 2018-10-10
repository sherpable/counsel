import { Assertion as AssertionContract } from '../../Contracts/Assertions/Assertion';

export interface Reporter
{
    beforeEachAssertion(assertion: AssertionContract) : void;

    afterEachAssertion(assertion: AssertionContract) : void;

    afterEachPassedAssertion(assertion: AssertionContract) : void;

    afterEachFailedAssertion(assertion: AssertionContract) : void;

    indent(value: any) : string;

    visualDifference(actual: any, expected: any) : string;

    beautify(value: any) : string;
}