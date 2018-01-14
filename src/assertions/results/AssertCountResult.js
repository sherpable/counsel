module.exports = class AssertCountResult extends AssertionResult
{
    describeFailure()
    {
        return `Failed asserting that expected size ${this.beautify(this.expected)} matches actual size ${this.beautify(this.actual)}.`;
    }
}
