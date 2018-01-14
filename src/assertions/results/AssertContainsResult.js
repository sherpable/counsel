module.exports = class AssertContainsResult extends AssertionResult
{
    describeFailure()
    {
        return `Value must match expression:\n\n  ${this.beautify(this.contents)}\n\n  Regular expression:\n\n  ${this.beautify(this.regex)}`;
    }
}
