module.exports = class AssertNotContainsResult extends AssertionResult
{
    describeFailure()
    {
        return [
            'Value must not match expression:',
            '',
            this.beautify(this.contents),
            '',
            'Regular expression:',
            '',
            this.beautify(this.regex),
        ];
    }
}
