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

        return `Value must not match expression:\n\n${this.beautify(this.contents)}\n\nRegular expression:\n\n${this.beautify(this.regex)}`;
    }
}
