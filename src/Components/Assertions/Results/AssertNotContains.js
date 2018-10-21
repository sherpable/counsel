use('Assertion');

module.exports = class AssertNotContains extends Assertion
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
