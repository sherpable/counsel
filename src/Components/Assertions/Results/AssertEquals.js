use('Assertion');

module.exports = class AssertEquals extends Assertion
{
    /**
     * Describe the failure for this assertion.
     * 
     * @return {array}
     */
    describeFailure()
    {
        return [
            '--- Expected',
            '+++ Actual',
            '@@ @@',
            '---',
            this.beautify(this.expected),
            '+++',
            this.beautify(this.actual),
            'Difference',
            this.visualDifference(),
        ];
    }
}
