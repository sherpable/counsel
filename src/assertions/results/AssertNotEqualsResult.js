module.exports = class AssertNotEqualsResult extends AssertionResult
{
    describeFailure()
    {
        return `Failed asserting that ${this.beautify(this.expected)} is not equal to ${this.beautify(this.actual)}.`;
    }
}
