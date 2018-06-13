module.exports = class AssertEqualsResult extends AssertionResult
{
    describeFailure()
    {
        return `--- Expected\n  +++ Actual\n  @@ @@\n  ---\n${this.beautify(this.expected)}\n  +++\n${this.beautify(this.actual)}\n  Difference\n${this.visualDifference()}`;
    }
}
