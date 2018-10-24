use('Assertion');

module.exports = class AssertNotContains extends Assertion
{
    /**
     * Describe the failure for this assertion.
     * 
     * @return {array}
     */
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
